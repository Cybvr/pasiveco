import React from "react"
import { Button } from "@/components/ui/button"

interface BioModeProps {
  saveProfile?: () => Promise<void>
}

const BioMode: React.FC<BioModeProps> = ({ saveProfile }) => {
  return (
    <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <Button
        className="h-10 bg-[#1a8d44] px-5 hover:bg-[#1a8d44]/90 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
        onClick={saveProfile}
      >
        Save Changes
      </Button>
    </div>
  )
}

export default BioMode
