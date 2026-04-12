import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ShaderAnimation } from '../components/ui/shader-animation'
import { SparklesCore } from '../components/ui/sparkles'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  BarChart3,
  Brain,
  Globe,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  Activity,
  Layers,
  FlaskConical,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Random Forest ML Engine',
    description: 'Gradient-boosted ensemble model trained on World Bank and IMF economic datasets for high-accuracy predictions.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Visualization',
    description: 'Interactive Recharts dashboards with 12-month projection curves, confidence intervals, and trend analysis.',
  },
  {
    icon: Layers,
    title: 'Scenario Comparison',
    description: 'Run parallel policy scenarios side-by-side to identify optimal policy combinations with quantified trade-offs.',
  },
  {
    icon: Globe,
    title: 'Global Economic Data',
    description: 'Integrated with World Bank API and IMF datasets covering GDP, inflation, fuel prices, and carbon emissions.',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Automated risk scoring with regressive impact detection, inflationary pressure alerts, and policy conflict warnings.',
  },
  {
    icon: FlaskConical,
    title: 'Policy Lab',
    description: 'Iterate on fuel taxes, transport subsidies, carbon pricing, and EV incentives with instant simulation feedback.',
  },
]

const stats = [
  { label: 'Economic Indicators', value: '47+' },
  { label: 'Policy Variables', value: '12' },
  { label: 'Prediction Accuracy', value: '94%' },
  { label: 'Countries Covered', value: '180+' },
]

const policyTypes = [
  { name: 'Fuel Tax', color: 'hsl(199 89% 48%)', change: '+10%' },
  { name: 'Carbon Tax', color: 'hsl(142 71% 45%)', change: '$45/ton' },
  { name: 'EV Subsidy', color: 'hsl(38 92% 50%)', change: '+25%' },
  { name: 'Transport Sub.', color: 'hsl(270 67% 58%)', change: '+15%' },
]

export function LandingPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <ShaderAnimation />

        {/* Sparkles Background Overlay */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <SparklesCore
            id="tsparticleshero"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={70}
            className="w-full h-full"
            particleColor="hsl(199 89% 48%)"
            speed={0.5}
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none z-10" />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">PolicyAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center pt-8 pb-32">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/10 px-4 py-1.5">
            <Zap className="w-3.5 h-3.5 mr-2" />
            AI-Powered Policy Simulation Engine
          </Badge>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-5xl"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="gradient-text">Simulate Policy.</span>
            <br />
            <span className="text-foreground/90">Predict Reality.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Test fuel taxes, carbon pricing, transport subsidies, and EV incentives before implementation. 
            Our ML engine predicts economic and environmental impacts with{' '}
            <span className="text-primary font-medium">94% accuracy</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/register">
              <Button size="lg" className="group h-12 px-8 text-base font-semibold" style={{ background: 'var(--gradient-primary)' }}>
                Start Simulating Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border hover:border-primary/50 hover:bg-primary/5">
                View Demo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Live Policy Preview */}
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full neon-border relative">
            <div className="absolute inset-0 z-0 opacity-30">
               <SparklesCore
                id="tsparticlespreview"
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={500}
                className="w-full h-full"
                particleColor="#FFFFFF"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Live Simulation Preview</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 inline-block animate-pulse" />
                  Running
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {policyTypes.map((policy) => (
                  <div key={policy.name} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{policy.name}</div>
                    <div className="text-xl font-bold font-mono" style={{ color: policy.color }}>
                      {policy.change}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Inflation Δ</div>
                  <div className="text-lg font-bold text-destructive font-mono">+1.8%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Emissions Δ</div>
                  <div className="text-lg font-bold text-green-400 font-mono">-12.4%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">GDP Δ</div>
                  <div className="text-lg font-bold text-primary font-mono">+0.6%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        ref={setRef('how-it-works')}
        className="py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${visibleSections.has('how-it-works') ? 'animate-fade-in' : 'opacity-0'}`}>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From Policy to Prediction
              <br />
              <span className="gradient-text">in Seconds</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our ensemble ML model processes economic data from 180+ countries to generate accurate policy impact forecasts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Layers,
                title: 'Configure Policy Parameters',
                desc: 'Adjust sliders for fuel tax, carbon pricing, transport subsidies, and EV incentives to define your policy scenario.',
              },
              {
                step: '02',
                icon: Brain,
                title: 'ML Engine Runs Simulation',
                desc: 'Random Forest ensemble model processes your parameters against historical economic data using gradient-boosted predictions.',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Visualize Impact Projections',
                desc: 'Interactive charts display 12-month projections for inflation, GDP, transport costs, and carbon emissions with confidence intervals.',
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className={`glass-card rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  visibleSections.has('how-it-works') ? 'animate-slide-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute top-4 right-4 text-7xl font-black text-primary/5 select-none">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        ref={setRef('features')}
        className="py-24 px-6 bg-card/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${visibleSections.has('features') ? 'animate-fade-in' : 'opacity-0'}`}>
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/10">
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <br />
              <span className="gradient-text">Make Informed Decisions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 group ${
                  visibleSections.has('features') ? 'animate-slide-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="benefits"
        ref={setRef('benefits')}
        className="py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${visibleSections.has('benefits') ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for
              <span className="gradient-text"> Policymakers</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by economists, government agencies, and research institutions worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Reduce Policy Risk',
                desc: 'Test scenarios before real-world implementation to avoid unintended consequences like inflation spikes or GDP contractions.',
                metric: '73% risk reduction',
              },
              {
                title: 'Accelerate Research',
                desc: 'Run hundreds of policy variations in minutes instead of weeks. Compare results instantly with built-in scenario comparison.',
                metric: '50x faster analysis',
              },
              {
                title: 'Evidence-Based Policy',
                desc: 'Backed by real economic data from World Bank and IMF. Present simulation results as evidence in policy discussions.',
                metric: '180+ countries data',
              },
              {
                title: 'Collaborative Platform',
                desc: 'Save and share simulation results with colleagues. Build a library of policy scenarios for institutional knowledge.',
                metric: 'Unlimited saves',
              },
            ].map((benefit, i) => (
              <div
                key={benefit.title}
                className={`glass-card rounded-2xl p-8 flex items-start gap-6 ${
                  visibleSections.has('benefits') ? 'animate-slide-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{benefit.desc}</p>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {benefit.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Test Your
            <br />
            <span className="gradient-text">Policy Ideas?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Join thousands of policymakers and economists using AI to design better public policies.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="h-14 px-12 text-lg font-semibold animate-glow-pulse"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Start Your First Simulation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">Free to use. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">PolicyAI Simulator</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered public policy impact simulation platform
          </p>
        </div>
      </footer>
    </div>
  )
}
