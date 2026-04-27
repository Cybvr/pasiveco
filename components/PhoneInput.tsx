"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import * as Select from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

export interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const countries: Country[] = [
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder, className, error }, ref) => {
    // Try to extract country from value if it starts with +
    const initialCountry = React.useMemo(() => {
      if (value.startsWith("+")) {
        for (const c of countries) {
          if (value.startsWith(c.dialCode)) return c
        }
      }
      return countries[0] // Default to Nigeria
    }, [value])

    const [country, setCountry] = React.useState<Country>(initialCountry)
    
    // The local number without the dial code
    const [localNumber, setLocalNumber] = React.useState(() => {
      if (value.startsWith(country.dialCode)) {
        return value.slice(country.dialCode.length).trim()
      }
      return value
    })

    // Sync local changes to parent
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "")
      setLocalNumber(val)
      onChange(`${country.dialCode}${val}`)
    }

    // Sync country changes to parent
    const handleCountryChange = (dialCode: string) => {
      const newCountry = countries.find(c => c.dialCode === dialCode) || countries[0]
      setCountry(newCountry)
      onChange(`${newCountry.dialCode}${localNumber}`)
    }

    // Update local state if prop value changes externally
    React.useEffect(() => {
      if (value.startsWith(country.dialCode)) {
        const num = value.slice(country.dialCode.length).trim()
        if (num !== localNumber) setLocalNumber(num)
      } else {
        // If value changed and no longer matches country dial code, find new country
        const matched = countries.find(c => value.startsWith(c.dialCode))
        if (matched) {
          setCountry(matched)
          setLocalNumber(value.slice(matched.dialCode.length).trim())
        } else if (value && !value.startsWith("+")) {
          // Assume it's a local number for the current country
          setLocalNumber(value.replace(/\D/g, ""))
          onChange(`${country.dialCode}${value.replace(/\D/g, "")}`)
        }
      }
    }, [value])

    return (
      <div className={cn("flex items-stretch gap-0 rounded-lg border bg-muted/40 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20", 
        error ? "border-destructive" : "border-input",
        className
      )}>
        <Select.Root value={country.dialCode} onValueChange={handleCountryChange}>
          <Select.Trigger 
            className="flex items-center gap-1.5 border-r border-input/50 px-3 py-2 text-[13px] font-medium outline-none transition-colors hover:bg-muted/60"
            aria-label="Select Country"
          >
            <Select.Value>
              <span className="flex items-center gap-1.5">
                <span className="text-base">{country.flag}</span>
                <span className="text-muted-foreground">{country.dialCode}</span>
              </span>
            </Select.Value>
            <Select.Icon>
              <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content 
              className="z-[200] min-w-[180px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in zoom-in-95 duration-100"
              position="popper"
              sideOffset={4}
            >
              <Select.Viewport className="p-1">
                {countries.map((c) => (
                  <Select.Item
                    key={c.code}
                    value={c.dialCode}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] outline-none transition-colors hover:bg-muted focus:bg-muted"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">{c.dialCode}</span>
                    </span>
                    <Select.ItemIndicator>
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <input
          ref={ref}
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"
