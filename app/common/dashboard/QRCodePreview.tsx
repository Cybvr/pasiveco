
import React, { useEffect, useRef } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { QRCodeRecord } from "@/services/qrCodeService";

interface QRCodeData {
  url: string;
  name: string;
  type: 'profile' | 'custom' | 'url' | 'vcard' | 'wifi' | 'text';
  foreground: string;
  background: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logo?: string;
  logoSize: number;
  scanCount?: number;
  isActive?: boolean;
}

interface QRCodePreviewProps {
  qrData: QRCodeData | QRCodeRecord;
  onShare?: () => void;
  onQRGenerated?: (canvas: HTMLCanvasElement) => void;
  showActions?: boolean;
}

const QRCodePreview: React.FC<QRCodePreviewProps> = ({
  qrData,
  onShare,
  onQRGenerated,
  showActions = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);

  const generateQRCode = async (): Promise<void> => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      await QRCode.toCanvas(canvas, qrData.url, {
        width: qrData.size,
        margin: qrData.margin,
        color: {
          dark: qrData.foreground,
          light: qrData.background,
        },
        errorCorrectionLevel: qrData.errorCorrectionLevel,
      });

      if (qrData.logo && qrData.logoSize > 0) {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const logoSize = qrData.logoSize;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.fillStyle = qrData.background;
            ctx.fill();
            ctx.drawImage(img, x, y, logoSize, logoSize);
            ctx.restore();
            resolve();
          };
          img.src = qrData.logo;
        });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  useEffect(() => {
    generateQRCode().then(() => {
      if (onQRGenerated && canvasRef.current) {
        onQRGenerated(canvasRef.current);
      }
    });
  }, [qrData]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${qrData.name || 'qr-code'}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (error) {
      console.error('Failed to copy QR code:', error);
    }
  };

  return (
    <div className="shadow-lg">
      <div className="flex flex-col items-center space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div
            className="bg-white rounded-lg p-1 shadow-md inline-block"
            style={{ backgroundColor: qrData.background }}
          >
            <canvas ref={canvasRef} className="max-w-[250px] max-h-[250px]" />
          </div>
        </div>

        {/* QR Code Info */}
        <div className="text-center">
          <h3 className="font-medium text-sm">{qrData.name}</h3>
          {qrData.scanCount !== undefined && (
            <p className="text-xs text-muted-foreground">{qrData.scanCount} scans</p>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {onShare && (
              <Button
                onClick={onShare}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <QrCode className="w-3 h-3" />
                Share
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodePreview;
