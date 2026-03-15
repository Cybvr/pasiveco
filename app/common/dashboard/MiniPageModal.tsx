
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
      <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pasive - Link in Bio</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Hero Section */}
          <section className="bg-purple-800 text-white px-6 py-12 rounded-lg mb-6">
            <div className="text-center">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                Everything you create<br />
                In one place.
              </h1>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of creators using Pasive for their link in bio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-pink-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-500 transition-colors">
                  Get started for free
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-800 transition-colors">
                  Learn more
                </button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center mr-3">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Share your content</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sell products and collect payments by featuring them on your Pasive.
              </p>
              <div className="bg-white rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gradient-to-br from-red-400 to-pink-400 rounded-lg aspect-square flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg aspect-square flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg aspect-square flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <BarChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Grow your audience</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Grow and engage your audience with detailed analytics and insights.
              </p>
              <div className="bg-white rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">Monthly views</span>
                    <span className="text-lg font-bold text-blue-600">12.5K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              The fast, friendly and powerful link in bio tool.
            </h2>
            <button className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors">
              Get started for free
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MiniPageModal;
