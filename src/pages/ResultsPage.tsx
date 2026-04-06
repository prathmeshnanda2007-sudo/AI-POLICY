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
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

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

export function ResultsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['simulations', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      return blink.db.simulations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 20,
      }) as Promise<Simulation[]>
    },
    enabled: !!user?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.simulations.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] })
      toast.success('Simulation deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  // Build aggregate chart data from all simulations
  const chartData = simulations?.slice(0, 8).reverse().map((s, i) => ({
    name: `S${i + 1}`,
    fullName: s.name.substring(0, 20),
    inflation: s.predictedInflationChange,
    emissions: s.predictedEmissionsChange,
    transport: s.predictedTransportCostChange,
    gdp: s.predictedGdpChange,
    confidence: s.confidenceScore,
    fuelTax: s.fuelTax,
    carbonTax: s.carbonTax,
  })) || []

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Simulation Results</h1>
            <p className="text-muted-foreground text-sm">Historical policy impact predictions and trend analysis</p>
          </div>
          <Link to="/simulator">
            <Button size="sm" style={{ background: 'var(--gradient-primary)' }} className="gap-2">
              <FlaskConical className="w-3.5 h-3.5" />
              New Simulation
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-60 rounded-2xl bg-secondary/50" />
            ))}
          </div>
        ) : simulations && simulations.length > 0 ? (
          <>
            {/* Aggregate Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Inflation Impact Chart */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">Inflation Impact Across Simulations</h3>
                    <p className="text-xs text-muted-foreground">Predicted inflation change per scenario</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-destructive/30 text-destructive">% change</Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="inflation" name="Inflation %" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Emissions Chart */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">Carbon Emissions Impact</h3>
                    <p className="text-xs text-muted-foreground">Predicted emissions change per scenario</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">% change</Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="emissions" name="Emissions %" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* GDP vs Transport Cost */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">GDP vs Transport Cost</h3>
                    <p className="text-xs text-muted-foreground">Economic trade-offs across scenarios</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">% change</Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 20% 55%)' }} />
                    <Line type="monotone" dataKey="gdp" stroke="hsl(199 89% 48%)" name="GDP %" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="transport" stroke="hsl(38 92% 50%)" name="Transport %" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence Scores */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">Model Confidence Scores</h3>
                    <p className="text-xs text-muted-foreground">ML prediction reliability per scenario</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-accent/30 text-accent">score %</Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(186 85% 43%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(186 85% 43%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="confidence" stroke="hsl(186 85% 43%)" fill="url(#confGrad)" name="Confidence %" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simulation History Table */}
            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Simulation History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Inflation</th>
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Emissions</th>
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">GDP</th>
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {simulations.map((sim) => (
                      <tr key={sim.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium">{sim.name.substring(0, 30)}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`font-mono font-medium flex items-center gap-1 ${sim.predictedInflationChange > 0 ? 'text-destructive' : 'text-green-400'}`}>
                            {sim.predictedInflationChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {sim.predictedInflationChange > 0 ? '+' : ''}{sim.predictedInflationChange.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`font-mono font-medium ${sim.predictedEmissionsChange < 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {sim.predictedEmissionsChange > 0 ? '+' : ''}{sim.predictedEmissionsChange.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`font-mono font-medium ${sim.predictedGdpChange > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {sim.predictedGdpChange > 0 ? '+' : ''}{sim.predictedGdpChange.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            sim.riskLevel === 'low' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                            sim.riskLevel === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                            'text-destructive bg-destructive/10 border-destructive/20'
                          }`}>
                            {sim.riskLevel === 'low' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {sim.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${sim.confidenceScore}%`,
                                  background: 'var(--gradient-primary)',
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{sim.confidenceScore}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(sim.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => deleteMutation.mutate(sim.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Results Yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Run your first policy simulation to generate and visualize impact results.
            </p>
            <Link to="/simulator">
              <Button style={{ background: 'var(--gradient-primary)' }}>
                Go to Simulator
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
