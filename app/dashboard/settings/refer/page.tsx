'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardListIcon } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const fetchReferralData = async () => {
  const response = await fetch('/api/referral-stats'); // Ensure this matches your API path
  return response.json();
};

export default function ReferFriendSettings() {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (user?.uid) {
      setReferralLink(`${window.location.origin}/ref/${user.uid}`);
    }
  }, [user]);
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState(0);
  const [qrCodesEarned, setQRCodesEarned] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const { referrals, qrCodesEarned } = await fetchReferralData();
      setReferrals(referrals);
      setQRCodesEarned(qrCodesEarned);
    };
    getData();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your referral link</CardTitle>
              <CardDescription>Share your unique referral link with friends.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input readOnly value={referralLink} className="flex-grow" />
                <Button onClick={handleCopyLink} variant="default">
                  <ClipboardListIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>1. Send invite to a friend</div>
                <div>2. Your friend signs up to Uniqode</div>
                <div>3. You both get 1 QR code</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg shadow flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-lg font-semibold">{referrals}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow flex flex-col items-center">
                <p className="text-sm text-muted-foreground">QR Codes Earned</p>
                <p className="text-lg font-semibold">{qrCodesEarned}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}