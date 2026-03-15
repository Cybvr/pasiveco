import type React from "react";
import { useState } from "react";
import { User, Upload, Save } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AvatarData {
  name: string;
  personality: string;
  instructions: string;
  contextFile: string | null;
  responseStyle: "professional" | "casual" | "friendly" | "expert";
  enabled: boolean;
}

interface AvatarModeProps {
  avatarData?: AvatarData;
  onAvatarDataChange?: (data: AvatarData) => void;
}

const AvatarMode: React.FC<AvatarModeProps> = ({ avatarData: initialData, onAvatarDataChange }) => {
  const [avatarData, setAvatarData] = useState<AvatarData>(initialData || {
    name: "My Avatar",
    personality: "I am a helpful and knowledgeable assistant representing the profile owner.",
    instructions: "Answer questions about my background, skills, services, and experience. Be helpful and provide accurate information based on the context provided.",
    contextFile: null,
    responseStyle: "professional",
    enabled: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof AvatarData, value: any) => {
    const newData = { ...avatarData, [field]: value };
    setAvatarData(newData);
    setHasChanges(true);
    onAvatarDataChange?.(newData);
  };

  const handleContextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you'd upload this to your backend
    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange("contextFile", file.name);
    };
    reader.readAsText(file);
  };

  const saveChanges = () => {
    setHasChanges(false);
    // In a real implementation, you'd save to your backend
    console.log("Saving avatar data:", avatarData);
  };

  const resetToDefaults = () => {
    const defaultData: AvatarData = {
      name: "My Avatar",
      personality: "I am a helpful and knowledgeable assistant representing the profile owner.",
      instructions: "Answer questions about my background, skills, services, and experience. Be helpful and provide accurate information based on the context provided.",
      contextFile: null,
      responseStyle: "professional",
      enabled: true,
    };
    setAvatarData(defaultData);
    setHasChanges(true);
    onAvatarDataChange?.(defaultData);
  };

  return (
    <div className="w-full md:w-96 p-4 sm:p-6 bg-background border-b md:border-b-0 md:border-r border-border">
      {/* Enable/Disable Toggle */}
      <div className="mb-6 p-4 bg-card rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Let visitors chat with your AI</p>
          </div>
          <button
            onClick={() => handleChange("enabled", !avatarData.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              avatarData.enabled ? "bg-primary" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                avatarData.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {/* How You Sound */}
        <AccordionItem value="personality" className="border-none bg-card rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>How You Sound</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Your Style</label>
                <textarea
                  value={avatarData.personality}
                  onChange={(e) => handleChange("personality", e.target.value)}
                  rows={3}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Tell us how you like to talk to people..."
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">What to Say</label>
                <textarea
                  value={avatarData.instructions}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  rows={4}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="What should people know about you? Your work, skills, experience..."
                />
                <p className="text-xs text-foreground mt-1">
                  Add your background, what you do, and anything else visitors might ask about.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Upload Info */}
        <AccordionItem value="knowledge" className="border-none bg-card rounded-lg">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              <span>Upload Info</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Add a File</label>
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleContextFileUpload}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary file:text-white hover:file:bg-orange-600"
                />
                <p className="text-xs text-foreground mt-1">
                  Upload your resume, bio, or any document with more details about you
                </p>
              </div>
              {avatarData.contextFile && (
                <div className="p-3 bg-card rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm text-white">{avatarData.contextFile}</span>
                    <button
                      onClick={() => handleChange("contextFile", null)}
                      className="ml-auto text-muted-foreground hover:text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <div className="p-3 bg-card/50 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">What to include:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Your work experience</li>
                  <li>• What services you offer</li>
                  <li>• Your skills and achievements</li>
                  <li>• How to contact you</li>
                  <li>• Common questions people ask</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-border">
        {hasChanges && (
          <button
            onClick={saveChanges}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-primary hover:bg-orange-600 rounded-lg transition-colors text-white text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Status:{" "}
          {avatarData.enabled ? (
            <span className="text-green-400">Your AI is ready</span>
          ) : (
            <span className="text-foreground">AI is off</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AvatarMode;