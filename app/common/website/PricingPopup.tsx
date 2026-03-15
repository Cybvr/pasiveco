
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PricingPlans from "./PricingPlans";
import { BillingPeriod, PlanId } from '@/types';

type PricingPopupProps = {
  currentPlan: string;
  children: React.ReactNode;
};

export function PricingPopup({ currentPlan, children }: PricingPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectPlan = (planId: PlanId, billingPeriod: BillingPeriod) => {
    // Don't close the dialog automatically when plan is selected
    // The checkout process will handle redirection
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[900px] h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Select Your Plan</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <PricingPlans 
            currentPlan={currentPlan} 
            onSelectPlan={handleSelectPlan}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
