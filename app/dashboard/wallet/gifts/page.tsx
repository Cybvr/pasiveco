"use client";

import React, { useState, useEffect } from 'react';
import { Gift, ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSentGifts, GiftRecord } from "@/services/giftService";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";

export default function SentGiftsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGifts() {
      if (!user?.uid) return;
      try {
        const data = await getSentGifts(user.uid);
        setGifts(data);
      } catch (error) {
        console.error("Error fetching sent gifts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGifts();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sent Gifts</h1>
          <p className="text-muted-foreground text-sm">History of creators you've supported.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Support</span>
            </div>
            <div className="text-2xl font-bold">
              {gifts.length} Gifts
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Gift History</CardTitle>
          <CardDescription>All your contributions to creators on Pasive.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Creator</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading gifts...</TableCell>
                </TableRow>
              ) : gifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    You haven't sent any gifts yet. Support a creator today!
                  </TableCell>
                </TableRow>
              ) : (
                gifts.map((gift) => (
                  <TableRow key={gift.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-primary cursor-pointer hover:underline" onClick={() => router.push(`/${gift.creatorName}`)}>
                          @{gift.creatorName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(gift.amount, gift.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {gift.createdAt?.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {gift.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm italic">
                      {gift.message || "No message"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        Success
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
