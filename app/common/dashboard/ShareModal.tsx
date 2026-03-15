import React, { useState } from 'react';
import { Share2, Copy, Check, X, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import QRCodePreview from './QRCodePreview';
import { createQRCode, updateQRCode, QRCodeRecord } from '@/services/qrCodeService';
import { useAuth } from '@/hooks/useAuth';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl?: string;
  qrData?: any;
  profileData?: { username?: string }; // Assuming profileData contains username
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profileUrl: propProfileUrl, qrData, profileData }) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  // Remove @ symbol if present - it's only for visual display
  const cleanUsername = profileData?.username?.startsWith('@')
    ? profileData.username.substring(1)
    : profileData?.username;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${cleanUsername}` : '';

  // Use the generated shareUrl if profileData exists, otherwise fall back to propProfileUrl
  const finalShareUrl = (profileData ? shareUrl : propProfileUrl) || '';

  const qrCodeData = qrData || {
    url: finalShareUrl,
    name: 'Profile Share QR',
    type: 'profile' as const,
    foreground: '#000000',
    background: '#ffffff',
    size: 200,
    margin: 4,
    errorCorrectionLevel: 'M' as const,
    logoSize: 40,
    scanCount: 45,
    isActive: true
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my profile',
          url: finalShareUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      handleCopy();
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(finalShareUrl);
    const text = encodeURIComponent('Check out my profile');

    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: finalShareUrl // Instagram doesn't support direct URL sharing
    };

    if (platform !== 'instagram') {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    } else {
      // For Instagram, you might want to provide instructions or open a generic sharing intent
      console.log('Instagram sharing usually requires a native app integration or specific SDK.');
    }
  };

  const saveQRCode = async () => {
    if (!user) return;

    try {
      // Ensure qrCodeData.url is the finalShareUrl for saving
      const qrDataToSave = { ...qrCodeData, url: finalShareUrl };
      await createQRCode({
        userId: user.uid,
        ...qrDataToSave
      });
    } catch (error) {
      console.error('Error saving QR code:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-xs w-full mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Share</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="">
              <QRCodePreview qrData={{ ...qrCodeData, url: finalShareUrl }} />
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleSocialShare('twitter')}
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSocialShare('facebook')}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSocialShare('linkedin')}
              className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSocialShare('instagram')}
              className="p-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </button>
          </div>

          {/* Link Copy */}
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <span className="flex-1 text-xs text-muted-foreground truncate">
              {finalShareUrl}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Save QR Code Button */}
          <button
            onClick={saveQRCode}
            className="w-full py-2 px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Save QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;