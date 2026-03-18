import React from "react"
import { Button } from "@/components/ui/button"

interface BioModeProps {
  saveProfile?: () => Promise<void>
}

const BioMode: React.FC<BioModeProps> = ({ saveProfile }) => {
  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="flex-1" />

      <div className="p-4 border-t border-border bg-card">
        <Button
          className="w-full h-10 bg-[#1a8d44] hover:bg-[#1a8d44]/90 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          onClick={saveProfile}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default BioMode
