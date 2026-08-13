"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  applyMask,
  MASK_MAX_LENGTH,
  onlyDigits,
  type MaskKind,
} from "@/lib/masks"

type MaskedInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "maxLength"> & {
  mask: MaskKind
  value: string
  onValueChange: (masked: string) => void
}

export function MaskedInput({
  mask,
  value,
  onValueChange,
  inputMode,
  ...props
}: MaskedInputProps) {
  const numeric = mask !== "processo"

  const handleChange = (raw: string) => {
    if (mask === "processo" && /[A-Za-z]/.test(raw)) {
      onValueChange(applyMask(mask, raw))
      return
    }

    let digits = onlyDigits(raw)
    // Backspace em "." "()" ou "-" não pode ficar preso: apaga o último dígito.
    if (onlyDigits(raw) === onlyDigits(value) && raw.length < value.length) {
      digits = onlyDigits(value).slice(0, -1)
    }
    onValueChange(applyMask(mask, digits))
  }

  return (
    <Input
      {...props}
      value={applyMask(mask, value)}
      maxLength={MASK_MAX_LENGTH[mask]}
      inputMode={inputMode ?? (numeric ? "numeric" : "text")}
      autoComplete="off"
      onChange={(e) => handleChange(e.target.value)}
    />
  )
}
