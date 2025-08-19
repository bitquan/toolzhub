import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserDataContext';
import { subscriptionService } from '@/services/subscription';
import { useAnalytics } from '@/hooks/useAnalytics';
import { QRCodeService } from '@/services/qrcode';
import { QRCodeType, QRCodeData, QRCodeSettings } from '@/types';
import {
  Download,
  Copy,
  QrCode as QrCodeIcon,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';

// Free vs Pro QR Types Configuration
const PRO_QR_TYPES: QRCodeType[] = [
  'wifi',
  'vcard',
  'sms',
  'email',
  'whatsapp',
  'location',
];

const QR_TYPES: {
  value: QRCodeType;
  label: string;
  icon: string;
  isPro?: boolean;
}[] = [
  { value: 'url', label: 'Website URL', icon: '🌐' },
  { value: 'text', label: 'Plain Text', icon: '📝' },
  { value: 'phone', label: 'Phone Number', icon: '📞' },
  { value: 'wifi', label: 'WiFi Network', icon: '📶', isPro: true },
  { value: 'vcard', label: 'Contact Card', icon: '👤', isPro: true },
  { value: 'sms', label: 'SMS Message', icon: '💬', isPro: true },
  { value: 'email', label: 'Email', icon: '📧', isPro: true },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💚', isPro: true },
  { value: 'location', label: 'Location', icon: '📍', isPro: true },
];

export function QRGenerator() {
  const { user } = useAuth();
  const { state: userData, refreshQRCodes, refreshStats } = useUserData();
  const { trackQRGeneration } = useAnalytics();
  const [selectedType, setSelectedType] = useState<QRCodeType>('url');
  const [qrData, setQrData] = useState<QRCodeData>({});
  const [qrSettings, setQrSettings] = useState<QRCodeSettings>({
    size: 300,
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    errorCorrectionLevel: 'M',
    margin: 1,
  });
  const [qrCode, setQrCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User plan and usage information
  const isPro = user?.subscription?.plan === 'pro';
  const qrLimit = isPro ? Infinity : 5;
  const usage = userData.stats?.qrCodesThisMonth || 0;

  // Save QR code to Firebase
  const saveQRCodeToFirebase = async (qrDataUrl: string) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    const qrString = QRCodeService.generateQRData(selectedType, qrData);

    // Generate a title for the QR code
    let title = '';
    switch (selectedType) {
      case 'url':
        title = qrData.url || 'Website QR Code';
        break;
      case 'text':
        title = qrData.text?.substring(0, 30) + '...' || 'Text QR Code';
        break;
      case 'phone':
        title = `Call ${qrData.phoneNumber}` || 'Phone QR Code';
        break;
      case 'wifi':
        title = `WiFi: ${qrData.ssid}` || 'WiFi QR Code';
        break;
      case 'vcard':
        title =
          `${qrData.firstName || ''} ${qrData.lastName || ''}`.trim() ||
          'Contact QR Code';
        break;
      case 'sms':
        title = `SMS to ${qrData.phoneNumber}` || 'SMS QR Code';
        break;
      case 'email':
        title = `Email to ${qrData.emailAddress}` || 'Email QR Code';
        break;
      case 'whatsapp':
        title = `WhatsApp ${qrData.whatsappNumber}` || 'WhatsApp QR Code';
        break;
      case 'location':
        title = qrData.locationName || 'Location QR Code';
        break;
      default:
        title = 'QR Code';
    }

    const qrCodeDoc = {
      userId: user.uid,
      type: selectedType,
      title: title,
      url: qrString, // The actual QR data
      qrDataUrl: qrDataUrl, // The generated QR code image
      data: qrData, // Original input data
      settings: qrSettings,
      scanCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'qrcodes'), qrCodeDoc);
    return docRef.id;
  };

  const generateQRCode = async () => {
    // Check usage limits for free users
    if (!isPro && usage >= qrLimit) {
      toast.error(
        `You've reached your monthly limit of ${qrLimit} QR codes. Upgrade to Pro for unlimited codes!`
      );
      return;
    }

    // Check if the selected type is available for the user's plan
    if (!isPro && PRO_QR_TYPES.includes(selectedType)) {
      toast.error(
        `${
          QR_TYPES.find((t) => t.value === selectedType)?.label
        } is a Pro feature. Upgrade to Pro to unlock all QR types!`
      );
      return;
    }

    const validation = QRCodeService.validateQRData(selectedType, qrData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setIsGenerating(true);
      const generatedQR = await QRCodeService.generateQRCode(
        selectedType,
        qrData,
        qrSettings
      );
      setQrCode(generatedQR);

      // Save QR code to Firebase automatically
      try {
        setIsSaving(true);
        await saveQRCodeToFirebase(generatedQR);
        // Track successful QR generation
        trackQRGeneration(selectedType);
        toast.success('QR code generated and saved successfully!');

        // Refresh user data to update the stats and recent QR codes
        await Promise.all([refreshQRCodes(), refreshStats()]);
      } catch (saveError: any) {
        console.error('Failed to save QR code:', saveError);
        toast.success('QR code generated successfully!');
        toast.error('Failed to save QR code to your account');
      } finally {
        setIsSaving(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgradeClick = async () => {
    if (!user) {
      toast.error('Please log in to upgrade to Pro');
      return;
    }

    try {
      await subscriptionService.upgradeToProWithRedirect(user);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(
        `Failed to start upgrade process: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleTypeSelection = (type: QRCodeType) => {
    const typeConfig = QR_TYPES.find((t) => t.value === type);

    // If it's a Pro feature and user is not Pro, show upgrade prompt
    if (!isPro && typeConfig?.isPro) {
      toast.error(
        `${typeConfig.label} is a Pro feature. Upgrade to unlock all QR types!`
      );
      return;
    }

    setSelectedType(type);
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCode;
    link.click();
    toast.success('QR code downloaded!');
  };

  const copyQRCode = async () => {
    if (!qrCode) return;

    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('QR code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy QR code');
    }
  };

  useEffect(() => {
    // Reset data when type changes
    setQrData({});
    setQrCode('');
  }, [selectedType]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600">
            Create professional QR codes for any purpose
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Form */}
          <div className="space-y-6">
            {/* Type Selection */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                QR Code Type
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QR_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelection(type.value)}
                    className={`relative p-3 rounded-lg border text-center transition-colors ${
                      selectedType === type.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : type.isPro && !isPro
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={type.isPro && !isPro}
                  >
                    {type.isPro && !isPro && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center">
                          <Crown className="h-3 w-3 mr-0.5" />
                          PRO
                        </div>
                      </div>
                    )}
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                    {type.isPro && !isPro && (
                      <div className="text-xs text-yellow-600 mt-1 font-medium">
                        Upgrade Required
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Input */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Content
              </h2>
              {renderDataInputs()}
            </div>

            {/* Settings */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customization
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                    value={qrSettings.size}
                    onChange={(e) =>
                      setQrSettings((prev) => ({
                        ...prev,
                        size: parseInt(e.target.value),
                      }))
                    }
                    className="input-field"
                  >
                    <option value={200}>200x200</option>
                    <option value={300}>300x300</option>
                    <option value={500}>500x500</option>
                    <option value={1000}>1000x1000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Error Correction
                  </label>
                  <select
                    value={qrSettings.errorCorrectionLevel}
                    onChange={(e) =>
                      setQrSettings((prev) => ({
                        ...prev,
                        errorCorrectionLevel: e.target.value as any,
                      }))
                    }
                    className="input-field"
                  >
                    <option value="L">Low</option>
                    <option value="M">Medium</option>
                    <option value="Q">Quartile</option>
                    <option value="H">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foreground Color
                  </label>
                  <input
                    type="color"
                    value={qrSettings.foregroundColor}
                    onChange={(e) =>
                      setQrSettings((prev) => ({
                        ...prev,
                        foregroundColor: e.target.value,
                      }))
                    }
                    className="input-field h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={qrSettings.backgroundColor}
                    onChange={(e) =>
                      setQrSettings((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="input-field h-10"
                  />
                </div>
              </div>
            </div>

            {/* Usage Status for Free Users */}
            {!isPro && (
              <div className="card p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">
                      Free Plan Usage
                    </span>
                  </div>
                  <span className="text-sm text-yellow-700">
                    {usage}/{qrLimit} QR codes this month
                  </span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((usage / qrLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                {usage >= qrLimit ? (
                  <div className="text-xs text-yellow-700">
                    Limit reached. Upgrade to Pro for unlimited QR codes!
                  </div>
                ) : (
                  <div className="text-xs text-yellow-700">
                    {qrLimit - usage} QR codes remaining this month
                  </div>
                )}
                <button
                  onClick={handleUpgradeClick}
                  className="mt-2 w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  <Crown className="h-4 w-4 inline mr-1" />
                  Upgrade to Pro
                </button>
              </div>
            )}

            <button
              onClick={generateQRCode}
              disabled={
                isGenerating || isSaving || (!isPro && usage >= qrLimit)
              }
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating || isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-5 w-5 mr-2" />
                  {isGenerating ? 'Generating...' : 'Saving...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Generate QR Code
                </div>
              )}
            </button>
          </div>

          {/* Preview and Download */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Preview
              </h2>

              {qrCode ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={qrCode}
                      alt="Generated QR Code"
                      className="max-w-full h-auto border border-gray-200 rounded-lg"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 btn-secondary py-2 text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={copyQRCode}
                      className="flex-1 btn-secondary py-2 text-sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <QrCodeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Your QR code will appear here</p>
                  <p className="text-sm">
                    Fill in the content and click "Generate QR Code"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderDataInputs() {
    switch (selectedType) {
      case 'url':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={qrData.url || ''}
              onChange={(e) =>
                setQrData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://example.com"
              className="input-field"
            />
          </div>
        );

      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Content
            </label>
            <textarea
              value={qrData.text || ''}
              onChange={(e) =>
                setQrData((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="Enter your text here"
              rows={4}
              className="input-field"
            />
          </div>
        );

      case 'phone':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={qrData.phoneNumber || ''}
              onChange={(e) =>
                setQrData((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              placeholder="+1234567890"
              className="input-field"
            />
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={qrData.ssid || ''}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, ssid: e.target.value }))
                }
                placeholder="My WiFi Network"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={qrData.password || ''}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="WiFi password"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Type
              </label>
              <select
                value={qrData.security || 'WPA'}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, security: e.target.value as 'WEP' | 'WPA' | 'WPA2' | 'nopass' }))
                }
                className="input-field"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={qrData.firstName || ''}
                  onChange={(e) =>
                    setQrData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="John"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={qrData.lastName || ''}
                  onChange={(e) =>
                    setQrData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Doe"
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={qrData.phoneNumber || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder="+1234567890"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={qrData.emailAddress || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    emailAddress: e.target.value,
                  }))
                }
                placeholder="john@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={qrData.organization || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
                placeholder="Company Name"
                className="input-field"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={qrData.phoneNumber || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder="+1234567890"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={qrData.message || ''}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Your SMS message"
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={qrData.emailAddress || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    emailAddress: e.target.value,
                  }))
                }
                placeholder="recipient@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={qrData.subject || ''}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Email subject"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                value={qrData.body || ''}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Email message"
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={qrData.whatsappNumber || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    whatsappNumber: e.target.value,
                  }))
                }
                placeholder="+1234567890"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-filled Message (Optional)
              </label>
              <textarea
                value={qrData.message || ''}
                onChange={(e) =>
                  setQrData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Hello! I scanned your QR code."
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={qrData.locationName || ''}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    locationName: e.target.value,
                  }))
                }
                placeholder="My Business"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={qrData.latitude || ''}
                  onChange={(e) =>
                    setQrData((prev) => ({
                      ...prev,
                      latitude: parseFloat(e.target.value),
                    }))
                  }
                  placeholder="40.7128"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={qrData.longitude || ''}
                  onChange={(e) =>
                    setQrData((prev) => ({
                      ...prev,
                      longitude: parseFloat(e.target.value),
                    }))
                  }
                  placeholder="-74.0060"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      // Add more cases for other types...
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Please select a QR code type to begin</p>
          </div>
        );
    }
  }
}
