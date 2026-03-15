
import type React from "react"
import { useState, useEffect } from "react"
import { Palette, ImageIcon, RotateCcw, Settings, LayoutGrid } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { createQRCode, updateQRCode, QRCodeRecord } from "@/services/qrCodeService"
import { useAuth } from "@/hooks/useAuth"
import QRCodePreview from "./QRCodePreview"
import { cn } from "@/lib/utils"

interface QRModeProps {
  profileUrl?: string
  onQRGenerated?: (canvas: HTMLCanvasElement, downloadFn: () => void, copyFn: () => Promise<void>) => void
  onQRDataChange?: (qrData: QRCodeRecord) => void
}

interface QRCodeOptions {
  foreground: string
  background: string
  size: number
  margin: number
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  logo?: string
  logoSize: number
  qrStyle?: "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded"
}

const QRMode: React.FC<QRModeProps> = ({ 
  profileUrl = "https://pasive.co/@username", 
  onQRGenerated,
  onQRDataChange 
}) => {
  const { user } = useAuth()
  const [qrData, setQrData] = useState<QRCodeRecord>({
    userId: user?.uid || '',
    name: 'Profile QR Code',
    url: profileUrl,
    type: 'profile',
    foreground: '#000000',
    background: '#ffffff',
    size: 200,
    margin: 4,
    errorCorrectionLevel: 'M',
    logoSize: 40,
    scanCount: 0,
    isActive: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  })

  useEffect(() => {
    if (user?.uid && !qrData.userId) {
      setQrData(prev => ({ ...prev, userId: user.uid }))
    }
  }, [user?.uid, qrData.userId])

  const [qrOptions, setQROptions] = useState<QRCodeOptions>({
    foreground: qrData.foreground,
    background: qrData.background,
    size: qrData.size,
    margin: qrData.margin,
    errorCorrectionLevel: qrData.errorCorrectionLevel,
    logoSize: qrData.logoSize,
    qrStyle: qrData.qrStyle || "square",
  })

  const [copied, setCopied] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const colorPresets = [
    { fg: "#000000", bg: "#ffffff", name: "Classic" },
    { fg: "#ffffff", bg: "#000000", name: "Inverse" },
    { fg: "#1f2937", bg: "#f3f4f6", name: "Subtle" },
    { fg: "#dc2626", bg: "#fef2f2", name: "Red" },
    { fg: "#2563eb", bg: "#eff6ff", name: "Blue" },
    { fg: "#059669", bg: "#ecfdf5", name: "Green" },
    { fg: "#7c3aed", bg: "#f5f3ff", name: "Purple" },
    { fg: "#ea580c", bg: "#fff7ed", name: "Orange" },
  ]

  useEffect(() => {
    const updatedQrData = {
      ...qrData,
      url: profileUrl,
      foreground: qrOptions.foreground,
      background: qrOptions.background,
      size: qrOptions.size,
      margin: qrOptions.margin,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      logoSize: qrOptions.logoSize,
      logo: logo || undefined,
      qrStyle: qrOptions.qrStyle
    }
    
    // Check if data actually changed to avoid unnecessary updates
    if (
      qrData.url !== updatedQrData.url ||
      qrData.foreground !== updatedQrData.foreground ||
      qrData.background !== updatedQrData.background ||
      qrData.size !== updatedQrData.size ||
      qrData.margin !== updatedQrData.margin ||
      qrData.errorCorrectionLevel !== updatedQrData.errorCorrectionLevel ||
      qrData.logoSize !== updatedQrData.logoSize ||
      qrData.logo !== updatedQrData.logo ||
      qrData.qrStyle !== updatedQrData.qrStyle
    ) {
      setQrData(updatedQrData)
      if (onQRDataChange) {
        onQRDataChange(updatedQrData)
      }
    }
  }, [profileUrl, qrOptions, logo, onQRDataChange])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogo(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const resetToDefaults = () => {
    setQROptions({
      foreground: "#000000",
      background: "#ffffff",
      size: 200,
      margin: 4,
      errorCorrectionLevel: "M",
      logoSize: 40,
      qrStyle: "square",
    })
    setLogo(null)
  }

  const saveQRCode = async () => {
    if (!user) return

    setSaving(true)
    try {
      if (qrData.id) {
        await updateQRCode(qrData.id, {
          ...qrData,
          updatedAt: new Date() as any
        })
      } else {
        const { id, scanCount, createdAt, updatedAt, ...createData } = qrData;
        await createQRCode({
          ...createData,
          userId: user.uid
        })
      }
    } catch (error) {
      console.error('Error saving QR code:', error)
    } finally {
      setSaving(false)
    }
  }

  const TriggerStyle = "flex w-full items-center text-[13px] font-medium rounded-lg transition-all duration-200 px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground group data-[state=open]:text-foreground"
  const IconStyle = "h-4 w-4 mr-2.5 transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground"

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4 px-2.5">

      <Accordion type="multiple" className="space-y-2">
        {/* Colors */}
        <AccordionItem value="colors" className="border-none">
          <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
            <div className="flex items-center">
              <Palette className={IconStyle} />
              <span>Colors</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2.5 px-1 pb-1.5">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setQROptions((prev) => ({
                          ...prev,
                          foreground: preset.fg,
                          background: preset.bg,
                        }))
                      }
                      className="p-2 rounded-lg border border-border hover:border-primary transition-colors text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded border"
                          style={{ backgroundColor: preset.bg, borderColor: preset.fg }}
                        >
                          <div className="w-2 h-2 rounded-sm m-0.5" style={{ backgroundColor: preset.fg }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrOptions.foreground}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, foreground: e.target.value }))}
                    className="w-8 h-8 rounded border border-border bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrOptions.foreground}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, foreground: e.target.value }))}
                    className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrOptions.background}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, background: e.target.value }))}
                    className="w-8 h-8 rounded border border-border bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrOptions.background}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, background: e.target.value }))}
                    className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Style */}
        <AccordionItem value="style" className="border-none">
          <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
            <div className="flex items-center">
              <LayoutGrid className={IconStyle} />
              <span>Style</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2.5 px-1 pb-1.5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Dot Pattern</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "square", label: "Square" },
                    { value: "dots", label: "Dots" },
                    { value: "rounded", label: "Rounded" },
                    { value: "extra-rounded", label: "Extra Rounded" },
                    { value: "classy", label: "Classy" },
                    { value: "classy-rounded", label: "Classy Rounded" },
                  ].map((styleOption) => (
                    <button
                      key={styleOption.value}
                      onClick={() =>
                        setQROptions((prev) => ({
                          ...prev,
                          qrStyle: styleOption.value as QRCodeOptions["qrStyle"],
                        }))
                      }
                      className={cn(
                        "p-2 rounded-lg border transition-colors text-left text-xs",
                        qrOptions.qrStyle === styleOption.value
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      )}
                    >
                      {styleOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Settings */}
        <AccordionItem value="settings" className="border-none">
          <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
            <div className="flex items-center">
              <Settings className={IconStyle} />
              <span>Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2.5 px-1 pb-1.5 text-foreground">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Size: {qrOptions.size}px</label>
                <input
                  type="range"
                  min="150"
                  max="400"
                  step="25"
                  value={qrOptions.size}
                  onChange={(e) => setQROptions((prev) => ({ ...prev, size: Number.parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Margin: {qrOptions.margin}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={qrOptions.margin}
                  onChange={(e) => setQROptions((prev) => ({ ...prev, margin: Number.parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Error Correction</label>
                <select
                  value={qrOptions.errorCorrectionLevel}
                  onChange={(e) =>
                    setQROptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: e.target.value as "L" | "M" | "Q" | "H",
                    }))
                  }
                  className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Logo */}
        <AccordionItem value="logo" className="border-none">
          <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
            <div className="flex items-center">
              <ImageIcon className={IconStyle} />
              <span>Logo</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2.5 px-1 pb-1.5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              {logo && (
                <>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Logo Size: {qrOptions.logoSize}px</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={qrOptions.logoSize}
                      onChange={(e) =>
                        setQROptions((prev) => ({ ...prev, logoSize: Number.parseInt(e.target.value) }))
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={logo || "/placeholder.svg"}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-full border-2 border-border"
                    />
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Reset Button */}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={resetToDefaults}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors text-muted-foreground hover:text-foreground text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      
      </div>

      <div className="p-4 border-t border-border bg-card">
        <Button 
          className="w-full h-10 bg-[#1a8d44] hover:bg-[#1a8d44]/90 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          onClick={saveQRCode}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save QR Code'}
        </Button>
      </div>
    </div>
  )
}

export default QRMode
