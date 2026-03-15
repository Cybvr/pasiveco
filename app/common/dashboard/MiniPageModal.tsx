
import React from 'react';
import { X, ArrowRight, Check, Globe, Smartphone, Palette, BarChart, Heart, Play, MessageCircle, Plus } from 'lucide-react';

interface MiniPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniPageModal: React.FC<MiniPageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-3xl w-full mx-3 sm:mx-4 max-h-[85vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b p-3 sm:p-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">Pasive - Link in Bio</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Hero Section */}
          <section className="bg-muted text-foreground px-4 sm:px-6 py-8 sm:py-12 rounded-lg mb-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 sm:mb-4">
                Everything you create<br />
                In one place.
              </h1>
              <p className="text-base sm:text-lg mb-5 sm:mb-6 text-muted-foreground">
                Join thousands of creators using Pasive for their link in bio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary text-primary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:opacity-90 transition-colors">
                  Get started for free
                </button>
                <button className="border border-border text-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-background transition-colors">
                  Learn more
                </button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-muted rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center mr-3 border border-border">
                  <Smartphone className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Share your content</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Sell products and collect payments by featuring them on your Pasive.
              </p>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
                    <Heart className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
                    <Play className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center mr-3 border border-border">
                  <BarChart className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Grow your audience</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Grow and engage your audience with detailed analytics and insights.
              </p>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Monthly views</span>
                    <span className="text-lg font-bold text-foreground">12.5K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-foreground/60 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              The fast, friendly and powerful link in bio tool.
            </h2>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-colors">
              Get started for free
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MiniPageModal;
