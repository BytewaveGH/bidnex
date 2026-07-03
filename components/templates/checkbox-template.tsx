"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"

export function CheckboxTemplate(
    { label, description, id = "terms-checkbox", checked, onCheckedChange }: {
      label: string
      description?: string
      id?: string
      checked?: boolean
      onCheckedChange?: (checked: boolean) => void
    }
) {
  return (
    <FieldGroup className="max-w-sm">
      <Field orientation="horizontal" className="flex items-center gap-2">
        <Checkbox
          id={id}
          name={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
        />
        <Label htmlFor={id} className="text-xs font-normal">{label}</Label>
      </Field>
      {description && <FieldDescription>{description}</FieldDescription>}
    </FieldGroup>
  )
}
