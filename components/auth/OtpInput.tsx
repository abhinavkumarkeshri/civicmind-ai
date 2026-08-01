'use client'

import { useRef, useState, useEffect } from 'react'

interface Props {
  length?: number
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpInput({ length = 6, onChange, disabled }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    onChange(digits.join(''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits])

  function handleChange(index: number, value: string) {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }
    // Handle paste of the full code into one box
    if (clean.length > 1) {
      const chars = clean.slice(0, length).split('')
      const next = [...digits]
      chars.forEach((c, i) => {
        if (index + i < length) next[index + i] = c
      })
      setDigits(next)
      const lastIndex = Math.min(index + chars.length, length - 1)
      inputsRef.current[lastIndex]?.focus()
      return
    }
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (index < length - 1) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={length}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg bg-[#111827] border border-[#1f2d45] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  )
}
