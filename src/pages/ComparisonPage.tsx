import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { PolicySlider } from '../components/ui/policy-slider'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import type { PolicyParams, SimulationResult } from '../types'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  GitCompare,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const SIMULATION_ENDPOINT = 'https://66quhbhr.backend.blink.new/predict'

const SCENARIO_A_DEFAULTS: PolicyParams = {
  fuelTax: 5,
  transportSubsidy: 10,
  carbonTax: 20,
  evSubsidy: 10,
  gdpGrowth: 2.5,
  baseInflation: 3.0,
}

const SCENARIO_B_DEFAULTS: PolicyParams = {
  fuelTax: 12,
  transportSubsidy: 20,
  carbonTax: 60,
  evSubsidy: 35,
  gdpGrowth: 2.5,
  baseInflation: 3.0,
}

const sliderConfig = [
  { key: 'fuelTax' as keyof PolicyParams, label: 'Fuel Tax', min: 0, max: 20, step: 0.5, unit: '%' },
  { key: 'transportSubsidy' as keyof PolicyParams, label: 'Transport Sub.', min: 0, max: 30, step: 0.5, unit: '%' },
  { key: 'carbonTax' as keyof PolicyParams, label: 'Carbon Tax', min: 0, max: 100, step: 1, unit: '$/t' },
  { key: 'evSubsidy' as keyof PolicyParams, label: 'EV Subsidy', min: 0, max: 50, step: 1, unit: '%' },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-border shadow-lg text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function DeltaIndicator({ a, b, label, inverse = false }: { a: number; b: number; label: string; inverse?: boolean }) {
  const diff = b - a
  const better = inverse ? diff < 0 : diff > 0
  const icon = diff > 0.05 ? <TrendingUp className="w-3.5 h-3.5" /> : diff < -0.05 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={`flex items-center gap-1.5 text-sm font-semibold font-mono ${
        Math.abs(diff) < 0.05 ? 'text-muted-foreground' :
        better ? 'text-green-400' : 'text-destructive'
      }`}>
        {icon}
        {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
        <span className="text-xs font-normal text-muted-foreground ml-1">{better ? '(B better)' : a === b ? '' : '(A better)'}</span>
      </div>
    </div>
  )
}

export function ComparisonPage() {
  const [scenarioA, setScenarioA] = useState<PolicyParams>(SCENARIO_A_DEFAULTS)
  const [scenarioB, setScenarioB] = useState<PolicyParams>(SCENARIO_B_DEFAULTS)
  const [resultA, setResultA] = useState<SimulationResult | null>(null)
  const [resultB, setResultB] = useState<SimulationResult | null>(null)

  const runComparison = useMutation({
    mutationFn: async () => {
      const [resA, resB] = await Promise.all([
        fetch(SIMULATION_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenarioA),
        }).then(r => r.json()),
        fetch(SIMULATION_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenarioB),
        }).then(r => r.json()),
      ])
      return { resA, resB }
    },
    onSuccess: ({ resA, resB }) => {
      setResultA(resA)
      setResultB(resB)
      toast.success('Scenario comparison complete!')
    },
    onError: () => toast.error('Comparison failed. Please try again.'),
  })

  // Build comparison chart data
  const barData = resultA && resultB ? [
    {
      metric: 'Inflation',
      'Scenario A': resultA.inflationChange,
      'Scenario B': resultB.inflationChange,
    },
    {
      metric: 'Transport',
      'Scenario A': resultA.transportCostChange,
      'Scenario B': resultB.transportCostChange,
    },
    {
      metric: 'Emissions',
      'Scenario A': resultA.emissionsChange,
      'Scenario B': resultB.emissionsChange,
    },
    {
      metric: 'GDP',
      'Scenario A': resultA.gdpChange,
      'Scenario B': resultB.gdpChange,
    },
  ] : []

  // Radar chart data (normalize to 0-100 scale)
  const normalize = (val: number, min: number, max: number) =>
    Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))

  const radarData = resultA && resultB ? [
    {
      metric: 'Inflation Control',
      A: normalize(-resultA.inflationChange, -3, 3),
      B: normalize(-resultB.inflationChange, -3, 3),
    },
    {
      metric: 'Emission Reduction',
      A: normalize(-resultA.emissionsChange, -30, 5),
      B: normalize(-resultB.emissionsChange, -30, 5),
    },
    {
      metric: 'Transport Savings',
      A: normalize(-resultA.transportCostChange, -20, 10),
      B: normalize(-resultB.transportCostChange, -20, 10),
    },
    {
      metric: 'GDP Growth',
      A: normalize(resultA.gdpChange, -3, 3),
      B: normalize(resultB.gdpChange, -3, 3),
    },
    {
      metric: 'Confidence',
      A: resultA.confidenceScore,
      B: resultB.confidenceScore,
    },
  ] : []

  const riskStyle = (risk: string) => ({
    low: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    high: 'text-destructive bg-destructive/10 border-destructive/20',
  }[risk] || 'text-muted-foreground')

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Scenario Comparison</h1>
            <p className="text-muted-foreground text-sm">Run two policy scenarios head-to-head to identify optimal trade-offs</p>
          </div>
          <Button
            onClick={() => runComparison.mutate()}
            disabled={runComparison.isPending}
            className="gap-2 font-semibold"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {runComparison.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                Run Comparison
              </>
            )}
          </Button>
        </div>

        {/* Parameter Configuration */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Scenario A */}
          <div className="glass-card rounded-2xl p-6 border-primary/20 neon-border animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'hsl(199 89% 48%)' }}>
                A
              </div>
              <div>
                <h2 className="font-bold">Scenario A — Conservative</h2>
                <p className="text-xs text-muted-foreground">Low-intervention policy mix</p>
              </div>
            </div>
            <div className="space-y-5">
              {sliderConfig.map((config) => (
                <PolicySlider
                  key={config.key}
                  label={config.label}
                  description=""
                  value={scenarioA[config.key]}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  unit={config.unit}
                  color="hsl(199 89% 48%)"
                  onChange={(val) => setScenarioA((prev) => ({ ...prev, [config.key]: val }))}
                />
              ))}
            </div>
            {resultA && (
              <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-3">
                {[
                  { label: 'Inflation', val: resultA.inflationChange, good: false },
                  { label: 'Emissions', val: resultA.emissionsChange, good: true },
                  { label: 'Transport', val: resultA.transportCostChange, good: false },
                  { label: 'GDP', val: resultA.gdpChange, good: true },
                ].map(({ label, val, good }) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-secondary/30 border border-border">
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className={`text-sm font-bold font-mono ${(good ? val > 0 : val < 0) ? 'text-green-400' : 'text-destructive'}`}>
                      {val > 0 ? '+' : ''}{val.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scenario B */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.05s', borderColor: 'hsl(270 67% 58% / 0.2)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'hsl(270 67% 58%)' }}>
                B
              </div>
              <div>
                <h2 className="font-bold">Scenario B — Aggressive</h2>
                <p className="text-xs text-muted-foreground">High-intervention green policy mix</p>
              </div>
            </div>
            <div className="space-y-5">
              {sliderConfig.map((config) => (
                <PolicySlider
                  key={config.key}
                  label={config.label}
                  description=""
                  value={scenarioB[config.key]}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  unit={config.unit}
                  color="hsl(270 67% 58%)"
                  onChange={(val) => setScenarioB((prev) => ({ ...prev, [config.key]: val }))}
                />
              ))}
            </div>
            {resultB && (
              <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-3">
                {[
                  { label: 'Inflation', val: resultB.inflationChange, good: false },
                  { label: 'Emissions', val: resultB.emissionsChange, good: true },
                  { label: 'Transport', val: resultB.transportCostChange, good: false },
                  { label: 'GDP', val: resultB.gdpChange, good: true },
                ].map(({ label, val, good }) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-secondary/30 border border-border">
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className={`text-sm font-bold font-mono ${(good ? val > 0 : val < 0) ? 'text-green-400' : 'text-destructive'}`}>
                      {val > 0 ? '+' : ''}{val.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Run CTA if no results */}
        {!resultA && !resultB && (
          <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <GitCompare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Configure & Compare</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Adjust the policy parameters for both scenarios above, then click{' '}
              <strong className="text-foreground">Run Comparison</strong> to see side-by-side ML predictions.
            </p>
            <Button
              onClick={() => runComparison.mutate()}
              disabled={runComparison.isPending}
              style={{ background: 'var(--gradient-primary)' }}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Run Comparison Now
            </Button>
          </div>
        )}

        {/* Comparison Results */}
        {resultA && resultB && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Header */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Comparison Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(199 89% 48%)' }}>A</div>
                    <span className="font-semibold">Scenario A</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${riskStyle(resultA.riskLevel)}`}>
                      {resultA.riskLevel === 'low' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {resultA.riskLevel} risk
                    </span>
                    <Badge variant="outline" className="text-xs ml-auto">Conf: {resultA.confidenceScore}%</Badge>
                  </div>
                  <div>
                    <DeltaIndicator a={0} b={resultA.inflationChange} label="Inflation Impact" inverse />
                    <DeltaIndicator a={0} b={resultA.emissionsChange} label="Emissions Impact" />
                    <DeltaIndicator a={0} b={resultA.transportCostChange} label="Transport Cost Impact" inverse />
                    <DeltaIndicator a={0} b={resultA.gdpChange} label="GDP Impact" inverse={false} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(270 67% 58%)' }}>B</div>
                    <span className="font-semibold">Scenario B</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${riskStyle(resultB.riskLevel)}`}>
                      {resultB.riskLevel === 'low' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {resultB.riskLevel} risk
                    </span>
                    <Badge variant="outline" className="text-xs ml-auto">Conf: {resultB.confidenceScore}%</Badge>
                  </div>
                  <div>
                    <DeltaIndicator a={0} b={resultB.inflationChange} label="Inflation Impact" inverse />
                    <DeltaIndicator a={0} b={resultB.emissionsChange} label="Emissions Impact" />
                    <DeltaIndicator a={0} b={resultB.transportCostChange} label="Transport Cost Impact" inverse />
                    <DeltaIndicator a={0} b={resultB.gdpChange} label="GDP Impact" inverse={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Side-by-side Bar Chart */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-4">Impact Comparison (Grouped)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                    <XAxis dataKey="metric" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 20% 55%)' }} />
                    <Bar dataKey="Scenario A" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Scenario B" fill="hsl(270 67% 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-4">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(215 25% 16%)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 9 }} />
                    <Radar name="Scenario A" dataKey="A" stroke="hsl(199 89% 48%)" fill="hsl(199 89% 48%)" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Scenario B" dataKey="B" stroke="hsl(270 67% 58%)" fill="hsl(270 67% 58%)" fillOpacity={0.15} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 20% 55%)' }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Comparison */}
            <div className="grid lg:grid-cols-2 gap-6">
              {[
                { label: 'A', result: resultA, color: 'hsl(199 89% 48%)' },
                { label: 'B', result: resultB, color: 'hsl(270 67% 58%)' },
              ].map(({ label, result, color }) => (
                <div key={label} className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: color }}>
                      {label}
                    </div>
                    <h3 className="font-bold">Scenario {label} Insights</h3>
                  </div>
                  <div className="space-y-2">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground p-2.5 rounded-lg bg-secondary/20 border border-border">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
