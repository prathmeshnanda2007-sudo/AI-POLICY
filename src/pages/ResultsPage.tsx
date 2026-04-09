import { useQuery } from '@tanstack/react-query'
import { blink } from '../lib/blink'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import type { Simulation } from '../types'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Trash2,
  Clock,
  Download,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-border shadow-lg text-xs">
        <p className="text-muted-foreground mb-1 font-bold">{label}</p>
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

export function ResultsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['simulations', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const results = await blink.db.simulations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 20,
      })
      return results as Simulation[]
    },
    enabled: !!user?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.simulations.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] })
      toast.success('Simulation dataset purged')
    },
    onError: () => toast.error('Failed to delete record'),
  })

  // Build aggregate chart data from all simulations
  const chartData = simulations?.slice(0, 8).reverse().map((s, i) => ({
    name: `Scenario ${i + 1}`,
    shortName: `S${i + 1}`,
    gdp: s.predictedGdp,
    inflation: s.predictedInflation,
    employment: s.predictedEmployment,
    env: s.predictedEnvImpact,
    satisfaction: s.predictedSatisfaction,
  })) || []

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Intelligence <span className="gradient-text">Repository</span></h1>
            <p className="text-muted-foreground text-sm">Longitudinal analysis of simulation performance and outcome distributions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 border-border shadow-sm">
              <Download className="w-4 h-4" />
              Download Audit
            </Button>
            <Link to="/simulator">
              <Button size="sm" className="bg-primary text-primary-foreground gap-2 font-bold shadow-lg shadow-primary/20">
                <FlaskConical className="w-3.5 h-3.5" />
                New Simulation
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-60 rounded-2xl bg-secondary/50" />
            ))}
          </div>
        ) : simulations && simulations.length > 0 ? (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* GDP & Inflation Correlation */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold">Growth & Stability Dynamics</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">GDP % vs Inflation %</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">8-Test Window</Badge>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="gdp" stroke="hsl(199 89% 48%)" fill="url(#gdpGrad)" name="GDP %" strokeWidth={3} />
                    <Area type="monotone" dataKey="inflation" stroke="hsl(0 72% 51%)" fill="transparent" name="Inflation %" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Env vs Satisfaction */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold">Sustainability & Public Trust</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Impact Scores / 100</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-green-400/20 text-green-400">Policy Efficacy</Badge>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Line type="stepAfter" dataKey="env" stroke="hsl(142 71% 45%)" name="Environmental" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="stepAfter" dataKey="satisfaction" stroke="hsl(38 92% 50%)" name="Satisfaction" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Scenario Audit Log</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scenario</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GDP</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inflation</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Employment</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Env Score</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Social</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk</th>
                      <th className="pb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {simulations.map((sim) => (
                      <tr key={sim.id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="py-4 px-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{sim.name}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(sim.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs font-mono font-bold ${sim.predictedGdp > 2.5 ? 'text-green-400' : 'text-destructive'}`}>
                            {sim.predictedGdp > 0 ? '+' : ''}{sim.predictedGdp.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs font-mono font-bold ${sim.predictedInflation < 3 ? 'text-green-400' : 'text-destructive'}`}>
                            {sim.predictedInflation.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-xs font-mono font-bold text-accent">
                            {sim.predictedEmployment.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-green-400" style={{ width: `${sim.predictedEnvImpact}%` }} />
                            </div>
                            <span className="text-[10px] font-mono">{sim.predictedEnvImpact.toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${sim.predictedSatisfaction}%` }} />
                            </div>
                            <span className="text-[10px] font-mono">{sim.predictedSatisfaction.toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            sim.riskLevel === 'low' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                            sim.riskLevel === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                            'text-destructive bg-destructive/10 border-destructive/20'
                          }`}>
                            {sim.riskLevel}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button
                            onClick={() => deleteMutation.mutate(sim.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/60 rounded-3xl">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight">Intelligence Repository Empty</h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm leading-relaxed">
              Generate policy impact datasets in the simulator to begin populating your secure intelligence repository.
            </p>
            <Link to="/simulator">
              <Button className="bg-primary text-primary-foreground font-bold px-10">
                Generate First Dataset
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
