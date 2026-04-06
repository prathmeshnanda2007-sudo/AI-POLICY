import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '../lib/blink'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { PolicySlider } from '../components/ui/policy-slider'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import type { PolicyParams, SimulationResult } from '../types'
import {
  FlaskConical,
  Play,
  RotateCcw,
  Info,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Save,
} from 'lucide-react'
import toast from 'react-hot-toast'

const SIMULATION_ENDPOINT = 'https://66quhbhr.backend.blink.new/predict'

const DEFAULT_PARAMS: PolicyParams = {
  fuelTax: 5,
  transportSubsidy: 10,
  carbonTax: 25,
  evSubsidy: 15,
  gdpGrowth: 2.5,
  baseInflation: 3.0,
}

const sliderConfig = [
  {
    key: 'fuelTax' as keyof PolicyParams,
    label: 'Fuel Tax Increase',
    description: 'Additional tax on petroleum fuel',
    min: 0, max: 20, step: 0.5, unit: '%',
    color: 'hsl(199 89% 48%)',
  },
  {
    key: 'transportSubsidy' as keyof PolicyParams,
    label: 'Public Transport Subsidy',
    description: 'Government subsidy for public transit',
    min: 0, max: 30, step: 0.5, unit: '%',
    color: 'hsl(142 71% 45%)',
  },
  {
    key: 'carbonTax' as keyof PolicyParams,
    label: 'Carbon Tax',
    description: 'Carbon pricing per metric ton CO2',
    min: 0, max: 100, step: 1, unit: '$/t',
    color: 'hsl(38 92% 50%)',
  },
  {
    key: 'evSubsidy' as keyof PolicyParams,
    label: 'EV Purchase Subsidy',
    description: 'Subsidy for electric vehicle adoption',
    min: 0, max: 50, step: 1, unit: '%',
    color: 'hsl(270 67% 58%)',
  },
  {
    key: 'gdpGrowth' as keyof PolicyParams,
    label: 'Baseline GDP Growth',
    description: 'Current economic growth environment',
    min: 0, max: 5, step: 0.1, unit: '%',
    color: 'hsl(186 85% 43%)',
  },
  {
    key: 'baseInflation' as keyof PolicyParams,
    label: 'Baseline Inflation',
    description: 'Current inflation rate context',
    min: 0, max: 10, step: 0.1, unit: '%',
    color: 'hsl(0 72% 51%)',
  },
]

function ResultMetric({
  label,
  value,
  unit = '%',
  positive = false,
}: {
  label: string
  value: number
  unit?: string
  positive?: boolean
}) {
  const isGood = positive ? value > 0 : value < 0
  const isNeutral = Math.abs(value) < 0.1
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className={`text-2xl font-bold font-mono flex items-center justify-center gap-1 ${
        isNeutral ? 'text-muted-foreground' :
        isGood ? 'text-green-400' : 'text-destructive'
      }`}>
        {isGood && !isNeutral ? <TrendingDown className="w-4 h-4" /> : !isNeutral ? <TrendingUp className="w-4 h-4" /> : null}
        {value > 0 ? '+' : ''}{value.toFixed(2)}{unit}
      </div>
    </div>
  )
}

