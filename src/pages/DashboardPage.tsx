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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCircle,
  Users,
  Leaf,
  Smile,
  Shield,
  Briefcase,
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
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'text-green-400 bg-green-400/10' :
            trend === 'down' ? 'text-destructive bg-destructive/10' :
            'text-muted-foreground bg-muted'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1 font-mono tracking-tight">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{title}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-border shadow-lg text-xs">
        <p className="text-muted-foreground mb-1 font-bold uppercase tracking-wider">{label}</p>
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

function RiskBadge({ risk }: { risk: string }) {
  const colors: any = {
    low: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    high: 'text-destructive bg-destructive/10 border-destructive/20',
  }
  const icons: any = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
  }
  const Icon = icons[risk] || CheckCircle
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${colors[risk] || colors.low}`}>
      <Icon className="w-2.5 h-2.5" />
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
        limit: 15,
      })
      return results as Simulation[]
    },
    enabled: !!user?.id,
  })

  const lastSim = simulations?.[0]
  const recentStats = simulations?.slice(0, 8).reverse().map((s, i) => ({
    name: `Scenario ${i+1}`,
    gdp: s.predictedGdp,
    inflation: s.predictedInflation,
    employment: s.predictedEmployment,
    env: s.predictedEnvImpact,
    satisfaction: s.predictedSatisfaction
  })) || []

  const stats = {
    avgGdp: (simulations?.reduce((a, b) => a + b.predictedGdp, 0) || 0) / (simulations?.length || 1),
    avgSatisfaction: (simulations?.reduce((a, b) => a + b.predictedSatisfaction, 0) || 0) / (simulations?.length || 1),
    avgEnv: (simulations?.reduce((a, b) => a + b.predictedEnvImpact, 0) || 0) / (simulations?.length || 1),
    highRisk: simulations?.filter(s => s.riskLevel === 'high').length || 0
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto" key={animKey}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Neural <span className="gradient-text">Economic Command</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Real-time monitoring of simulation telemetry and national health indicators.
            </p>
          </div>
          <Link to="/simulator">
            <Button className="gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <FlaskConical className="w-4 h-4" />
              Launch Simulation Lab
            </Button>
          </Link>
        </div>

        {/* Global Aggregate Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Analyses"
            value={simulations?.length.toString() || '0'}
            icon={Activity}
            delay={0}
          />
          <MetricCard
            title="Stability Target"
            value={`${stats.avgGdp > 0 ? '+' : ''}${stats.avgGdp.toFixed(2)}%`}
            change="+0.4%"
            trend="up"
            icon={TrendingUp}
            delay={0.05}
          />
          <MetricCard
            title="Social Cohesion"
            value={`${stats.avgSatisfaction.toFixed(1)}/100`}
            icon={Smile}
            delay={0.1}
          />
          <MetricCard
            title="Critical Risks"
            value={stats.highRisk.toString()}
            trend={stats.highRisk > 0 ? 'down' : 'neutral'}
            icon={Shield}
            delay={0.15}
          />
        </div>

        {/* Neural Visualizations */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* GDP Growth Line Chart */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                GDP & Growth Dynamics
              </h3>
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">Time-Series Forecast</Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={recentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} hide />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="gdp" 
                  stroke="hsl(199 89% 48%)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'hsl(199 89% 48%)', strokeWidth: 2, stroke: 'white' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Inflationary Pressure Bar Chart */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Inflationary Telemetry
              </h3>
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-destructive/20 text-destructive">System Target: 2.0%</Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(215 25% 16%)', opacity: 0.4 }} />
                <Bar dataKey="inflation" radius={[4, 4, 0, 0]}>
                  {recentStats.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.inflation > 4 ? 'hsl(0 72% 51%)' : 'hsl(38 92% 50%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Employment Stabilization Chart */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent" />
                Labor Market Saturation
              </h3>
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-accent/20 text-accent">Workforce Index</Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={recentStats}>
                <defs>
                  <linearGradient id="employGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(186 85% 43%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(186 85% 43%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis domain={[90, 100]} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="stepAfter" 
                  dataKey="employment" 
                  stroke="hsl(186 85% 43%)" 
                  fill="url(#employGrad)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Environmental Sustainability Gauge */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-400" />
                Planetary Health Index
              </h3>
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-green-400/20 text-green-400">Score / 100</Badge>
            </div>
            
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-secondary/30"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 75}
                    strokeDashoffset={2 * Math.PI * 75 * (1 - (lastSim?.predictedEnvImpact || 50) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="text-green-400 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono tracking-tighter">{(lastSim?.predictedEnvImpact || 0).toFixed(0)}</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sustainability</span>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 text-center group hover:border-primary/30 transition-colors">
                  <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Carbon Reduction</div>
                  <div className="text-sm font-bold text-green-400">+14.2%</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 text-center group hover:border-primary/30 transition-colors">
                  <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Impact Percentile</div>
                  <div className="text-sm font-bold text-primary">Top 12%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Snippet */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Intelligence Repository Log
            </h3>
            <Link to="/results">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider gap-1 group">
                Full Repository Audit
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {simulations?.slice(0, 4).map(sim => (
              <div key={sim.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/30 hover:bg-secondary/20 hover:border-primary/30 transition-all group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">{sim.name}</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{new Date(sim.createdAt).toLocaleDateString()} • CONFIDENCE: {sim.confidenceScore}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex gap-6 text-right">
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] font-bold text-foreground">{(sim.predictedGdp > 0 ? '+' : '') + sim.predictedGdp.toFixed(2)}% GDP</div>
                      <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Growth Forecast</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] font-bold text-foreground">{sim.predictedInflation.toFixed(2)}% INFL</div>
                      <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Price Stability</div>
                    </div>
                  </div>
                  <RiskBadge risk={sim.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
