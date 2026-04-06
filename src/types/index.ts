export interface User {
  id: string
  email: string
  displayName?: string
}

export interface PolicyParams {
  fuelTax: number         // 0-20%
  transportSubsidy: number // 0-30%
  carbonTax: number       // 0-100 $/ton
  evSubsidy: number       // 0-50%
  gdpGrowth: number       // 0-5%
  baseInflation: number   // 0-10%
}

export interface SimulationResult {
  inflationChange: number
  transportCostChange: number
  emissionsChange: number
  gdpChange: number
  confidenceScore: number
  riskLevel: 'low' | 'medium' | 'high'
  insights: string[]
  projectionData: Array<{
    month: string
    inflation: number
    transportCost: number
    emissions: number
    gdp: number
  }>
}

export interface Simulation {
  id: string
  userId: string
  name: string
  fuelTax: number
  transportSubsidy: number
  carbonTax: number
  evSubsidy: number
  gdpGrowth: number
  baseInflation: number
  predictedInflationChange: number
  predictedEmissionsChange: number
  predictedTransportCostChange: number
  predictedGdpChange: number
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

// Historical economic data for charts
export const HISTORICAL_DATA: EconomicIndicator[] = [
  { year: 2019, gdp: 21433, inflation: 2.3, fuelPrice: 2.60, transportCost: 100, carbonEmissions: 5.1, country: 'USA' },
  { year: 2020, gdp: 20893, inflation: 1.2, fuelPrice: 2.17, transportCost: 88, carbonEmissions: 4.5, country: 'USA' },
  { year: 2021, gdp: 23315, inflation: 4.7, fuelPrice: 3.27, transportCost: 105, carbonEmissions: 4.9, country: 'USA' },
  { year: 2022, gdp: 25463, inflation: 8.0, fuelPrice: 3.95, transportCost: 124, carbonEmissions: 5.0, country: 'USA' },
  { year: 2023, gdp: 27360, inflation: 4.1, fuelPrice: 3.53, transportCost: 118, carbonEmissions: 4.9, country: 'USA' },
  { year: 2024, gdp: 28781, inflation: 2.9, fuelPrice: 3.30, transportCost: 112, carbonEmissions: 4.8, country: 'USA' },
]
