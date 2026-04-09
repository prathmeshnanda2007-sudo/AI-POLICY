export interface User {
  id: string
  email: string
  displayName?: string
}

export interface PolicyParams {
  taxRate: number         // 0-50%
  subsidyAmount: number   // 0-30%
  fuelPrice: number       // 1-10 $/unit
  publicSpending: number  // 0-50%
  interestRate: number    // 0-15%
  envRegulation: number   // 0-100 score
}

export interface SimulationResult {
  gdpGrowth: number
  inflation: number
  employmentRate: number
  envImpact: number
  satisfaction: number
  confidenceScore: number
  riskLevel: 'low' | 'medium' | 'high'
  insights: string[]
  projectionData: Array<{
    month: string
    gdp: number
    inflation: number
    employment: number
    env: number
    satisfaction: number
  }>
}

export interface Simulation {
  id: string
  userId: string
  name: string
  // Inputs
  taxRate: number
  subsidyAmount: number
  fuelPrice: number
  publicSpending: number
  interestRate: number
  envRegulation: number
  // Outputs
  predictedGdp: number
  predictedInflation: number
  predictedEmployment: number
  predictedEnvImpact: number
  predictedSatisfaction: number
  // Metadata
  confidenceScore: number
  riskLevel: string
  insights: string
  projectionData: string
  createdAt: string
}

export interface ScenarioComparison {
  scenarioA: {
    name: string
    params: PolicyParams
    result?: SimulationResult
  }
  scenarioB: {
    name: string
    params: PolicyParams
    result?: SimulationResult
  }
}

export interface EconomicIndicator {
  year: number
  gdp: number
  inflation: number
  fuelPrice: number
  transportCost: number
  carbonEmissions: number
  country: string
}
