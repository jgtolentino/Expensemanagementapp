import { X } from 'lucide-react'
import { useFilterStore } from '@/lib/store'

interface RightFilterPanelProps {
  isOpen: boolean
}

const REGIONS = [
  'NCR', 'CALABARZON', 'Central Luzon', 'Central Visayas',
  'Western Visayas', 'Davao Region', 'Northern Mindanao'
]

const CATEGORIES = [
  'beverage', 'snacks', 'personal_care', 'household', 'food', 'tobacco', 'other'
]

export default function RightFilterPanel({ isOpen }: RightFilterPanelProps) {
  const {
    dateRange,
    selectedRegions,
    selectedCategories,
    setDateRange,
    setSelectedRegions,
    setSelectedCategories,
    resetFilters,
  } = useFilterStore()

  if (!isOpen) return null

  const toggleRegion = (region: string) => {
    setSelectedRegions(
      selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category]
    )
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset All
          </button>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input w-full"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        {/* Regions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regions ({selectedRegions.length} selected)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {REGIONS.map((region) => (
              <label key={region} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleRegion(region)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{region}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories ({selectedCategories.length} selected)
          </label>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {category.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}