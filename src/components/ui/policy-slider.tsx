import { Slider } from './slider'

interface PolicySliderProps {
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  color?: string
  onChange: (value: number) => void
}

export function PolicySlider({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  color = 'hsl(199 89% 48%)',
  onChange,
}: PolicySliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div
          className="text-lg font-bold font-mono px-3 py-1 rounded-lg border"
          style={{
            color,
            borderColor: `${color}30`,
            background: `${color}10`,
          }}
        >
          {value}{unit}
        </div>
      </div>

      <div className="relative">
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          className="w-full"
          style={{ '--slider-color': color } as React.CSSProperties}
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-0.5">
          <span>{min}{unit}</span>
          <span className="text-xs" style={{ color, opacity: 0.6 }}>
            {pct.toFixed(0)}% of max
          </span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  )
}
