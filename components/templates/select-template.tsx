import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { cn } from "@/lib/utils"
  
  export default function SelectTemplate(
    {
      className,
      placeholder,
      label,
      options,
      value,
      defaultValue,
      onValueChange,
    }: {
      className?: string
      placeholder: string
      label?: string
      options: { label: string; value: string }[]
      value?: string
      defaultValue?: string
      onValueChange?: (value: string) => void
    }
  ) {
    return (
      <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-full max-w-48", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
          { label && <SelectLabel>{label}</SelectLabel>}
          { options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
           
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
  