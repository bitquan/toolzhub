import { useState, useEffect } from 'react';
import { QRCodeService } from '@/services/qrcode';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { QRCodeType, QRCodeData, QRCodeSettings } from '@/types';
import { Download, Copy, Share2, QrCode as QrCodeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

const QR_TYPES: { value: QRCodeType; label: string; icon: string }[] = [
  { value: 'url', label: 'Website URL', icon: '🌐' },
  { value: 'wifi', label: 'WiFi Network', icon: '📶' },
  { value: 'vcard', label: 'Contact Card', icon: '👤' },
  { value: 'sms', label: 'SMS Message', icon: '💬' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'text', label: 'Plain Text', icon: '📝' },
  { value: 'phone', label: 'Phone Number', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💚' },
  { value: 'location', label: 'Location', icon: '📍' },
];

// Pro-only QR types (visual indicator only for now)
const PRO_ONLY_TYPES = new Set<QRCodeType>([
  'wifi',
  'vcard',
  'sms',
  'email',
  'whatsapp',
  'location',
]);

export function QRGenerator() {
  const { user } = useAuth();
  const isPro = user?.subscription?.plan === 'pro';
  const { state: userData } = useUserData();
  const usage = userData?.stats?.qrCodesThisMonth ?? 0;
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

  const generateQRCode = async () => {
    const validation = QRCodeService.validateQRData(selectedType, qrData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    // Free plan monthly limit
    if (!isPro && usage >= 5) {
      toast.error(
        "You've reached the Free plan limit of 5 QR codes this month. Please upgrade to Pro to generate more."
      );
      return;
    }

    // Step 3: Gate Pro-only types for Free users
    if (!isPro && PRO_ONLY_TYPES.has(selectedType)) {
      toast.error(
        'This QR type is available on Pro. Please upgrade to use it.'
      );
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

      // Save after successful generation (non-blocking)
      if (user?.uid) {
        saveQRCodeToFirebase(generatedQR).catch((e) =>
          console.error('Save to Firebase failed', e)
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated QR to Firestore (component scope)
  async function saveQRCodeToFirebase(qrDataUrl: string) {
    if (!user?.uid) return;

    const typeMeta = QR_TYPES.find((t) => t.value === selectedType);
    const title = typeMeta ? `${typeMeta.label} QR` : 'QR Code';

    const docData = {
      userId: user.uid,
      type: selectedType,
      title,
      qrDataUrl, // image data URL
      data: qrData, // original inputs
      settings: qrSettings,
      scanCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'qrcodes'), docData);
      toast.success('Saved to your dashboard');
    } catch (err) {
      console.error('Failed to save QR to Firestore', err);
    }
  }

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
          {user && (
            <div className="mt-3 inline-flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isPro
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                Plan: {isPro ? 'Pro' : 'Free'}
              </span>
              {user.email && (
                <span className="text-xs text-gray-500">{user.email}</span>
              )}
            </div>
          )}
          {!isPro && user && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600">
              <span>
                Usage this month: <strong>{usage}</strong> / <strong>5</strong>
              </span>
            </div>
          )}
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
                    onClick={() => setSelectedType(type.value)}
                    disabled={!isPro && PRO_ONLY_TYPES.has(type.value)}
                    className={`relative p-3 rounded-lg border text-center transition-colors ${
                      selectedType === type.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {!isPro && PRO_ONLY_TYPES.has(type.value) && (
                      <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        PRO
                      </span>
                    )}
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
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
                    <option value="L">Low (~7%)</option>
                    <option value="M">Medium (~15%)</option>
                    <option value="Q">Quartile (~25%)</option>
                    <option value="H">High (~30%)</option>
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

            <button
              onClick={generateQRCode}
              disabled={isGenerating || (!isPro && usage >= 5)}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-5 w-5 mr-2" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  {!isPro && usage >= 5
                    ? 'Upgrade to continue'
                    : 'Generate QR Code'}
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

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={downloadQRCode}
                      className="btn-primary flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={copyQRCode}
                      className="btn-secondary flex items-center justify-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'QR Code',
                            text: 'Check out this QR code',
                            url: qrCode,
                          });
                        } else {
                          toast.error('Share not supported on this device');
                        }
                      }}
                      className="btn-outline flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <QrCodeIcon className="h-16 w-16 mb-4 text-gray-300" />
                  <p>Fill in the content and click "Generate QR Code"</p>
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
                placeholder="MyWiFiNetwork"
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
                value={qrData.security || 'WPA2'}
                onChange={(e) =>
                  setQrData((prev) => ({
                    ...prev,
                    security: e.target.value as any,
                  }))
                }
                className="input-field"
              >
                <option value="WPA2">WPA2</option>
                <option value="WPA">WPA</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
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
              placeholder="Enter your text here..."
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
                placeholder="example@email.com"
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
