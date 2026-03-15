
import React, { useEffect, useRef } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { QRCodeRecord } from "@/services/qrCodeService";

interface QRCodeData {
  url: string;
  name: string;
  type: 'profile' | 'custom' | 'url' | 'vcard' | 'wifi' | 'text';
  qrStyle?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const qrCode = useRef<QRCodeStyling>();

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: qrData.size,
      height: qrData.size,
      data: qrData.url,
      margin: qrData.margin,
      qrOptions: {
        errorCorrectionLevel: qrData.errorCorrectionLevel,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: qrData.logoSize / qrData.size, 
      },
      dotsOptions: {
        color: qrData.foreground,
        type: (qrData.qrStyle as DotType) || "square"
      },
      backgroundOptions: {
        color: qrData.background,
      },
      cornersSquareOptions: {
        color: qrData.foreground,
        type: (qrData.qrStyle === 'square' || !qrData.qrStyle ? 'square' : 'extra-rounded') as CornerSquareType,
      },
      cornersDotOptions: {
        color: qrData.foreground,
        type: (qrData.qrStyle === 'square' || !qrData.qrStyle ? 'square' : 'dot') as CornerDotType,
      },
      image: qrData.logo || undefined
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qrCode.current.append(containerRef.current);
      
      setTimeout(() => {
        if (containerRef.current) {
          const canvas = containerRef.current.querySelector('canvas');
          if (canvas && onQRGenerated) {
            onQRGenerated(canvas);
          }
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!qrCode.current) return;
    qrCode.current.update({
      width: qrData.size,
      height: qrData.size,
      data: qrData.url,
      margin: qrData.margin,
      image: qrData.logo || undefined,
      qrOptions: {
        errorCorrectionLevel: qrData.errorCorrectionLevel,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: qrData.logoSize / qrData.size, 
      },
      dotsOptions: {
        color: qrData.foreground,
        type: (qrData.qrStyle as DotType) || "square"
      },
      backgroundOptions: {
        color: qrData.background,
      },
      cornersSquareOptions: {
        color: qrData.foreground,
        type: (qrData.qrStyle === 'square' || !qrData.qrStyle ? 'square' : 'extra-rounded') as CornerSquareType,
      },
      cornersDotOptions: {
        color: qrData.foreground,
        type: (qrData.qrStyle === 'square' || !qrData.qrStyle ? 'square' : 'dot') as CornerDotType,
      }
    });
    
    setTimeout(() => {
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas && onQRGenerated) {
          onQRGenerated(canvas);
        }
      }
    }, 100);
  }, [qrData, onQRGenerated]);

  const handleDownload = () => {
    if (!qrCode.current) return;
    qrCode.current.download({ name: qrData.name || "qr-code", extension: "png" });
  };

  const handleCopy = async () => {
    if (!qrCode.current) return;
    try {
      const blob = await qrCode.current.getRawData("png");
      if (blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
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
            className="bg-white rounded-lg p-1 shadow-md inline-block overflow-hidden"
            style={{ backgroundColor: qrData.background }}
          >
            <div ref={containerRef} className="max-w-[250px] max-h-[250px] flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:max-h-full" />
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
