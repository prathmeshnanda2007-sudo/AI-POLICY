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
  ArrowRight,
  Download,
  Activity,
  Layers,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

const BACKEND_URL = 'https://66quhbhr.backend.blink.new'

const SCENARIO_A_DEFAULTS: PolicyParams = {
  taxRate: 20,
  subsidyAmount: 5,
  fuelPrice: 3.5,
  publicSpending: 15,
  interestRate: 4.5,
  envRegulation: 50,
}

const SCENARIO_B_DEFAULTS: PolicyParams = {
  taxRate: 30,
  subsidyAmount: 12,
  fuelPrice: 4.5,
  publicSpending: 25,
  interestRate: 5.5,
  envRegulation: 80,
}

const sliderConfig = [
  { key: 'taxRate' as keyof PolicyParams, label: 'Tax Rate', min: 0, max: 50, step: 0.5, unit: '%' },
  { key: 'subsidyAmount' as keyof PolicyParams, label: 'Subsidy', min: 0, max: 30, step: 0.5, unit: '%' },
  { key: 'fuelPrice' as keyof PolicyParams, label: 'Fuel Price', min: 1, max: 10, step: 0.1, unit: '$' },
  { key: 'publicSpending' as keyof PolicyParams, label: 'Spending', min: 0, max: 50, step: 1, unit: '%' },
  { key: 'interestRate' as keyof PolicyParams, label: 'Interest', min: 0, max: 15, step: 0.1, unit: '%' },
  { key: 'envRegulation' as keyof PolicyParams, label: 'Regulation', min: 0, max: 100, step: 1, unit: '' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-border shadow-lg text-xs">
        <p className="text-muted-foreground mb-1 font-bold uppercase tracking-widest">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function DeltaIndicator({ a, b, label, inverse = false, unit = '%' }: { a: number; b: number; label: string; inverse?: boolean; unit?: string }) {
  const diff = b - a
  const better = inverse ? diff < 0 : diff > 0
  const icon = Math.abs(diff) < 0.05 ? <Minus className="w-3 h-3" /> : diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
      <div className={`flex items-center gap-1.5 text-xs font-bold font-mono ${
        Math.abs(diff) < 0.05 ? 'text-muted-foreground' :
        better ? 'text-green-400' : 'text-destructive'
      }`}>
        {icon}
        {diff > 0 ? '+' : ''}{diff.toFixed(2)}{unit}
        <span className="text-[8px] opacity-60 ml-1">({better ? 'B' : 'A'} WIN)</span>
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
        fetch(`${BACKEND_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenarioA),
        }).then(r => r.json()),
        fetch(`${BACKEND_URL}/predict`, {
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
      toast.success('Differential analysis complete!')
    },
    onError: () => toast.error('Neural engine link failure'),
  })

  const barData = resultA && resultB ? [
    { metric: 'GDP Growth', 'Scenario A': resultA.gdpGrowth, 'Scenario B': resultB.gdpGrowth },
    { metric: 'Inflation', 'Scenario A': resultA.inflation, 'Scenario B': resultB.inflation },
    { metric: 'Labor %', 'Scenario A': resultA.employmentRate - 90, 'Scenario B': resultB.employmentRate - 90 }, // Visual offset
    { metric: 'Env Index', 'Scenario A': resultA.envImpact / 10, 'Scenario B': resultB.envImpact / 10 },
    { metric: 'Social Trust', 'Scenario A': resultA.satisfaction / 10, 'Scenario B': resultB.satisfaction / 10 },
  ] : []

  const normalize = (val: number, min: number, max: number) =>
    Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))

  const radarData = resultA && resultB ? [
    { metric: 'Economic Expansion', A: normalize(resultA.gdpGrowth, -2, 6), B: normalize(resultB.gdpGrowth, -2, 6) },
    { metric: 'Price Stability', A: normalize(6 - resultA.inflation, 0, 6), B: normalize(6 - resultB.inflation, 0, 6) },
    { metric: 'Labor Resilience', A: normalize(resultA.employmentRate, 90, 100), B: normalize(resultB.employmentRate, 90, 100) },
    { metric: 'Environmental Health', A: resultA.envImpact, B: resultB.envImpact },
    { metric: 'Public Confidence', A: resultA.satisfaction, B: resultB.satisfaction },
  ] : []

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto print:p-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold mb-1">Comparative <span className="gradient-text">Policy Intelligence</span></h1>
            <p className="text-muted-foreground text-sm">Differential analysis of two concurrent scenarios to optimize fiscal and social trade-offs.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 border-border shadow-sm">
              <Download className="w-4 h-4" />
              Download Audit
            </Button>
            <Button 
              onClick={() => runComparison.mutate()} 
              disabled={runComparison.isPending}
              className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6"
            >
              {runComparison.isPending ? <Activity className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
              Compare Scenarios
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8 print:mb-4">
          <div className="glass-card rounded-2xl p-6 border-primary/20 animate-slide-up relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">A</div>
                <h2 className="font-bold">Conservative Baseline</h2>
              </div>
              {resultA && <Badge className="bg-primary/5 text-primary border-primary/10 font-mono text-[9px]">Conf: {resultA.confidenceScore}%</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 print:grid-cols-3">
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
                  onChange={(val) => setScenarioA(p => ({ ...p, [config.key]: val }))}
                />
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-accent/20 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center font-bold text-accent">B</div>
                <h2 className="font-bold">Aggressive Expansion</h2>
              </div>
              {resultB && <Badge className="bg-accent/5 text-accent border-accent/10 font-mono text-[9px]">Conf: {resultB.confidenceScore}%</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 print:grid-cols-3">
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
                  color="hsl(186 85% 43%)"
                  onChange={(val) => setScenarioB(p => ({ ...p, [config.key]: val }))}
                />
              ))}
            </div>
          </div>
        </div>

        {resultA && resultB ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Comparative Performance Delta
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-primary" /> Scenario A
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-accent" /> Scenario B
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" vertical={false} />
                    <XAxis dataKey="metric" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(215 25% 16%)', opacity: 0.4 }} />
                    <Bar dataKey="Scenario A" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Scenario B" fill="hsl(186 85% 43%)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-2xl p-6 flex flex-col">
                <h3 className="font-bold mb-8 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Neural Trade-off Analysis
                </h3>
                <div className="space-y-1 flex-1">
                  <DeltaIndicator a={resultA.gdpGrowth} b={resultB.gdpGrowth} label="Economic Growth" />
                  <DeltaIndicator a={resultA.inflation} b={resultB.inflation} label="Inflation Pressure" inverse />
                  <DeltaIndicator a={resultA.employmentRate} b={resultB.employmentRate} label="Labor Resilience" />
                  <DeltaIndicator a={resultA.envImpact} b={resultB.envImpact} label="Sustainability Index" unit="/100" />
                  <DeltaIndicator a={resultA.satisfaction} b={resultB.satisfaction} label="Social Equilibrium" unit="/100" />
                </div>
                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">Automated Conclusion</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    {resultB.gdpGrowth > resultA.gdpGrowth + 1 
                      ? "Scenario B offers superior economic expansion, but requires significant carbon mitigation to maintain planetary health scores."
                      : "Scenario A maintains a more stable fiscal baseline with lower systemic risk, though at the cost of aggressive industrial modernization."
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-8 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  Strategic Radar Mapping
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="hsl(215 25% 16%)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Scenario A" dataKey="A" stroke="hsl(199 89% 48%)" fill="hsl(199 89% 48%)" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Scenario B" dataKey="B" stroke="hsl(186 85% 43%)" fill="hsl(186 85% 43%)" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Download className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Institutional Policy Report</h3>
                <p className="text-sm text-muted-foreground mb-10 max-w-xs leading-relaxed">
                  Download a comprehensive audit of this comparison, including all telemetry charts, model weights, and AI-generated risk assessments.
                </p>
                <Button variant="outline" size="lg" className="w-full max-w-xs border-border hover:border-primary/30 font-bold" onClick={() => window.print()}>
                  Generate PDF Report
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-24 flex flex-col items-center justify-center text-center animate-fade-in border border-dashed border-border/60">
            <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-8 rotate-12 group hover:rotate-0 transition-transform">
              <GitCompare className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Strategic Benchmarking Initiated</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed">
              Configure Scenario A and B parameters above to trigger the neural engine and generate a high-fidelity comparative impact audit.
            </p>
            <Button 
              size="lg" 
              onClick={() => runComparison.mutate()} 
              disabled={runComparison.isPending}
              className="bg-primary text-primary-foreground font-bold px-12 h-14 text-lg shadow-xl shadow-primary/30"
            >
              Start Differential Analysis
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
