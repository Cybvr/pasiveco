
"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const CookiePreferences = () => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    performance: false,
    socialMedia: false,
    targeting: false,
    userProfile: false,
    analytics: false
  });

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof preferences]
    }));
  };

  const handleRejectAll = () => {
    setPreferences(prev => ({
      ...prev,
      performance: false,
      socialMedia: false,
      targeting: false,
      userProfile: false,
      analytics: false
    }));
  };

  const handleSave = () => {
    setCookiePreferences(preferences);
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Necessary Cookies</h4>
            <p className="text-sm text-muted-foreground">Required for basic functionality</p>
          </div>
          <Switch checked={preferences.necessary} disabled />
        </div>
        
        {[
          {key: 'performance', label: 'Performance Cookies', desc: 'Help improve site performance'},
          {key: 'socialMedia', label: 'Social Media', desc: 'Enable social sharing features'},
          {key: 'targeting', label: 'Targeting', desc: 'Personalized content and ads'},
          {key: 'userProfile', label: 'User Profile', desc: 'Store user preferences'},
          {key: 'analytics', label: 'Analytics', desc: 'Help us understand usage patterns'}
        ].map(({key, label, desc}) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{label}</h4>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <Switch 
              checked={preferences[key as keyof typeof preferences]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleRejectAll}>
          Reject All
        </Button>
        <Button onClick={handleSave}>
          Confirm My Choices
        </Button>
      </div>
    </div>
  );
};
