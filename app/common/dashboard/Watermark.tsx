
import React from 'react'
import Image from 'next/image'

interface WatermarkProps {
  className?: string
}

const Watermark: React.FC<WatermarkProps> = ({ className = "" }) => {
  return (
    <div className={`mt-6 pt-4 border-t border-border/50 flex justify-center ${className}`}>
      <div className="inline-flex items-center justify-center gap-2 text-xs text-black bg-white rounded-xl px-4 py-2">
        <span>Made with</span>
        <Image src="/images/monster.png" alt="Pasive Logo" width={16} height={16} className="object-contain" />
        <span className="font-medium">Pasive</span>
      </div>
    </div>
  )
}

export default Watermark
