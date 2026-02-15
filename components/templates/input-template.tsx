'use client'
import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"

type PasswordStrength = 'Poor' | 'Average' | 'Strong Password'

function calculatePasswordStrength(password: string): { strength: PasswordStrength; score: number } {
    let score = 0
    
    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1 // lowercase
    if (/[A-Z]/.test(password)) score += 1 // uppercase
    if (/[0-9]/.test(password)) score += 1 // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1 // special characters
    
    // Determine strength level - three states only
    let strength: PasswordStrength = 'Poor'
    if (score <= 2) {
        strength = 'Poor'
    } else if (score <= 4) {
        strength = 'Average'
    } else {
        strength = 'Strong Password'
    }
    
    return { strength, score: Math.min(score, 5) }
}

function PasswordStrengthIndicator({ password }: { password: string }) {
    const { strength, score } = useMemo(() => calculatePasswordStrength(password), [password])
    
    const getStrengthColor = () => {
        switch (strength) {
            case 'Poor':
                return { bg: '#D42620', text: '#D42620' }
            case 'Average':
                return { bg: '#F3A218', text: '#F3A218' }
            case 'Strong Password':
                return { bg: '#0F973D', text: '#0F973D' }
            default:
                return { bg: '#E5E7EB', text: '#6B7280' }
        }
    }
    
    const colors = getStrengthColor()
    
    // Determine how many segments to fill based on strength
    let filledSegments = 0
    if (strength === 'Poor') {
        filledSegments = Math.min(score, 2) // 1-2 segments for Poor
    } else if (strength === 'Average') {
        filledSegments = Math.min(score, 4) // 3-4 segments for Average
    } else {
        filledSegments = 6 // All 6 segments for Strong Password
    }
    
    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-2">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="h-1 flex-1 rounded"
                        style={{
                            backgroundColor: index < filledSegments ? colors.bg : '#E5E7EB'
                        }}
                    />
                ))}
            </div>
            <p className="text-xs font-medium" style={{ color: colors.text }}>
                {strength}
            </p>
        </div>
    )
}

export default function InputTemplate(
    { className, placeholder, label, icon, align, description, value, onChange, type, showPasswordStrength, onIconClick, otpLength }: { className?: string, placeholder: string, label?: string, icon?: React.ReactNode, align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end', description?: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, showPasswordStrength?: boolean, onIconClick?: () => void, otpLength?: number }
) {
  const hasValue = value && value.length > 0
  const showStrength = showPasswordStrength && hasValue
  const showDescription = description && !showStrength
  
  // Determine if input should be controlled (both value and onChange provided)
  const isControlled = value !== undefined && onChange !== undefined
  
  // OTP mode
  const isOtpMode = otpLength !== undefined && otpLength > 0
  const otpLengthValue = otpLength || 6
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Initialize OTP array from value or empty array
  const [otpValues, setOtpValues] = useState<string[]>(() => {
    if (isOtpMode && value) {
      const otpArray = value.split('').slice(0, otpLengthValue)
      return [...otpArray, ...Array(otpLengthValue - otpArray.length).fill('')]
    }
    return Array(otpLengthValue).fill('')
  })

  // Sync OTP values with external value prop
  useEffect(() => {
    if (isOtpMode && value !== undefined) {
      const otpArray = value.split('').slice(0, otpLengthValue)
      const newOtp = [...otpArray, ...Array(otpLengthValue - otpArray.length).fill('')]
      setOtpValues(newOtp)
    }
  }, [value, isOtpMode, otpLengthValue])

  const handleOtpChange = (index: number, inputValue: string) => {
    if (inputValue.length > 1) return
    
    const newOtp = [...otpValues]
    newOtp[index] = inputValue
    setOtpValues(newOtp)

    // Create synthetic event for onChange callback
    if (onChange) {
      const otpString = newOtp.join('')
      const syntheticEvent = {
        target: { value: otpString }
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }

    // Auto-focus next input
    if (inputValue && index < otpLengthValue - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, otpLengthValue).split('')
    const newOtp = [...otpValues]
    pastedData.forEach((char, index) => {
      if (index < otpLengthValue && /^\d$/.test(char)) {
        newOtp[index] = char
      }
    })
    setOtpValues(newOtp)
    
    if (onChange) {
      const otpString = newOtp.join('')
      const syntheticEvent = {
        target: { value: otpString }
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
    
    const nextEmptyIndex = newOtp.findIndex(val => val === '')
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[otpLengthValue - 1]?.focus()
    }
  }

  if (isOtpMode) {
    return (
      <div>
        <Field className="">
          {label && <FieldLabel htmlFor="otp-input">{label}</FieldLabel>}
          <div className={cn("flex gap-3", className)}>
            {otpValues.map((otpValue, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                id={index === 0 ? "otp-input" : undefined}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpValue}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0"
                placeholder={placeholder || "-"}
              />
            ))}
          </div>
          {showDescription && <FieldDescription>{description}</FieldDescription>}
        </Field>
      </div>
    )
  }
  
  return (
    <div>
    <Field className="">
     {label && <FieldLabel htmlFor="inline-start-input">{label}</FieldLabel>}
      <InputGroup className={cn("w-full text-[#667185] text-sm  placeholder:text-[#667185] ", className)}>
        <InputGroupInput 
          id="inline-start-input" 
          placeholder={placeholder} 
          {...(isControlled ? { value: value ?? '', onChange } : {})}
          type={type} 
        />
        <InputGroupAddon align={align}>
         {icon && (
           <button
             type="button"
             onClick={onIconClick}
             className="cursor-pointer"
           >
             {icon}
           </button>
         )}
        </InputGroupAddon>
      </InputGroup>
      {showDescription && <FieldDescription>{description}</FieldDescription>}
      {showStrength && value && <div className='w-1/2!'><PasswordStrengthIndicator password={value} /></div>}
    </Field>
    </div>
  )
}