import React from 'react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"



export default function InputTemplate(
    { className, placeholder, label, icon, align, description }: { className?: string, placeholder: string, label?: string, icon?: React.ReactNode, align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end', description?: string }
) {
  return (
    <div>
    {/* <Input placeholder={placeholder}  className={cn("w-full text-[#667185] text-sm  placeholder:text-[#667185] ", className)}/> */}
    <Field className="">
     {label && <FieldLabel htmlFor="inline-start-input">{label}</FieldLabel>}
      <InputGroup className={cn("w-full text-[#667185] text-sm  placeholder:text-[#667185] ", className)}>
        <InputGroupInput id="inline-start-input"placeholder={placeholder}  />
        <InputGroupAddon align={align}>
         {icon && icon}
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
    </div>
  )
}