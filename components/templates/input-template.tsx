'use client'
import React, { useMemo } from 'react'
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
    { className, placeholder, label, icon, align, description, value, onChange, type, showPasswordStrength, onIconClick }: { className?: string, placeholder: string, label?: string, icon?: React.ReactNode, align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end', description?: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, showPasswordStrength?: boolean, onIconClick?: () => void }
) {
  const hasValue = value && value.length > 0
  const showStrength = showPasswordStrength && hasValue
  const showDescription = description && !showStrength
  
  // Determine if input should be controlled (both value and onChange provided)
  const isControlled = value !== undefined && onChange !== undefined
  
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