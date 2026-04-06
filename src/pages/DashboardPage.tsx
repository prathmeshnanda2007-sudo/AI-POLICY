import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { blink } from '../lib/blink'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import type { Simulation } from '../types'
import { HISTORICAL_DATA } from '../types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Clock,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  delay = 0,
}: {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  delay?: number
}) {
  return (
    <div
      className="glass-card rounded-xl p-5 animate-slide-up hover:-translate-y-0.5 transition-transform duration-200"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" style={{ width: '18px', height: '18px' }} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'text-green-400 bg-green-400/10' :
            trend === 'down' ? 'text-destructive bg-destructive/10' :
            'text-muted-foreground bg-muted'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-border shadow-lg text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function RiskBadge({ risk }: { risk: string }) {
  const colors = {
    low: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    high: 'text-destructive bg-destructive/10 border-destructive/20',
  }
  const icons = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
  }
  const Icon = icons[risk as keyof typeof icons] || CheckCircle
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${colors[risk as keyof typeof colors] || colors.low}`}>
      <Icon className="w-3 h-3" />
      {risk}
    </span>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    setAnimKey(k => k + 1)
  }, [])

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['simulations', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const results = await blink.db.simulations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 10,
      })
      return results as Simulation[]
    },
    enabled: !!user?.id,
  })

  const totalSims = simulations?.length || 0
  const avgInflation = simulations?.length
    ? (simulations.reduce((s, r) => s + r.predictedInflationChange, 0) / simulations.length).toFixed(2)
    : '0.00'
  const avgEmissions = simulations?.length
    ? (simulations.reduce((s, r) => s + r.predictedEmissionsChange, 0) / simulations.length).toFixed(2)
    : '0.00'
  const highRiskCount = simulations?.filter(s => s.riskLevel === 'high').length || 0

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto" key={animKey}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Researcher'}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              AI Policy Impact Simulator — Run scenarios, visualize outcomes
            </p>
          </div>
          <Link to="/simulator">
            <Button className="gap-2 font-semibold" style={{ background: 'var(--gradient-primary)' }}>
              <FlaskConical className="w-4 h-4" />
              New Simulation
            </Button>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Simulations"
            value={totalSims.toString()}
            icon={Activity}
            delay={0}
          />
          <MetricCard
            title="Avg. Inflation Change"
            value={`${avgInflation}%`}
            trend={parseFloat(avgInflation) > 0 ? 'up' : 'down'}
            change={parseFloat(avgInflation) > 0 ? 'increase' : 'decrease'}
            icon={TrendingUp}
            delay={0.05}
          />
          <MetricCard
            title="Avg. Emissions Change"
            value={`${avgEmissions}%`}
            trend={parseFloat(avgEmissions) < 0 ? 'up' : 'down'}
            change={parseFloat(avgEmissions) < 0 ? 'reduction' : 'increase'}
            icon={BarChart2}
            delay={0.1}
          />
          <MetricCard
            title="High-Risk Policies"
            value={highRiskCount.toString()}
            trend={highRiskCount > 0 ? 'down' : 'neutral'}
            icon={AlertTriangle}
            delay={0.15}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Historical GDP & Inflation */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Historical Economic Indicators</h3>
                <p className="text-xs text-muted-foreground">USA GDP ($B) & Inflation (%) 2019–2024</p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                World Bank Data
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={HISTORICAL_DATA}>
                <defs>
                  <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="gdp" stroke="hsl(199 89% 48%)" fill="url(#gdpGrad)" name="GDP ($B)" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="inflation" stroke="hsl(0 72% 51%)" fill="url(#inflGrad)" name="Inflation %" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Emissions Trend */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Carbon Emissions Trend</h3>
                <p className="text-xs text-muted-foreground">USA CO2 (metric tons per capita) 2019–2024</p>
              </div>
              <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">
                IMF Dataset
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={HISTORICAL_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} domain={[4, 5.5]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="carbonEmissions" stroke="hsl(142 71% 45%)" name="CO2 (tons/capita)" strokeWidth={2.5} dot={{ fill: 'hsl(142 71% 45%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Simulations */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Recent Simulations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your latest policy impact analyses</p>
            </div>
            <Link to="/results">
              <Button variant="outline" size="sm" className="gap-2 text-xs border-border hover:border-primary/30">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl bg-secondary/50" />
              ))}
            </div>
          ) : simulations && simulations.length > 0 ? (
            <div className="space-y-3">
              {simulations.slice(0, 5).map((sim) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sim.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-4 text-xs">
                      <span className={`font-mono font-medium ${sim.predictedInflationChange > 0 ? 'text-destructive' : 'text-green-400'}`}>
                        Inflation: {sim.predictedInflationChange > 0 ? '+' : ''}{sim.predictedInflationChange.toFixed(1)}%
                      </span>
                      <span className={`font-mono font-medium ${sim.predictedEmissionsChange < 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        CO2: {sim.predictedEmissionsChange > 0 ? '+' : ''}{sim.predictedEmissionsChange.toFixed(1)}%
                      </span>
                    </div>
                    <RiskBadge risk={sim.riskLevel} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No simulations yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Run your first policy simulation to see predicted economic and environmental impacts.
              </p>
              <Link to="/simulator">
                <Button size="sm" style={{ background: 'var(--gradient-primary)' }}>
                  Run First Simulation
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
