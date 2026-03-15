"use client"
import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/app/common/dashboard/user-menu';
import AuthModal from '@/app/common/AuthModal';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { featuresService, Feature } from '@/services/featuresService';
import { solutionsService, Solution } from '@/services/solutionsService';

const Header = ({ isMenuOpen = false, setIsMenuOpen = () => {} }: {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}) => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);

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

  return (
    <>
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-10">
              {/* Logo */}
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img src="/images/logo.svg" alt="Logo" className="w-8 h-8" />
                <span className="text-2xl font-bold ml-2">Pasive</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {/* Features Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 text-sm font-normal">
                    Features
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {features.map((feature) => (
                    <DropdownMenuItem key={feature.id} asChild>
                      <Link href={`/features/${feature.slug}`} className="block">
                        <div>
                          <div className="font-medium text-sm">{feature.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {feature.description}
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/features" className="font-medium text-primary">
                      View All Features →
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Solutions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 text-sm font-normal">
                    Solutions
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {solutions.map((solution) => (
                    <DropdownMenuItem key={solution.id} asChild>
                      <Link href={`/solutions/${solution.slug}`} className="block">
                        <div>
                          <div className="font-medium text-sm">{solution.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {solution.description}
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/solutions" className="font-medium text-primary">
                      View All Solutions →
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/pricing" className="text-sm hover:text-primary transition-colors">
                Pricing
              </Link>

              {/* Resources Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 text-sm font-normal">
                    Resources
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/blog" className="block">
                      <div>
                        <div className="font-medium text-sm">Blog</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Latest updates and insights
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/about" className="block">
                      <div>
                        <div className="font-medium text-sm">About</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Learn more about us
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    variant="ghost"
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    size="sm"
                  >
                    Get started for free
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <Link 
                      href="/features" 
                      className="block text-sm font-medium hover:text-primary transition-colors"
                    >
                      Features
                    </Link>
                    <Link 
                      href="/solutions" 
                      className="block text-sm font-medium hover:text-primary transition-colors"
                    >
                      Solutions
                    </Link>
                    <Link 
                      href="/pricing" 
                      className="block text-sm font-medium hover:text-primary transition-colors"
                    >
                      Pricing
                    </Link>
                    <Link 
                      href="/blog" 
                      className="block text-sm font-medium hover:text-primary transition-colors"
                    >
                      Blog
                    </Link>
                    <Link 
                      href="/about" 
                      className="block text-sm font-medium hover:text-primary transition-colors"
                    >
                      About
                    </Link>
                  </div>

                  <div className="border-t pt-6">
                    {user ? (
                      <div className="space-y-4">
                        <Link href="/dashboard">
                          <Button variant="outline" className="w-full justify-start">
                            Dashboard
                          </Button>
                        </Link>
                        <div className="flex justify-start">
                          <UserMenu />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={() => setIsAuthModalOpen(true)}
                          variant="outline"
                          className="w-full"
                        >
                          Sign In
                        </Button>
                        <Button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="w-full"
                        >
                          Get started for free
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Header;
