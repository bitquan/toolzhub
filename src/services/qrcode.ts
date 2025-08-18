import QRCode from 'qrcode';
import { QRCodeType, QRCodeData, QRCodeSettings } from '@/types';

export class QRCodeService {
  private static generateVCardData(data: QRCodeData): string {
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      data.firstName && data.lastName ? `FN:${data.firstName} ${data.lastName}` : '',
      data.firstName ? `N:${data.lastName || ''};${data.firstName};;;` : '',
      data.organization ? `ORG:${data.organization}` : '',
      data.title ? `TITLE:${data.title}` : '',
      data.phone ? `TEL:${data.phone}` : '',
      data.email ? `EMAIL:${data.email}` : '',
      data.website ? `URL:${data.website}` : '',
      data.address ? `ADR:;;${data.address};;;;` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
  }

  private static generateWiFiData(data: QRCodeData): string {
    const { ssid, password, security = 'WPA2', hidden = false } = data;
    return `WIFI:T:${security};S:${ssid};P:${password || ''};H:${hidden ? 'true' : 'false'};;`;
  }

  private static generateSMSData(data: QRCodeData): string {
    const { phoneNumber, message } = data;
    return `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
  }

  private static generateEmailData(data: QRCodeData): string {
    const { emailAddress, subject, body } = data;
    let emailString = `mailto:${emailAddress}`;
    
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    
    const queryString = params.toString();
    if (queryString) emailString += `?${queryString}`;
    
    return emailString;
  }

  private static generateWhatsAppData(data: QRCodeData): string {
    const { whatsappNumber, whatsappMessage } = data;
    return `https://wa.me/${whatsappNumber}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`;
  }

  private static generateLocationData(data: QRCodeData): string {
    const { latitude, longitude, locationName } = data;
    return `geo:${latitude},${longitude}${locationName ? `?q=${encodeURIComponent(locationName)}` : ''}`;
  }

  static generateQRData(type: QRCodeType, data: QRCodeData): string {
    switch (type) {
      case 'url':
        return data.url || '';
      case 'wifi':
        return this.generateWiFiData(data);
      case 'vcard':
        return this.generateVCardData(data);
      case 'sms':
        return this.generateSMSData(data);
      case 'email':
        return this.generateEmailData(data);
      case 'text':
        return data.text || '';
      case 'phone':
        return `tel:${data.phoneNumber || ''}`;
      case 'whatsapp':
        return this.generateWhatsAppData(data);
      case 'location':
        return this.generateLocationData(data);
      default:
        return '';
    }
  }

  static async generateQRCode(
    type: QRCodeType,
    data: QRCodeData,
    settings: QRCodeSettings
  ): Promise<string> {
    const qrData = this.generateQRData(type, data);
    
    if (!qrData) {
      throw new Error('Invalid QR code data');
    }

    const options = {
      errorCorrectionLevel: settings.errorCorrectionLevel,
      type: 'image/png' as const,
      quality: 0.92,
      margin: settings.margin || 1,
      color: {
        dark: settings.foregroundColor,
        light: settings.backgroundColor,
      },
      width: settings.size,
    };

    try {
      return await QRCode.toDataURL(qrData, options);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateQRCodeSVG(
    type: QRCodeType,
    data: QRCodeData,
    settings: QRCodeSettings
  ): Promise<string> {
    const qrData = this.generateQRData(type, data);
    
    if (!qrData) {
      throw new Error('Invalid QR code data');
    }

    const options = {
      errorCorrectionLevel: settings.errorCorrectionLevel,
      type: 'svg' as const,
      margin: settings.margin || 1,
      color: {
        dark: settings.foregroundColor,
        light: settings.backgroundColor,
      },
      width: settings.size,
    };

    try {
      return await QRCode.toString(qrData, options);
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  static getQRCodeTypeLabel(type: QRCodeType): string {
    const labels: Record<QRCodeType, string> = {
      url: 'Website URL',
      wifi: 'WiFi Network',
      vcard: 'Contact Card',
      sms: 'SMS Message',
      email: 'Email',
      text: 'Plain Text',
      phone: 'Phone Number',
      whatsapp: 'WhatsApp',
      location: 'Location',
    };
    return labels[type] || type;
  }

  static getQRCodeTypeIcon(type: QRCodeType): string {
    const icons: Record<QRCodeType, string> = {
      url: '🌐',
      wifi: '📶',
      vcard: '👤',
      sms: '💬',
      email: '📧',
      text: '📝',
      phone: '📞',
      whatsapp: '💚',
      location: '📍',
    };
    return icons[type] || '📱';
  }

  static validateQRData(type: QRCodeType, data: QRCodeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'url':
        if (!data.url) {
          errors.push('URL is required');
        } else if (!this.isValidURL(data.url)) {
          errors.push('Please enter a valid URL');
        }
        break;
      case 'wifi':
        if (!data.ssid) errors.push('WiFi network name (SSID) is required');
        if (data.security !== 'nopass' && !data.password) {
          errors.push('Password is required for secured networks');
        }
        break;
      case 'vcard':
        if (!data.firstName && !data.lastName) {
          errors.push('At least first name or last name is required');
        }
        if (data.email && !this.isValidEmail(data.email)) {
          errors.push('Please enter a valid email address');
        }
        break;
      case 'sms':
        if (!data.phoneNumber) errors.push('Phone number is required');
        break;
      case 'email':
        if (!data.emailAddress) {
          errors.push('Email address is required');
        } else if (!this.isValidEmail(data.emailAddress)) {
          errors.push('Please enter a valid email address');
        }
        break;
      case 'text':
        if (!data.text) errors.push('Text content is required');
        break;
      case 'phone':
        if (!data.phoneNumber) errors.push('Phone number is required');
        break;
      case 'whatsapp':
        if (!data.whatsappNumber) errors.push('WhatsApp number is required');
        break;
      case 'location':
        if (data.latitude === undefined || data.longitude === undefined) {
          errors.push('Latitude and longitude are required');
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  }

  private static isValidURL(string: string): boolean {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}