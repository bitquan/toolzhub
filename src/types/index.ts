export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  subscription?: Subscription;
  usageStats?: UsageStats;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  plan: 'free' | 'pro';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  customerId: string;
  subscriptionId?: string;
}

export interface UsageStats {
  qrCodesCreated: number;
  qrCodesThisMonth: number;
  totalScans: number;
  lastResetDate: Date;
}

export interface QRCode {
  id: string;
  userId: string;
  type: QRCodeType;
  data: QRCodeData;
  settings: QRCodeSettings;
  createdAt: Date;
  updatedAt: Date;
  scans: number;
  shortUrl?: string;
  analytics?: QRAnalytics[];
}

export type QRCodeType = 
  | 'url' 
  | 'wifi' 
  | 'vcard' 
  | 'sms' 
  | 'email' 
  | 'text' 
  | 'phone' 
  | 'whatsapp' 
  | 'location';

export interface QRCodeData {
  // URL type
  url?: string;
  
  // WiFi type
  ssid?: string;
  password?: string;
  security?: 'WEP' | 'WPA' | 'WPA2' | 'nopass';
  hidden?: boolean;
  
  // vCard type
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  
  // SMS type
  phoneNumber?: string;
  message?: string;
  
  // Email type
  emailAddress?: string;
  subject?: string;
  body?: string;
  
  // Text type
  text?: string;
  
  // WhatsApp type
  whatsappNumber?: string;
  whatsappMessage?: string;
  
  // Location type
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface QRCodeSettings {
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logo?: string; // Base64 encoded logo for Pro users
  logoSize?: number;
  margin?: number;
}

export interface QRAnalytics {
  id: string;
  qrCodeId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
}

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface QRGeneratorFormData {
  type: QRCodeType;
  data: QRCodeData;
  settings: QRCodeSettings;
}

export interface DashboardStats {
  totalQRCodes: number;
  totalScans: number;
  qrCodesThisMonth: number;
  scansByDay: { date: string; scans: number }[];
  topQRCodes: { id: string; data: QRCodeData; scans: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}