"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function SliderTemplate(
    { min, max, step }: { min: number, max: number, step: number }
) {
  const [value, setValue] = React.useState([min, max])

  return (
    <div className="mx-auto grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-2">
        {/* <Label htmlFor="slider-demo-temperature">Temperature</Label> */}
        <span className="text-muted-foreground text-sm">{value[0]}</span>
        <span className="text-muted-foreground text-sm">{value[1]}</span>
      </div>
      <Slider
        id="slider-template"
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}
