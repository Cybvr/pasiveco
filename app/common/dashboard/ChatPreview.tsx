import React, { useState } from 'react';
import { Brain, User, Send, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface AvatarData {
  name: string;
  personality: string;
  instructions: string;
  contextFile: string | null;
  responseStyle: "professional" | "casual" | "friendly" | "expert";
  enabled: boolean;
}

interface ProfileData {
  displayName: string;
}

interface AIChatPreviewProps {
  avatarData: AvatarData;
  profileData: ProfileData;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatPreview: React.FC<AIChatPreviewProps> = ({ avatarData, profileData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm ${avatarData.name}. I can help answer questions about ${profileData.displayName}. What would you like to know?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          profileId: 'preview', // For preview, we use a static ID
          sessionId: 'preview-session',
          userId: 'preview-user'
        }),
      });

      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please make sure your AI service is configured properly.' 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

return (
  <div className="shadow-lg max-w-md mx-auto">
    <div className="">
      <div className="space-y-4">
        {/* Chat Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/logo.svg"
                    alt="AI Assistant"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
              )}
              <div className={`${msg.role === 'user' ? 'max-w-xs bg-primary text-foreground' : 'flex-1 bg-card rounded-lg text-foreground'}`}>
                <div className="p-3">
                  <p className={`text-sm ${msg.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/logo.svg"
                  alt="AI Assistant"
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 bg-gray-100">
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {/* Status */}
        <div className="text-center">
        </div>
      </div>
    </div>
  </div>
);
};

export default AIChatPreview;