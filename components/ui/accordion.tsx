'use client';
import React, { createContext, useContext, useState } from "react";

interface AccordionProps {
  children: React.ReactNode;
  type?: string;
  collapsible?: boolean;
}

interface AccordionContextType {
  openItem: string | null;
  toggleItem: (item: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export const Accordion: React.FC<AccordionProps> = ({ children, type, collapsible }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className="space-y-2">{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  // Pass the value down to children to identify this accordion item
  return (
    <div data-value={value} className="bg-card rounded-md">
      {React.Children.map(children, child => {
        // Pass the value prop to each child
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { itemValue: value });
        }
        return child;
      })}
    </div>
  );
};

export const AccordionTrigger: React.FC<{ children: React.ReactNode; itemValue?: string }> = ({ children, itemValue }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within an Accordion');

  const { openItem, toggleItem } = context;

  return (
    <button
      className="flex justify-between items-center w-full px-4 py-2 text-left text-foreground font-medium focus:outline-none"
      onClick={() => toggleItem(itemValue || '')}
    >
      {children}
      <svg
        className={`w-5 h-5 transition-transform ${openItem === itemValue ? 'transform rotate-180' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

export const AccordionContent: React.FC<{ children: React.ReactNode; itemValue?: string }> = ({ children, itemValue }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within an Accordion');

  const { openItem } = context;

  // Only show content if this item is open
  if (openItem !== itemValue) return null;

  return <div className="px-4 py-2 text-foreground">{children}</div>;
}