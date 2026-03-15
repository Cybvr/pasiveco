import React from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { websiteData, iconMap } from '@/app/data/websiteData';
import { Feature } from '@/services/featuresService';

interface ProductsShowcaseProps {
  features?: Feature[];
}

const ProductsShowcase = ({ features = [] }: ProductsShowcaseProps) => {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="text-left mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            {websiteData.hero.title}
          </h1>
          <p className="text-left text-xl text-foreground mb-8">
            {websiteData.hero.subtitle}
          </p>
          <div className="w-24 h-1 text-left bg-primary rounded-full"></div>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(features.length > 0 ? features : websiteData.products).map((item, index) => {
            const isFeature = 'slug' in item;
            const IconComponent = iconMap[item.icon] || Package;
            const imageUrl = isFeature ? (item.featuredImage || item.imageUrl) : item.image;
            const linkHref = isFeature ? `/features/${item.slug}` : '#';
            
            return (
              <Link
                key={isFeature ? item.id : index}
                href={linkHref}
                className="relative group cursor-pointer transform transition-all duration-500"
              >
                {/* Main Card with fixed height */}
                <div className="relative bg-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden h-[450px] flex flex-col group-hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>
                  {/* Content */}
                  <div className="flex-grow p-8 flex flex-col">
                    {/* Icon with Color Background */}
                    <div className={`w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 -mt-16 relative z-10 shadow-lg flex-shrink-0 group-hover:scale-110`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 transition-colors duration-300 flex-shrink-0 group-hover:text-primary">
                      {item.title}
                    </h3>
                    {/* Description */}
                    <p className="text-foreground leading-relaxed transition-colors duration-300 mb-6 flex-grow">
                      {item.description}
                    </p>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-8 right-8 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75"></div>
                </div>
                {/* Hover Border Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl`}></div>
              </Link>
            );
          })}
        </div>
        {/* Bottom CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transform transition-all duration-300 cursor-pointer">
            <span>{websiteData.hero.ctaText}</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-bounce opacity-30"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-primary rounded-full animate-bounce opacity-30 delay-150"></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-primary rounded-full animate-bounce opacity-30 delay-300"></div>
      </div>
    </div>
  );
};

export default ProductsShowcase;