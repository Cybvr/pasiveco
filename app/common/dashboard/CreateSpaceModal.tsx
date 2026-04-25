'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  Compass,
  Brush,
  Users,
  GraduationCap,
  Store,
  Mic,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CreateSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TemplateOption({
  icon,
  title,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/40 transition-all hover:border-border/80 group"
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="font-bold text-[15px]">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}

export function CreateSpaceModal({ open, onOpenChange }: CreateSpaceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] p-0 overflow-hidden border-0 gap-0 rounded-2xl shadow-2xl">
        <div className="flex w-full sm:h-[540px] flex-col sm:flex-row">
          {/* Left Side (Image/Illustration) */}
          <div className="hidden sm:block w-[280px] bg-primary relative shrink-0">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm mb-6 ring-1 ring-white/30 shadow-lg">
                 <Compass className="w-16 h-16 text-white drop-shadow-md" />
              </div>
              <h3 className="text-xl font-bold mb-2">Build Your World</h3>
              <p className="text-sm text-white/80 font-medium">Create a dedicated space to connect, share, and grow your community.</p>
            </div>
          </div>
          
          {/* Right Side (Content) */}
          <div className="flex-1 flex flex-col p-6 sm:p-8 bg-background h-full">
            <DialogHeader className="text-center mb-6 shrink-0">
              <DialogTitle className="text-2xl font-black text-center tracking-tight">
                Create Your First Space
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground mt-2 text-[15px]">
                Your space is where your community hangs out. Make yours and start growing.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
              {/* Main Button */}
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Brush className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-[15px]">Create My Own</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              <div className="pt-2">
                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-1">START FROM A TEMPLATE</h3>
                <div className="space-y-2.5">
                  <TemplateOption 
                    icon={<div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Users className="w-5 h-5" /></div>} 
                    title="Community Hub" 
                  />
                  <TemplateOption 
                    icon={<div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Store className="w-5 h-5" /></div>} 
                    title="Digital Storefront" 
                  />
                  <TemplateOption 
                    icon={<div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><GraduationCap className="w-5 h-5" /></div>} 
                    title="Course Creators" 
                  />
                  <TemplateOption 
                    icon={<div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Mic className="w-5 h-5" /></div>} 
                    title="Podcast Fans" 
                  />
                  <TemplateOption 
                    icon={<div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500"><Palette className="w-5 h-5" /></div>} 
                    title="Artists & Creators" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t shrink-0 text-center">
              <a href="#" className="text-sm text-primary hover:text-primary/80 font-bold transition-colors">
                Already have an invite? Join a space
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