export function SimulatorPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState<PolicyParams>(DEFAULT_PARAMS)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [simulationName, setSimulationName] = useState('Policy Scenario ' + new Date().toLocaleDateString())
  const [projectionData, setProjectionData] = useState<SimulationResult['projectionData']>([])

  const simulateMutation = useMutation({
    mutationFn: async (policyParams: PolicyParams) => {
      const response = await fetch(SIMULATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyParams),
      })
      if (!response.ok) throw new Error('Simulation failed')
      return response.json()
    },
    onSuccess: (data) => {
      setResult(data)
      setProjectionData(data.projectionData || [])
      toast.success('Simulation complete!')
    },
    onError: () => {
      toast.error('Simulation failed. Please try again.')
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result || !user) throw new Error('No result to save')
      await blink.db.simulations.create({
        id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: user.id,
        name: simulationName,
        fuelTax: params.fuelTax,
        transportSubsidy: params.transportSubsidy,
        carbonTax: params.carbonTax,
        evSubsidy: params.evSubsidy,
        gdpGrowth: params.gdpGrowth,
        baseInflation: params.baseInflation,
        predictedInflationChange: result.inflationChange,
        predictedEmissionsChange: result.emissionsChange,
        predictedTransportCostChange: result.transportCostChange,
        predictedGdpChange: result.gdpChange,
        confidenceScore: result.confidenceScore,
        riskLevel: result.riskLevel,
        insights: JSON.stringify(result.insights),
        projectionData: JSON.stringify(projectionData),
        createdAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] })
      toast.success('Simulation saved!')
      navigate({ to: '/results' })
    },
    onError: () => {
      toast.error('Failed to save simulation')
    },
  })

  const updateParam = (key: keyof PolicyParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const riskColors = {
    low: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: CheckCircle },
    medium: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: AlertTriangle },
    high: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: AlertTriangle },
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Policy Simulator</h1>
            <p className="text-muted-foreground text-sm">Adjust parameters and run ML-powered impact predictions</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-2 px-3 py-1.5">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Random Forest Engine
          </Badge>
        </div>

        <div className="grid xl:grid-cols-2 gap-8">
          {/* Left: Policy Parameters */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold">Policy Parameters</h2>
                  <p className="text-xs text-muted-foreground">Configure your policy scenario</p>
                </div>
              </div>

              <div className="space-y-7">
                {sliderConfig.map((config) => (
                  <PolicySlider
                    key={config.key}
                    label={config.label}
                    description={config.description}
                    value={params[config.key]}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    unit={config.unit}
                    color={config.color}
                    onChange={(val) => updateParam(config.key, val)}
                  />
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => simulateMutation.mutate(params)}
                disabled={simulateMutation.isPending}
                className="flex-1 h-11 font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {simulateMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running ML Model...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setParams(DEFAULT_PARAMS); setResult(null) }}
                className="h-11 w-11 p-0 border-border hover:border-primary/30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Predicted Outcomes */}
                <div className="glass-card rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold">Predicted Outcomes</h2>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                      riskColors[result.riskLevel]?.text || ''
                    } ${riskColors[result.riskLevel]?.bg || ''} ${riskColors[result.riskLevel]?.border || ''}`}>
                      {result.riskLevel === 'low'
                        ? <CheckCircle className="w-3 h-3" />
                        : <AlertTriangle className="w-3 h-3" />
                      }
                      {result.riskLevel.toUpperCase()} RISK
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <ResultMetric label="Inflation Change" value={result.inflationChange} />
                    <ResultMetric label="Transport Cost" value={result.transportCostChange} />
                    <ResultMetric label="Carbon Emissions" value={result.emissionsChange} positive={false} />
                    <ResultMetric label="GDP Change" value={result.gdpChange} positive />
                  </div>

                  {/* Confidence */}
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Model Confidence Score</span>
                      <span className="text-sm font-bold text-primary font-mono">{result.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${result.confidenceScore}%`,
                          background: 'var(--gradient-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Policy Insights */}
                <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <h2 className="font-bold">ML Policy Insights</h2>
                  </div>
                  <div className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Form */}
                <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <h2 className="font-bold mb-4">Save Simulation</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="sim-name" className="text-sm">Simulation Name</Label>
                      <Input
                        id="sim-name"
                        value={simulationName}
                        onChange={(e) => setSimulationName(e.target.value)}
                        className="mt-1.5 bg-secondary/50 border-border focus:border-primary/50 h-10"
                      />
                    </div>
                    <Button
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      variant="outline"
                      className="w-full h-10 border-primary/30 text-primary hover:bg-primary/10 gap-2"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save to Dashboard
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <FlaskConical className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Ready to Simulate</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
                  Configure your policy parameters using the sliders on the left, then click{' '}
                  <strong className="text-foreground">Run Simulation</strong> to get ML-powered predictions.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Inflation impact
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Emissions forecast
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    Transport costs
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    GDP projection
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
