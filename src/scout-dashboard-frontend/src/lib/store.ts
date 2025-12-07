import { create } from 'zustand'

interface FilterState {
  dateRange: {
    start: string
    end: string
  }
  selectedRegions: string[]
  selectedCategories: string[]
  selectedStore: string | null
  tenantId: string | null
  
  // Actions
  setDateRange: (range: { start: string; end: string }) => void
  setSelectedRegions: (regions: string[]) => void
  setSelectedCategories: (categories: string[]) => void
  setSelectedStore: (storeId: string | null) => void
  setTenantId: (tenantId: string) => void
  resetFilters: () => void
}

// Default date range: last 30 days
const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: getDefaultDateRange(),
  selectedRegions: [],
  selectedCategories: [],
  selectedStore: null,
  tenantId: null,
  
  setDateRange: (range) => set({ dateRange: range }),
  setSelectedRegions: (regions) => set({ selectedRegions: regions }),
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setSelectedStore: (storeId) => set({ selectedStore: storeId }),
  setTenantId: (tenantId) => set({ tenantId }),
  resetFilters: () => set({
    dateRange: getDefaultDateRange(),
    selectedRegions: [],
    selectedCategories: [],
    selectedStore: null,
  }),
}))
