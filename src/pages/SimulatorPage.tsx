import { useState, useEffect } from 'react'
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
  Download,
  Users,
  Leaf,
  Smile,
  DollarSign,
  Briefcase,
  Activity,
  Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'

const BACKEND_URL = 'https://66quhbhr.backend.blink.new'

const DEFAULT_PARAMS: PolicyParams = {
  taxRate: 20,
  subsidyAmount: 5,
  fuelPrice: 3.5,
  publicSpending: 15,
  interestRate: 4.5,
  envRegulation: 50,
}

const sliderConfig = [
  {
    key: 'taxRate' as keyof PolicyParams,
    label: 'Corporate Tax Rate',
    description: 'Percentage of corporate profit taken as tax',
    min: 0, max: 50, step: 0.5, unit: '%',
    color: 'hsl(199 89% 48%)',
  },
  {
    key: 'subsidyAmount' as keyof PolicyParams,
    label: 'Industrial Subsidy',
    description: 'Government financial aid to key sectors',
    min: 0, max: 30, step: 0.5, unit: '%',
    color: 'hsl(142 71% 45%)',
  },
  {
    key: 'fuelPrice' as keyof PolicyParams,
    label: 'Target Fuel Price',
    description: 'Regulated price per unit of industrial fuel',
    min: 1, max: 10, step: 0.1, unit: '$',
    color: 'hsl(38 92% 50%)',
  },
  {
    key: 'publicSpending' as keyof PolicyParams,
    label: 'Public Spending',
    description: 'Budget allocated to infrastructure & services',
    min: 0, max: 50, step: 1, unit: '%',
    color: 'hsl(270 67% 58%)',
  },
  {
    key: 'interestRate' as keyof PolicyParams,
    label: 'Interest Rate',
    description: 'Central bank target lending rate',
    min: 0, max: 15, step: 0.1, unit: '%',
    color: 'hsl(186 85% 43%)',
  },
  {
    key: 'envRegulation' as keyof PolicyParams,
    label: 'Env. Regulation',
    description: 'Stringency of emissions and pollution standards',
    min: 0, max: 100, step: 1, unit: '',
    color: 'hsl(160 84% 39%)',
  },
]

