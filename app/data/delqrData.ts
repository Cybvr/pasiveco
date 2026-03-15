
export interface QRCodeData {
  id: string
  name: string
  url: string
  size: number
  foreground: string
  background: string
  margin: number
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  logo?: string
  logoSize: number
  enabled: boolean
  scanCount: number
  lastScanned?: Date
  createdAt: Date
}

export const defaultQRData: QRCodeData = {
  id: "default-qr",
  name: "Profile QR Code",
  url: "https://pasive.co/@username",
  size: 200,
  foreground: "#000000",
  background: "#ffffff",
  margin: 4,
  errorCorrectionLevel: "M",
  logoSize: 40,
  enabled: true,
  scanCount: 0,
  createdAt: new Date()
}

export const qrCodesData: QRCodeData[] = [
  {
    id: "profile-qr",
    name: "Profile QR Code",
    url: "https://pasive.co/@jide",
    size: 200,
    foreground: "#000000",
    background: "#ffffff",
    margin: 4,
    errorCorrectionLevel: "M",
    logoSize: 40,
    enabled: true,
    scanCount: 127,
    lastScanned: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01')
  },
  {
    id: "portfolio-qr",
    name: "Portfolio QR",
    url: "https://portfolio.example.com",
    size: 250,
    foreground: "#2563eb",
    background: "#eff6ff",
    margin: 1,
    errorCorrectionLevel: "H",
    logoSize: 45,
    enabled: true,
    scanCount: 89,
    lastScanned: new Date('2024-01-14'),
    createdAt: new Date('2024-01-05')
  }
]
