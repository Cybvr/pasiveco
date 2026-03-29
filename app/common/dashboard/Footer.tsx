// common/Footer.tsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="px-6 py-4 border-t border-zinc-800 text-xs text-zinc-500">
      <div className="flex items-center justify-between">
        <p><span className="font-chunko text-sm translate-y-[1px]">PASIVE</span> - Make great stuff. Make great money.</p>
        <div className="flex items-center space-x-6">
          <a href="/legal/privacy-policy" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="/legal/terms" className="hover:text-zinc-300 transition-colors">Terms</a>
          <button className="p-1 hover:bg-zinc-800 rounded transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
