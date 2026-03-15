
export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  profilePicture: string | null
  phone?: string
  company?: string
  website?: string
  bio?: string
  location?: string
  timezone?: string
  language?: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  lastLoginAt: Date
  isAdmin: boolean
  plan: 'free' | 'pro' | 'business'
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid'
  subscriptionId?: string
  customerId?: string
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

export interface NotificationSettings {
  emailNotifications: {
    marketing: boolean
    security: boolean
    updates: boolean
    billing: boolean
    analytics: boolean
  }
  pushNotifications: {
    newLinks: boolean
    analytics: boolean
    security: boolean
  }
  smsNotifications: {
    security: boolean
    billing: boolean
  }
}

export interface BillingData {
  customerId: string
  subscriptionId?: string
  plan: 'free' | 'pro' | 'business'
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  paymentMethod?: {
    id: string
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
  }
}

export interface ActivityLog {
  id: string
  action: string
  description: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  location?: string
}

export interface UsageStats {
  qrCodesCreated: number
  qrCodesScanned: number
  linksClicked: number
  profileViews: number
  monthlyViews: number
  storageUsed: number // in MB
  bandwidthUsed: number // in MB
}

// Mock data for development
export const mockUserData: UserData = {
  id: "user123",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  profilePicture: null,
  phone: "+1-555-0123",
  company: "Tech Startup Inc.",
  website: "https://johndoe.com",
  bio: "Full-stack developer and tech enthusiast",
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
  language: "en",
  emailVerified: true,
  phoneVerified: false,
  twoFactorEnabled: false,
  createdAt: new Date("2024-01-15"),
  lastLoginAt: new Date("2024-12-20"),
  isAdmin: false,
  plan: "pro",
  subscriptionStatus: "active",
  subscriptionId: "sub_1234567890",
  customerId: "cus_1234567890",
  currentPeriodEnd: new Date("2025-01-15"),
  cancelAtPeriodEnd: false,
  trialEnd: undefined
}

export const mockNotificationSettings: NotificationSettings = {
  emailNotifications: {
    marketing: true,
    security: true,
    updates: true,
    billing: true,
    analytics: false
  },
  pushNotifications: {
    newLinks: true,
    analytics: false,
    security: true
  },
  smsNotifications: {
    security: true,
    billing: false
  }
}

export const mockBillingData: BillingData = {
  customerId: "cus_1234567890",
  subscriptionId: "sub_1234567890",
  plan: "pro",
  status: "active",
  currentPeriodStart: new Date("2024-12-15"),
  currentPeriodEnd: new Date("2025-01-15"),
  cancelAtPeriodEnd: false,
  paymentMethod: {
    id: "pm_1234567890",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2027
  }
}

export const mockActivityLog: ActivityLog[] = [
  {
    id: "1",
    action: "login",
    description: "Signed in to account",
    timestamp: new Date("2024-12-20T10:30:00"),
    ipAddress: "192.168.1.1",
    location: "San Francisco, CA"
  },
  {
    id: "2", 
    action: "profile_update",
    description: "Updated profile information",
    timestamp: new Date("2024-12-19T15:45:00"),
    ipAddress: "192.168.1.1",
    location: "San Francisco, CA"
  },
  {
    id: "3",
    action: "qr_created",
    description: "Created new QR code for website",
    timestamp: new Date("2024-12-18T09:15:00"),
    ipAddress: "192.168.1.1",
    location: "San Francisco, CA"
  },
  {
    id: "4",
    action: "password_change",
    description: "Changed account password",
    timestamp: new Date("2024-12-17T14:20:00"),
    ipAddress: "192.168.1.1",
    location: "San Francisco, CA"
  },
  {
    id: "5",
    action: "subscription_update",
    description: "Upgraded to Pro plan",
    timestamp: new Date("2024-12-15T11:00:00"),
    ipAddress: "192.168.1.1", 
    location: "San Francisco, CA"
  }
]

export const mockUsageStats: UsageStats = {
  qrCodesCreated: 47,
  qrCodesScanned: 1250,
  linksClicked: 892,
  profileViews: 3450,
  monthlyViews: 450,
  storageUsed: 25.6,
  bandwidthUsed: 1250.8
}
