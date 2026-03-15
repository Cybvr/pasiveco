import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, ExternalLink, Check, Share2, Users, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import QRCodePreview from "./qrcode/QRCodePreview";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: { 
    name: string; 
    slug?: string; 
    id: string; 
    isPublic?: boolean;
    koredocs?: {
      categories?: string[];
    };
    koretailor?: any; // Assuming koretailor can be any type for now
  };
  onPublicChange: (isPublic: boolean) => void;
  onCategoriesChange: (categories: string[]) => void;
};

export default function ShareDialog({ 
  open, 
  onOpenChange, 
  qrCode,
  onPublicChange,
  onCategoriesChange
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("social");
  const [isPublic, setIsPublic] = useState(qrCode?.isPublic || false);
  const [categories, setCategories] = useState<string[]>(qrCode?.koredocs?.categories || []);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (qrCode) {
      console.log('ShareDialog: QR code data updated:', qrCode);
      setIsPublic(qrCode.isPublic || false);
      setCategories(qrCode.koredocs?.categories || []);
    }
  }, [qrCode]);

  // Function to generate clean URL (removing leading '@' if present in slug)
  const getCleanUrl = (slug?: string, id?: string) => {
    const displaySlug = slug?.startsWith('@') ? slug.substring(1) : slug;
    return displaySlug ? `${window.location.origin}/${displaySlug}` : `${window.location.origin}/view/${id}`;
  };

  const handleCopyLink = () => {
    const link = getCleanUrl(qrCode.slug, qrCode.id);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = (format: 'png' | 'svg' = 'png') => {
    const qrSvg = document.querySelector("#share-qr-container svg");
    if (qrSvg) {
      const svgData = new XMLSerializer().serializeToString(qrSvg);

      if (format === 'svg') {
        // Direct SVG download
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.download = `${qrCode.name || 'qr-code'}.svg`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
      } else {
        // Convert SVG to PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = img.width || 240;
          canvas.height = img.height || 240;
          ctx?.drawImage(img, 0, 0);

          const link = document.createElement("a");
          link.download = `${qrCode.name || 'qr-code'}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();

          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    }
  };

  const socialPlatforms = [
    { name: "Facebook", icon: "/images/Socials/Facebook.png" },
    { name: "Twitter", icon: "/images/Socials/X.png" },
    { name: "WhatsApp", icon: "/images/Socials/Whatsapp.png" },
  ];

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const newCategories = [...categories, newCategory.trim()];
      setCategories(newCategories);
      onCategoriesChange(newCategories);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    onCategoriesChange(newCategories);
  };

  const handleVisibilityToggle = (publicValue: boolean) => {
    setIsPublic(publicValue);
    onPublicChange(publicValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <div className="flex flex-col md:flex-row gap-6">
          <nav className="flex md:flex-col gap-1 md:w-40 shrink-0">
            {[
              { id: "social", icon: <Users size={16} />, label: "My QR Code" },
              { id: "explore", icon: <Globe size={16} />, label: "My Trafl Page" },
              { id: "download", icon: <Download size={16} />, label: "Download" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 p-2 h-10 rounded-md text-sm transition-colors ${
                  activeTab === tab.id ? "bg-accent font-medium" : "hover:bg-accent/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-4 min-h-[350px]">
            {activeTab === "social" && (
              <div className="space-y-3 h-full">
                <DialogTitle>My QR Code</DialogTitle>
                <DialogDescription>
                  Spread your QR code through your favorite platforms
                </DialogDescription>
                <div className="flex flex-wrap gap-3">
                  {socialPlatforms.map((platform) => (
                    <Button
                      key={platform.name}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const url = getCleanUrl(qrCode.slug, qrCode.id);
                        const shareUrl = platform.name === "WhatsApp"
                          ? `https://wa.me/?text=${encodeURIComponent(url)}`
                          : `https://www.${platform.name.toLowerCase()}.com/share?url=${encodeURIComponent(url)}`;
                        window.open(shareUrl);
                      }}
                    >
                      <Image
                        src={platform.icon}
                        alt={platform.name}
                        width={16}
                        height={16}
                      />
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "explore" && (
              <div className="space-y-4 h-full">
                <DialogTitle>My Trafl Page</DialogTitle>
                <DialogDescription>
                  Control how your QR appears on the public explore page
                </DialogDescription>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Visibility</h3>
                    <div className="space-y-2">
                      {[
                        { id: "private", label: "Private", description: "Only visible to you", value: false },
                        { id: "public", label: "Public", description: "Visible to everyone", value: true }
                      ].map((option) => (
                        <label key={option.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50">
                          <input
                            type="radio"
                            checked={isPublic === option.value}
                            onChange={() => handleVisibilityToggle(option.value)}
                            className="h-4 w-4 text-primary"
                          />
                          <div>
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Categories</h3>
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category, i) => (
                          <div key={i} className="flex items-center gap-1 bg-accent px-2 py-1 rounded-full text-sm">
                            {category}
                            <button
                              onClick={() => handleRemoveCategory(i)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Add category"
                          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                          className="flex-1"
                        />
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={handleAddCategory}
                          disabled={!newCategory.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCategories = [...categories, "qrtemplates"];
                          setCategories(newCategories);
                          onCategoriesChange(newCategories);
                        }}
                      >
                        Make Template
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <DialogTitle>Share Link</DialogTitle>
                    <div className="flex gap-2">
                      <Input
                        value={getCleanUrl(qrCode.slug, qrCode.id)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={handleCopyLink}
                        size="sm"
                        className="gap-1"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "download" && (
              <div className="space-y-3 h-full">
                <DialogTitle>My Downloads</DialogTitle>
                <div className="space-y-3">
                  <Button
                    onClick={() => window.open(
                      getCleanUrl(qrCode.slug, qrCode.id), 
                      "_blank"
                    )}
                    className="w-full gap-2"
                  >
                    <ExternalLink size={16} />
                    Open QR Page
                  </Button>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => downloadQRCode('png')}
                      className="w-full gap-2"
                    >
                      <Download size={16} />
                      Download PNG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadQRCode('svg')}
                      className="w-full gap-2"
                    >
                      <Download size={16} />
                      Download SVG
                    </Button>
                  </div>
                </div>
                <div id="share-qr-container" className="flex justify-center mt-4">
                  {qrCode && (
                    <QRCodePreview
                      content={{
                        type: 'Link',
                        url: getCleanUrl(qrCode.slug, qrCode.id),
                        id: qrCode.id,
                        slug: qrCode.slug
                      }}
                      koretailor={qrCode.koretailor}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}