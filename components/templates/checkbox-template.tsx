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
    { label, description }: { label: string, description?: string }
) {
  return (
    <FieldGroup className="max-w-sm">
      <Field orientation="horizontal" className="flex items-center gap-2">
        <Checkbox id="terms-checkbox" name="terms-checkbox" />
        <Label htmlFor="terms-checkbox" className="text-xs font-normal">{label}</Label>
      </Field>
      {description && <FieldDescription>{description}</FieldDescription>}
    </FieldGroup>
  )
}
