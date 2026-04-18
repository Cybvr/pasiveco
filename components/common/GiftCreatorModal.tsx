"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Gift, CreditCard, Bitcoin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface GiftCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
}

const PRESET_AMOUNTS = [500, 1000, 5000, 10000];

export default function GiftCreatorModal({ isOpen, onClose, creatorId, creatorName }: GiftCreatorModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'crypto'>('paystack');
  const [loading, setLoading] = useState(false);

  const handleGift = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gifts/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          creatorName,
          amount: finalAmount,
          currency: paymentMethod === 'paystack' ? 'NGN' : 'USD',
          paymentMethod,
          senderName: user?.displayName || 'Anonymous',
          senderEmail: user?.email || 'anonymous@pasive.co',
          senderId: user?.uid || null,
          message,
        }),
      });

      const data = await response.json();

      if (data.link) {
        window.location.href = data.link;
      } else {
        toast.error(data.error || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Gift Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border-none shadow-2xl p-0">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 animate-bounce-subtle">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Gift @{creatorName}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              Show some love and support for their amazing work!
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="paystack" onValueChange={(v) => setPaymentMethod(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="paystack" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Card
              </TabsTrigger>
              <TabsTrigger value="crypto" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <Bitcoin className="w-4 h-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Amount ({paymentMethod === 'paystack' ? '₦' : '$'})</Label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`relative overflow-hidden py-3 rounded-xl border-2 transition-all duration-300 transform active:scale-95 ${
                        amount === preset && !customAmount
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-muted hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      <span className="relative z-10 font-bold">{preset.toLocaleString()}</span>
                      {amount === preset && !customAmount && (
                        <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative group">
                  <Input
                    type="number"
                    placeholder="Other amount..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(0);
                    }}
                    className="pl-10 h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all rounded-xl"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium group-focus-within:text-primary transition-colors">
                    {paymentMethod === 'paystack' ? '₦' : '$'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Your Message</Label>
                <Textarea
                  placeholder="Leave a sweet note for the creator..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          </Tabs>

          <DialogFooter className="mt-8">
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300" 
              onClick={handleGift} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing Gift...
                </>
              ) : (
                <>
                  Send {paymentMethod === 'paystack' ? '₦' : '$'}{customAmount || amount}
                  <Gift className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </DialogFooter>
          
          <p className="text-[10px] text-center text-muted-foreground/50 mt-4">
            Secured by {paymentMethod === 'paystack' ? 'Paystack' : 'Bitnob'}. 100% safe & encrypted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
