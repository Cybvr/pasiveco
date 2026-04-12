// @/app/dashboard/settings/plan-billing/invoices.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Invoice {
  id: string;
  amountPaid: number;
  currency: string;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
  invoiceUrl: string;
  pdfUrl: string;
}

export default function Invoices({ userId }: { userId?: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.log('No userId provided');
      setLoading(false);
      return;
    }

    const fetchInvoices = async () => {
      try {
        console.log('Fetching invoices for user:', userId);
        const response = await fetch(`/api/subscriptions/${userId}`);
        console.log('API response status:', response.status);

        if (!response.ok) {
          console.log(`Subscription API returned status: ${response.status}`);
          setInvoices([]);
          return;
        }

        const data = await response.json();
        console.log('API response data:', data);

        if (data.invoices && Array.isArray(data.invoices)) {
          console.log('Found invoices:', data.invoices.length);
          // Ensure all required fields exist
          const validInvoices = data.invoices.filter((invoice: any) => 
            invoice && 
            invoice.id && 
            invoice.amountPaid !== undefined && 
            invoice.currency && 
            invoice.status && 
            invoice.createdAt && 
            invoice.createdAt.seconds &&
            invoice.invoiceUrl
          );
          setInvoices(validInvoices);
        } else {
          console.log('No invoices found in response');
          setInvoices([]);
        }
      } catch (error: any) {
        console.error('Error fetching invoices:', {
          error: error.message,
          code: error.code,
          details: error.details || 'No additional details'
        });
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [userId]);

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    });

    return formatter.format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past invoices and payment history</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No billing history available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {formatDate(invoice.createdAt.seconds)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{invoice.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}