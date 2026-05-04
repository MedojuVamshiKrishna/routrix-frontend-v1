"use client"

import { Check, ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface MultiSelectFilterProps {
  label: string
  options: string[]
  selectedValues: string[]
  allLabel: string
  onChange: (nextValues: string[]) => void
  className?: string
}

export default function MultiSelectFilter({
  label,
  options,
  selectedValues,
  allLabel,
  onChange,
  className,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const allSelected = selectedValues.length === 0
  const buttonLabel = allSelected
    ? `${label}: ${allLabel}`
    : `${label}: ${selectedValues.length} selected`

  function toggleValue(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value))
      return
    }

    onChange([...selectedValues, value])
  }

  return (
    <div className={className} ref={containerRef}>
      <button
        className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-accent focus:border-accent focus:ring-2 focus:ring-ring"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full min-w-[14rem] rounded-xl border border-border bg-card p-2 shadow-xl">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => onChange([])}
            type="button"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-background">
              {allSelected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </span>
            {allLabel}
          </button>
          <div className="mt-2 grid gap-1">
            {options.map((option) => {
              const selected = selectedValues.includes(option)

              return (
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  key={option}
                  onClick={() => toggleValue(option)}
                  type="button"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-background">
                    {selected ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="truncate">{option}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
