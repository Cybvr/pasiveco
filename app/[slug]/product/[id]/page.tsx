
"use client";
import React, { useState, useEffect } from 'react';
import { getProduct, Product } from '@/services/productsService';
import { getUserProfile } from '@/services/userProfilesService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ExternalLink, ArrowLeft, User, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { initializePaystackPayment } from '@/services/paystackService';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/app/common/AuthModal';
import Watermark from '@/app/common/dashboard/Watermark';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const [productId, setProductId] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);

      try {
        const productData = await getProduct(resolvedParams.id);
        if (productData) {
          setProduct(productData);
          
          // Get seller info
          const sellerProfile = await getUserProfile(productData.userId);
          setSeller(sellerProfile);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  const handlePurchaseClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    handlePaystackPayment();
  };

  const handlePaystackPayment = () => {
    if (!product || !user?.email) return;
    
    setPaymentLoading(true);
    
    try {
      initializePaystackPayment(
        user.email,
        product.price,
        product.id,
        product.name,
        (reference: string) => {
          // Payment successful
          console.log('Payment successful:', reference);
          alert('Payment successful! Thank you for your purchase.');
          setPaymentLoading(false);
        },
        () => {
          // Payment closed/cancelled
          setPaymentLoading(false);
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">This product may have been removed or doesn't exist.</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.thumbnail ? (
                <img 
                  src={product.thumbnail} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">
                {product.currency === 'USD' ? '$' : product.currency}{product.price}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            {seller && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Sold by</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {seller.profilePicture ? (
                        <img 
                          src={seller.profilePicture} 
                          alt={seller.username}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{seller.displayName || seller.username}</p>
                      <Link href={`/${seller.username?.replace('@', '')}`} className="text-sm text-primary hover:underline">
                        View profile
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Button */}
            <div className="space-y-3">
              {product.url && product.url !== '' ? (
                <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full" size="lg">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get This Product
                  </Button>
                </a>
              ) : product.paymentIntegration?.paystack?.enabled ? (
                <div className="space-y-3">
                  {user && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Payment will be processed for: <span className="font-medium">{user.email}</span>
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePurchaseClick}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    {paymentLoading ? 'Processing...' : `${user ? 'Pay' : 'Sign in to Pay'} ${product.currency === 'USD' ? '$' : product.currency}${product.price}`}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Secure payment powered by Paystack
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground mb-2">Contact seller for availability</p>
                  {seller && (
                    <Link href={`/${seller.username?.replace('@', '')}`}>
                      <Button variant="outline" size="sm">
                        View Seller Profile
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
      
      <Watermark />
    </div>
  );
}