function ResultMetric({
  label,
  value,
  unit = '%',
  positive = true,
  icon: Icon,
}: {
  label: string
  value: number
  unit?: string
  positive?: boolean
  icon: any
}) {
  const isGood = positive ? value > 0 : value < 0
  if (label.includes('Satisfaction') || label.includes('Environmental')) {
    const scoreColor = value > 75 ? 'text-green-400' : value > 40 ? 'text-yellow-400' : 'text-destructive'
    return (
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <div className={`text-2xl font-bold font-mono ${scoreColor}`}>
          {value.toFixed(1)}{unit}
        </div>
      </div>
    )
  }
  
  const isNeutral = Math.abs(value) < 0.1
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono flex items-center justify-center gap-1 ${
        isNeutral ? 'text-muted-foreground' :
        isGood ? 'text-green-400' : 'text-destructive'
      }`}>
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
  const [simulationName, setSimulationName] = useState('Policy Analysis ' + new Date().toLocaleDateString())

  const predictMutation = useMutation({
    mutationFn: async (policyParams: PolicyParams) => {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyParams),
      })
      if (!response.ok) throw new Error('Neural engine timeout')
      return response.json()
    },
    onSuccess: (data) => {
      setResult(data)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Simulation failed')
    },
  })

  // Real-time updates with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      predictMutation.mutate(params)
    }, 400)
    return () => clearTimeout(timer)
  }, [params])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result || !user) throw new Error('No dataset to save')
      await blink.db.simulations.create({
        id: `sim_${Date.now()}`,
        userId: user.id,
        name: simulationName,
        taxRate: params.taxRate,
        subsidyAmount: params.subsidyAmount,
        fuelPrice: params.fuelPrice,
        publicSpending: params.publicSpending,
        interestRate: params.interestRate,
        envRegulation: params.envRegulation,
        predictedGdp: result.gdpGrowth,
        predictedInflation: result.inflation,
        predictedEmployment: result.employmentRate,
        predictedEnvImpact: result.envImpact,
        predictedSatisfaction: result.satisfaction,
        confidenceScore: result.confidenceScore,
        riskLevel: result.riskLevel,
        insights: JSON.stringify(result.insights),
        projectionData: JSON.stringify(result.projectionData),
        createdAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] })
      toast.success('Simulation archived successfully')
      navigate({ to: '/results' })
    },
    onError: () => toast.error('Cloud storage error. Record not saved.'),
  })

  const riskColors: any = {
    low: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: CheckCircle },
    medium: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: AlertTriangle },
    high: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: AlertTriangle },
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold mb-1">Interactive <span className="gradient-text">Policy Laboratory</span></h1>
            <p className="text-muted-foreground text-sm">Fine-tune economic levers and witness real-time ML projections of national stability.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 border-border">
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
            <Badge className="bg-primary/10 text-primary border-primary/20 gap-2 px-3 py-1.5 h-9">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              ML v4.2 Active
            </Badge>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-8">
          <div className="space-y-6 print:hidden">
            <div className="glass-card rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold">Neural Policy Controllers</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Input Parameters</p>
                </div>
              </div>

              <div className="grid gap-8">
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
                    onChange={(val) => setParams(p => ({ ...p, [config.key]: val }))}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setParams(DEFAULT_PARAMS)}
              className="w-full border border-dashed border-border hover:border-primary/30 text-muted-foreground hover:text-primary transition-all py-6 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restore Global Baseline
            </Button>
          </div>

          <div className="space-y-6">
            {result ? (
              <div className="animate-fade-in space-y-6">
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${
                      riskColors[result.riskLevel]?.text
                    } ${riskColors[result.riskLevel]?.bg} ${riskColors[result.riskLevel]?.border}`}>
                      {result.riskLevel.toUpperCase()} FEASIBILITY RISK
                    </div>
                  </div>
                  
                  <h2 className="font-bold mb-8 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    AI Impact Forecast
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <ResultMetric label="GDP Growth" value={result.gdpGrowth} icon={TrendingUp} />
                    <ResultMetric label="Inflation" value={result.inflation} positive={false} icon={TrendingDown} />
                    <ResultMetric label="Employment" value={result.employmentRate} icon={Briefcase} />
                    <ResultMetric label="Env. Quality" value={result.envImpact} unit="/100" icon={Leaf} />
                    <ResultMetric label="Social Trust" value={result.satisfaction} unit="/100" icon={Smile} />
                    <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Confidence</div>
                      <div className="text-2xl font-bold text-primary font-mono">{result.confidenceScore}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      <span>Model Stability Index</span>
                      <span>{result.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 bg-primary"
                        style={{ width: `${result.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border-yellow-500/10">
                  <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold">Neural Advisory Network</h3>
                  </div>
                  <div className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border/40 text-sm leading-relaxed group hover:border-primary/30 transition-colors">
                        <Info className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 print:hidden">
                  <h3 className="font-bold mb-4">Archive Analysis</h3>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Analysis name..." 
                      value={simulationName}
                      onChange={e => setSimulationName(e.target.value)}
                      className="bg-secondary/50 border-border focus:border-primary/50"
                    />
                    <Button 
                      onClick={() => saveMutation.mutate()} 
                      disabled={saveMutation.isPending}
                      className="bg-primary text-primary-foreground font-bold gap-2 shrink-0 px-6"
                    >
                      {saveMutation.isPending ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Archiving...
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 animate-pulse">
                  <Activity className="w-10 h-10 text-primary/30" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground/80">Awaiting Neural Signals</h3>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  Modify the policy levers on the left to initiate the regression model and generate real-time predictive datasets.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
