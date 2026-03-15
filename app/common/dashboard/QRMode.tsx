
import type React from "react"
import { useState, useEffect } from "react"
import { QrCode, Download, Palette, ImageIcon, RotateCcw, Settings, Copy, Check, Save } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { createQRCode, updateQRCode, QRCodeRecord } from "@/services/qrCodeService"
import { useAuth } from "@/hooks/useAuth"
import QRCodePreview from "./QRCodePreview"

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

  const [qrOptions, setQROptions] = useState<QRCodeOptions>({
    foreground: qrData.foreground,
    background: qrData.background,
    size: qrData.size,
    margin: qrData.margin,
    errorCorrectionLevel: qrData.errorCorrectionLevel,
    logoSize: qrData.logoSize,
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

  // Sync qrData with qrOptions
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
      logo: logo || undefined
    }
    setQrData(updatedQrData)
    if (onQRDataChange) {
      onQRDataChange(updatedQrData)
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
        await createQRCode({
          userId: user.uid,
          ...qrData,
          scanCount: 0
        })
      }
    } catch (error) {
      console.error('Error saving QR code:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full md:w-96 p-4 sm:p-6 bg-zinc-800/30 border-b md:border-b-0 md:border-r border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">QR Code Generator</h2>
        <Button
          onClick={saveQRCode}
          disabled={saving}
          size="sm"
          className="gap-1"
        >
          <Save className="w-3 h-3" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {/* Colors */}
        <AccordionItem value="colors" className="border-none bg-zinc-800/50 rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <span>Colors</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Presets</h4>
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
                      className="p-2 rounded-lg border border-zinc-600 hover:border-orange-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded border"
                          style={{ backgroundColor: preset.bg, borderColor: preset.fg }}
                        >
                          <div className="w-2 h-2 rounded-sm m-0.5" style={{ backgroundColor: preset.fg }} />
                        </div>
                        <span className="text-xs text-zinc-300">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrOptions.foreground}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, foreground: e.target.value }))}
                    className="w-8 h-8 rounded border border-zinc-600 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrOptions.foreground}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, foreground: e.target.value }))}
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrOptions.background}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, background: e.target.value }))}
                    className="w-8 h-8 rounded border border-zinc-600 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrOptions.background}
                    onChange={(e) => setQROptions((prev) => ({ ...prev, background: e.target.value }))}
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Settings */}
        <AccordionItem value="settings" className="border-none bg-zinc-800/50 rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Size: {qrOptions.size}px</label>
                <input
                  type="range"
                  min="150"
                  max="400"
                  step="25"
                  value={qrOptions.size}
                  onChange={(e) => setQROptions((prev) => ({ ...prev, size: Number.parseInt(e.target.value) }))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Margin: {qrOptions.margin}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={qrOptions.margin}
                  onChange={(e) => setQROptions((prev) => ({ ...prev, margin: Number.parseInt(e.target.value) }))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Error Correction</label>
                <select
                  value={qrOptions.errorCorrectionLevel}
                  onChange={(e) =>
                    setQROptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: e.target.value as "L" | "M" | "Q" | "H",
                    }))
                  }
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
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
        <AccordionItem value="logo" className="border-none bg-zinc-800/50 rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <span>Logo</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
              </div>

              {logo && (
                <>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Logo Size: {qrOptions.logoSize}px</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={qrOptions.logoSize}
                      onChange={(e) =>
                        setQROptions((prev) => ({ ...prev, logoSize: Number.parseInt(e.target.value) }))
                      }
                      className="w-full accent-orange-500"
                    />
                  </div>
                  <div className="p-3 bg-zinc-700 rounded-lg">
                    <p className="text-xs text-zinc-400 mb-2">Preview:</p>
                    <img
                      src={logo || "/placeholder.svg"}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-full border-2 border-zinc-600"
                    />
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Reset Button */}
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <button
          onClick={resetToDefaults}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-zinc-300 hover:text-white text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-400">QR Code for:</p>
        <p className="text-xs text-white font-medium truncate">{profileUrl}</p>
      </div>
    </div>
  )
}

export default QRMode
