"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/app/common/dashboard/user-menu';
import AuthModal from '@/app/common/AuthModal';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { featuresService, Feature } from '@/services/featuresService';
import { solutionsService, Solution } from '@/services/solutionsService';

const STORE_LINKS = [
  { label: 'Digital Store', href: '/store' },
  { label: 'Tickets', href: '/tickets' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Domains', href: '/custom-domains' },
]

type ActiveMenu = 'products' | 'solutions' | 'resources' | null

const Header = ({ isMenuOpen = false, setIsMenuOpen = () => {}, overlay = false }: {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
  overlay?: boolean;
}) => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [hoveredStore, setHoveredStore] = useState('Digital Store');
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = overlay && !activeMenu && !scrolled;
  const navTextClass = transparent ? 'text-background' : 'text-foreground';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuresData, solutionsData] = await Promise.all([
          featuresService.getAllFeatures(),
          solutionsService.getAllSolutions()
        ]);
        setFeatures(featuresData.slice(0, 6));
        setSolutions(solutionsData.slice(0, 6));
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchData();
  }, []);

  const open = (menu: ActiveMenu) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(menu);
  };

  const close = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  return (
    <>
      <nav
        className={`relative w-full z-[100] transition-colors duration-200 ${transparent ? 'bg-transparent border-none' : 'bg-background border-b'}`}
        onMouseLeave={close}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-5">

              {/* Logo */}
              <Link href="/" className={`flex items-center transition-colors hover:opacity-80 ${navTextClass}`}>
                <img src="/images/logo.svg" alt="Logo" className="w-6 h-6" />
                <span className={`ml-2 translate-y-[1px] text-2xl font-chunko ${navTextClass}`}>PASIVE</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-3">
                {(['products', 'solutions', 'resources'] as const).map((menu) => (
                  <button
                    key={menu}
                    className={`flex items-center gap-1 py-1 text-xs font-normal capitalize transition-colors hover:opacity-70 ${navTextClass}`}
                    onMouseEnter={() => open(menu)}
                  >
                    {menu}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                ))}
                <Link href="/pricing" className={`text-xs font-normal transition-colors hover:opacity-70 ${navTextClass}`}>
                  Pricing
                </Link>
              </div>
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="sm"
                >
                  Get In
                </Button>
              )}
            </div>

            {/* Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className={`p-2 md:hidden ${navTextClass}`}>
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader className="sr-only">
                  <SheetTitle>Site Navigation</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Products</div>
                  {STORE_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{item.label}</Link>
                  ))}
                  <Link href="/solutions" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
                  <Link href="/pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                  <Link href="/blog" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                  <Link href="/about" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
                  <div className="border-t pt-4">
                    {user ? (
                      <div className="space-y-4">
                        <Link href="/dashboard"><Button variant="outline" className="w-full justify-start">Dashboard</Button></Link>
                        <div className="flex justify-start"><UserMenu /></div>
                      </div>
                    ) : (
                      <Button onClick={() => setIsAuthModalOpen(true)} className="w-full">
                        Get In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Shared mega panel */}
        {activeMenu && (
          <div className="absolute left-0 right-0 top-full bg-background border-b shadow-2xl z-50" onMouseEnter={() => open(activeMenu)}>
            <div className="max-w-7xl mx-auto px-6 py-8">

              {activeMenu === 'products' && (
                <div className="grid grid-cols-[240px_1fr] gap-10">
                  <div className="flex flex-col">
                    {STORE_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onMouseEnter={() => setHoveredStore(item.label)}
                        className={`py-2 text-lg font-semibold transition-colors ${hoveredStore === item.label ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  {hoveredStore === 'Digital Store' && (
                    <div className="flex flex-col self-start">
                      {features.map((feature) => (
                        <Link key={feature.id} href={`/features/${feature.slug}`} className="py-2 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors">
                          {feature.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeMenu === 'solutions' && (
                <div className="grid grid-cols-3 gap-px bg-border border border-border">
                  {solutions.map((solution) => (
                    <Link key={solution.id} href={`/solutions/${solution.slug}`} className="group p-4 bg-background hover:bg-muted/30 transition-colors">
                      <div className="font-semibold text-base mb-1 text-muted-foreground group-hover:text-foreground transition-colors">{solution.title}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{solution.description}</div>
                    </Link>
                  ))}
                </div>
              )}

              {activeMenu === 'resources' && (
                <div className="grid grid-cols-3 gap-px bg-border border border-border">
                  <Link href="/blog" className="group p-4 bg-background hover:bg-muted/30 transition-colors">
                    <div className="font-semibold text-base mb-1 text-muted-foreground group-hover:text-foreground transition-colors">Blog</div>
                    <div className="text-sm text-muted-foreground">Latest updates and insights</div>
                  </Link>
                  <Link href="/about" className="group p-4 bg-background hover:bg-muted/30 transition-colors">
                    <div className="font-semibold text-base mb-1 text-muted-foreground group-hover:text-foreground transition-colors">About</div>
                    <div className="text-sm text-muted-foreground">Learn more about us</div>
                  </Link>
                </div>
              )}

            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
