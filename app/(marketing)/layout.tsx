'use client';
import Header from '@/app/common/website/Header';
import Footer from '@/app/common/website/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <main className="flex-1 marketing-content">{children}</main>
      <Footer />
    </div>
  );
}
