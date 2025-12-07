# Scout × SariCoach Production Implementation Plan

**Date:** 2025-12-07  
**Status:** Core Infrastructure Complete, Ready for Page Implementation  
**Completion:** Phase 1 (Infrastructure) 100%, Phase 2 (Pages) 0%

---

## 📦 Phase 1 Deliverables (COMPLETE)

### 1.1 TypeScript Types ✅

**Files Created:**
- `/src/types/entities.ts` (300+ lines)
  - Core Odoo-aligned types: Store, Transaction, Product, Brand, Customer
  - Enums: ProductCategory, TimeOfDay, Gender, AgeGroup, IncomeSegment
  - Location hierarchy, Weather, Events, Ad Network types

- `/src/types/analytics.ts` (400+ lines)
  - All analytics view types matching dashboard pages
  - KPI cards, Dashboard Overview, Transaction Trends, Product Mix
  - Consumer Behavior, Consumer Profiling, Geo Intelligence
  - Data Dictionary, AI Insights & Recommendations

- `/src/types/filters.ts` (200+ lines)
  - FilterState with 20+ filter dimensions
  - TimeRange presets, AnalysisMode, ComparisonTarget
  - DisplayOptions, FilterActions, FilterPresets

### 1.2 API Client Layer ✅

**Files Created:**
- `/src/api/client.ts` (200+ lines)
  - Base HTTP client with auth, tenant isolation, error handling, retries
  - `setAuthContext()`, `clearAuthContext()` for JWT management
  - `serializeFilters()` helper for converting FilterState to API params
  - Error types: `ApiError`, `NetworkError`

- `/src/api/scout.ts` (300+ lines)
  - Typed endpoints for all analytics views:
    - `getDashboardOverview()`
    - `getTransactionTrends()`
    - `getProductMixAnalytics()`
    - `getConsumerBehaviorAnalytics()`
    - `getConsumerProfilingAnalytics()`
    - `getGeoIntelligenceAnalytics()`
    - `getTransactionsSchema()`
    - `askScoutAi()`
  - Retail OS endpoints:
    - `getRetailOsOverview()` (Tantrum Tamer, Scan & Switch, Predictive Stock, Brand Command Center)
  - Export functions: `exportData()`

### 1.3 TanStack Query Hooks ✅

**File Created:**
- `/src/hooks/useScout.ts` (250+ lines)
  - Hooks for all analytics views:
    - `useDashboardOverview()`
    - `useTransactionTrends()`
    - `useProductMixAnalytics()`
    - `useConsumerBehaviorAnalytics()`
    - `useConsumerProfilingAnalytics()`
    - `useGeoIntelligenceAnalytics()`
    - `useTransactionsSchema()`
    - `useAskScoutAi()` (mutation)
    - `useRetailOsOverview()`
  - Prefetch helpers: `usePrefetchDashboard()`, `usePrefetchTransactionTrends()`
  - Invalidation helpers: `useInvalidateScoutQueries()`
  - Query keys factory: `scoutKeys`

### 1.4 Zustand Filter Store ✅

**File Created:**
- `/src/stores/filterStore.ts` (300+ lines)
  - Global filter state with 20+ dimensions
  - Actions for all filter operations
  - LocalStorage persistence
  - Time range presets (today, yesterday, last 7/30/90 days, this month/quarter/year)
  - Filter presets (all_data, top_performers, high_value_customers, impulse_buyers, etc.)
  - Computed selectors: `useActiveFilterCount()`, `useFilterSummary()`

### 1.5 Auth Context ✅

**File Created:**
- `/src/contexts/AuthContext.tsx` (250+ lines)
  - `AuthProvider` with Supabase Auth integration
  - `useAuth()` hook exposing:
    - `user`, `session`, `isLoading`, `isAuthenticated`
    - Role checks: `hasRole()`, `isSuperAdmin`, `isAnalyst`, `isBrandSponsor`, `isStoreOwner`
    - Auth actions: `signIn()`, `signOut()`
  - `ProtectedRoute` wrapper component
  - Loads user roles from `scout.user_roles` table
  - Sets API client context on auth

### 1.6 Updated Configuration ✅

**Files Updated:**
- `/src/App.tsx` - Wrapped with `AuthProvider`
- `/.env.example` - Added `VITE_API_BASE_URL` for backend gateway

---

## 📋 Phase 2: Wire Existing Pages (IN PROGRESS)

### 2.1 Dashboard Overview (Prototype → Production)

**Current State:**
- ✅ Layout complete
- ✅ KPI cards rendering
- ❌ Using mock data from old Supabase Edge Function

**Required Changes:**
1. Replace `invokeScoutFunction()` with `useDashboardOverview()` hook
2. Pass filter state from `useFilterStore()`
3. Add loading/error/empty states
4. Add refresh button
5. Add export button

**File:** `/src/routes/DashboardOverview.tsx`

**Estimated Time:** 1 hour

---

### 2.2 Transaction Trends (Placeholder → Production)

**Current State:**
- ✅ Route exists
- ❌ Placeholder content only

**Required Implementation:**

#### 2.2.1 Page Structure
```tsx
<PageContainer>
  <PageHeader title="Transaction Trends" />
  <KpiCards kpis={data.kpis} />
  <TabNavigation tabs={['volume', 'revenue', 'basket_size', 'duration']} />
  <TimeSeriesChart data={data.time_series[activeTab]} />
  <BreakdownsSection breakdowns={data.breakdowns} />
  <AiInsightsPanel route="transaction-trends" />
</PageContainer>
```

#### 2.2.2 Components Needed
- `TimeSeriesChart` (Recharts LineChart wrapper)
- `BreakdownPieChart` (for time_of_day, day_of_week)
- `TabNavigation`
- `ExportButton`

#### 2.2.3 Data Wiring
```tsx
const filters = useFilterStore()
const [activeTab, setActiveTab] = useState<TrendTab>('revenue')

const { data, isLoading, error } = useTransactionTrends({
  ...filters,
  tab: activeTab,
  granularity: 'day',
})
```

**Estimated Time:** 4-6 hours

---

### 2.3 Product Mix & SKU Analytics (New Page)

**Required Implementation:**

#### 2.3.1 Page Structure
```tsx
<PageContainer>
  <PageHeader title="Product Mix & SKU Analytics" />
  <KpiCards kpis={data.kpis} />
  <TabNavigation tabs={['category_mix', 'pareto', 'substitutions', 'basket']} />
  
  {activeTab === 'category_mix' && <CategoryPieChart data={data.category_distribution} />}
  {activeTab === 'pareto' && <ParetoChart data={data.pareto_analysis} />}
  {activeTab === 'substitutions' && <SankeyDiagram data={data.substitution_matrix} />}
  {activeTab === 'basket' && <BasketCompositionTable data={data.basket_composition} />}
  
  <AiInsightsPanel route="product-mix" />
</PageContainer>
```

#### 2.3.2 Components Needed
- `CategoryPieChart` (Recharts PieChart)
- `ParetoChart` (Recharts ComposedChart with bars + line)
- `SankeyDiagram` (Recharts Sankey or custom D3)
- `BasketCompositionTable`

#### 2.3.3 Data Wiring
```tsx
const filters = useFilterStore()
const [activeTab, setActiveTab] = useState<ProductMixTab>('category_mix')

const { data, isLoading, error } = useProductMixAnalytics({
  ...filters,
  tab: activeTab,
})
```

**Estimated Time:** 5-7 hours

---

### 2.4 Consumer Behavior Analytics (New Page)

**Required Implementation:**

#### 2.4.1 Page Structure
```tsx
<PageContainer>
  <PageHeader title="Consumer Behavior Analytics" />
  <KpiCards kpis={data.kpis} />
  <BehaviorFunnelChart funnel={data.funnel} />
  <TabNavigation tabs={['funnel', 'request_methods', 'acceptance', 'traits']} />
  
  {activeTab === 'funnel' && <FunnelVisualization data={data.funnel} />}
  {activeTab === 'request_methods' && <RequestMethodsBarChart data={data.request_methods} />}
  {activeTab === 'acceptance' && <AcceptanceRatesChart data={data.acceptance_rates} />}
  {activeTab === 'traits' && <BehaviorTraitsTable data={data.behavior_traits} />}
  
  <AiInsightsPanel route="consumer-behavior" />
</PageContainer>
```

#### 2.4.2 Components Needed
- `BehaviorFunnelChart` (Custom funnel visualization)
- `RequestMethodsBarChart` (Recharts BarChart)
- `AcceptanceRatesChart` (Recharts ComposedChart)
- `BehaviorTraitsTable`

#### 2.4.3 Data Wiring
```tsx
const filters = useFilterStore()
const [activeTab, setActiveTab] = useState<BehaviorTab>('funnel')

const { data, isLoading, error } = useConsumerBehaviorAnalytics({
  ...filters,
  tab: activeTab,
})
```

**Estimated Time:** 5-7 hours

---

### 2.5 Consumer Profiling Analytics (New Page)

**Required Implementation:**

#### 2.5.1 Page Structure
```tsx
<PageContainer>
  <PageHeader title="Consumer Profiling Analytics" />
  <KpiCards kpis={data.kpis} />
  <TabNavigation tabs={['income', 'age_gender', 'urban_rural', 'segments']} />
  
  {activeTab === 'income' && <IncomePieChart data={data.income_distribution} />}
  {activeTab === 'age_gender' && <AgeGenderHeatmap data={data.age_gender_distribution} />}
  {activeTab === 'urban_rural' && <UrbanRuralBarChart data={data.urban_rural_split} />}
  {activeTab === 'segments' && <SegmentBehaviorTable data={data.segment_behaviors} />}
  
  <AiInsightsPanel route="consumer-profiling" />
</PageContainer>
```

#### 2.5.2 Components Needed
- `IncomePieChart` (Recharts PieChart)
- `AgeGenderHeatmap` (Recharts or custom grid)
- `UrbanRuralBarChart` (Recharts BarChart)
- `SegmentBehaviorTable`

#### 2.5.3 Data Wiring
```tsx
const filters = useFilterStore()
const [activeTab, setActiveTab] = useState<ProfilingTab>('income')

const { data, isLoading, error } = useConsumerProfilingAnalytics({
  ...filters,
  tab: activeTab,
})
```

**Estimated Time:** 4-6 hours

---

### 2.6 Geographical Intelligence (New Page)

**Required Implementation:**

#### 2.6.1 Page Structure
```tsx
<PageContainer>
  <PageHeader title="Geographical Intelligence" />
  <KpiCards kpis={data.kpis} />
  <TabNavigation tabs={['regional', 'stores', 'demographics', 'penetration']} />
  
  {activeTab === 'regional' && <RegionalPerformanceTable data={data.regional_performance} />}
  {activeTab === 'stores' && <StoreLocationMap stores={data.store_locations} />}
  {activeTab === 'demographics' && <RegionalDemographicsChart data={data.regional_demographics} />}
  {activeTab === 'penetration' && <MarketPenetrationChart data={data.market_penetration} />}
  
  <AiInsightsPanel route="geo-intelligence" />
</PageContainer>
```

#### 2.6.2 Components Needed
- `RegionalPerformanceTable`
- `StoreLocationMap` (Leaflet or Mapbox)
- `RegionalDemographicsChart` (Recharts RadarChart)
- `MarketPenetrationChart` (Recharts BarChart with penetration rate overlay)

#### 2.6.3 Data Wiring
```tsx
const filters = useFilterStore()
const [activeTab, setActiveTab] = useState<GeoTab>('regional')

const { data, isLoading, error } = useGeoIntelligenceAnalytics({
  ...filters,
  tab: activeTab,
})
```

**Estimated Time:** 6-8 hours

---

### 2.7 Data Dictionary (Transactions Schema) (New Page)

**Required Implementation:**

#### 2.7.1 Page Structure
```tsx
<PageContainer>
  <PageHeader title="Scout Dashboard - Transactions" subtitle="Data Dictionary" />
  
  <SearchBar onSearch={setSearchQuery} />
  <TagFilters tags={['basic_info', 'product_data', 'customer_info', 'behavior', 'business_logic']} />
  
  <SchemaTable fields={filteredFields} />
  
  <ExportButtons formats={['csv', 'markdown']} />
</PageContainer>
```

#### 2.7.2 Components Needed
- `SearchBar`
- `TagFilters`
- `SchemaTable` with columns: Field Name, Type, Required, Description, Example, Tags
- `ExportButtons`

#### 2.7.3 Data Wiring
```tsx
const [searchQuery, setSearchQuery] = useState('')
const [selectedTags, setSelectedTags] = useState<FieldTag[]>([])

const { data, isLoading, error } = useTransactionsSchema()

const filteredFields = useMemo(() => {
  return data?.fields.filter(field => {
    const matchesSearch = field.field_name.includes(searchQuery) || 
                          field.description.includes(searchQuery)
    const matchesTags = selectedTags.length === 0 || 
                        field.tags.some(tag => selectedTags.includes(tag))
    return matchesSearch && matchesTags
  })
}, [data, searchQuery, selectedTags])
```

**Estimated Time:** 3-4 hours

---

## 📋 Phase 3: New Features

### 3.1 Retail OS Landing Page (New)

**Route:** `/retail-os`

**Page Structure:**
```tsx
<PageContainer>
  <HeroSection title="Scout × SariCoach Retail OS" />
  
  <TileGrid>
    <RetailOsTile
      title="Tantrum Tamer Mode"
      icon={<Baby />}
      stats={data.tantrum_tamer}
      deepLink="/consumer-behavior?preset=impulse_buyers"
    />
    <RetailOsTile
      title="Scan & Switch Conquesting"
      icon={<Scan />}
      stats={data.scan_and_switch}
      deepLink="/product-mix?tab=substitutions"
    />
    <RetailOsTile
      title="Predictive Stock, Powered by AI"
      icon={<TrendingUp />}
      stats={data.predictive_stock}
      deepLink="/transaction-trends?forecast=true"
    />
    <RetailOsTile
      title="Real-Time Brand Command Center"
      icon={<Target />}
      stats={data.brand_command_center}
      deepLink="/geo-intelligence"
    />
  </TileGrid>
</PageContainer>
```

**Data Wiring:**
```tsx
const { data, isLoading, error } = useRetailOsOverview()
```

**Components Needed:**
- `RetailOsTile` (card with icon, stats, "View Details" button)
- `HeroSection`

**Estimated Time:** 3-4 hours

---

### 3.2 AI Assistant Panel (Shared Component)

**Component:** `/src/components/ai/AiAssistantPanel.tsx`

**Structure:**
```tsx
interface AiAssistantPanelProps {
  route: string
}

function AiAssistantPanel({ route }: AiAssistantPanelProps) {
  const filters = useFilterStore()
  const [messages, setMessages] = useState<AiAssistantMessage[]>([])
  const [input, setInput] = useState('')
  
  const { mutate: askAi, isLoading } = useAskScoutAi()
  
  const handleSend = () => {
    askAi({
      message: input,
      context: {
        route,
        filters,
      },
    }, {
      onSuccess: (response) => {
        setMessages([...messages, ...response.messages])
      },
    })
  }
  
  return (
    <div className="card">
      <h3>Ask Suqi</h3>
      <MessageList messages={messages} />
      <InputBar value={input} onChange={setInput} onSend={handleSend} loading={isLoading} />
    </div>
  )
}
```

**Sub-Components:**
- `MessageList` (scrollable list of user/assistant messages)
- `InputBar` (textarea + send button)
- `ToolCallCard` (display when AI used a tool)

**Estimated Time:** 4-5 hours

---

### 3.3 Advanced Filters Panel (Enhanced)

**Current State:**
- ✅ Basic date/region/category filters

**Required Enhancements:**
1. **Entity Selection:**
   - Brand multi-select (with search)
   - Category checkboxes
   - Region multi-select
   - City multi-select (dependent on regions)
   - Store multi-select (dependent on cities)

2. **Time & Temporal:**
   - Preset buttons (Today, Yesterday, Last 7/30/90 days, etc.)
   - Custom date range picker
   - Time of day filter (morning, afternoon, evening, night)
   - Weekday filter (weekday, weekend)

3. **Demographics:**
   - Income segment checkboxes
   - Age group checkboxes
   - Gender filter
   - Urban/rural filter

4. **Behavior Filters:**
   - Suggestion filter (all, suggested_only, accepted_only, rejected_only)
   - Substitution filter (all, substituted_only, no_substitution)
   - Impulse filter (all, impulse_only, planned_only)

5. **Analysis Configuration:**
   - Analysis mode: Single / Between Two / Among Multiple
   - Comparison target: Our Brand / Competitors / Market Average
   - Primary metric: Revenue / Volume / Basket Value / Margin / Growth
   - Chart mode: Line / Bar / Area / Pie / Table
   - Toggles: Show Trends, Show Comparisons, Show Forecasts

6. **Presets:**
   - Dropdown with: All Data, Top Performers, Underperformers, High Value Customers, Impulse Buyers, Brand Loyal, Substitution Risk

**File:** `/src/components/layout/RightFilterPanel.tsx` (major enhancement)

**Estimated Time:** 6-8 hours

---

## 📋 Phase 4: Chart Library

### 4.1 Chart Components (Recharts Wrappers)

**Files to Create:**

1. `/src/components/charts/LineChart.tsx`
   - Wrapper around Recharts LineChart
   - Props: data, xKey, yKey, title, subtitle
   - Responsive, tooltips, legend

2. `/src/components/charts/BarChart.tsx`
   - Wrapper around Recharts BarChart
   - Horizontal/vertical mode
   - Multiple series support

3. `/src/components/charts/PieChart.tsx`
   - Wrapper around Recharts PieChart
   - Labels, percentages, colors

4. `/src/components/charts/ComposedChart.tsx`
   - For Pareto analysis (bars + line)
   - For acceptance rates (bars + line overlay)

5. `/src/components/charts/FunnelChart.tsx`
   - Custom funnel visualization
   - Stage-by-stage with drop-off rates

6. `/src/components/charts/SankeyDiagram.tsx`
   - For substitution flows
   - From brand → To brand

7. `/src/components/charts/HeatMap.tsx`
   - For age/gender distribution
   - For time-of-day patterns

8. `/src/components/charts/MapComponent.tsx`
   - Leaflet or Mapbox GL
   - Display store locations with markers
   - Color-coded by performance

**Estimated Time:** 10-12 hours total

---

## 📋 Phase 5: Polish & Testing

### 5.1 Loading/Error/Empty States

**Components to Create:**

1. `/src/components/ui/LoadingSpinner.tsx`
2. `/src/components/ui/LoadingSkeleton.tsx`
3. `/src/components/ui/ErrorMessage.tsx`
4. `/src/components/ui/EmptyState.tsx`

**Usage Pattern:**
```tsx
if (isLoading) return <LoadingSkeleton type="dashboard" />
if (error) return <ErrorMessage error={error} retry={() => refetch()} />
if (!data) return <EmptyState message="No data available" />

return <DataView data={data} />
```

**Estimated Time:** 2-3 hours

---

### 5.2 Export Functionality

**Implementation:**

1. Export button component:
```tsx
function ExportButton({ format, onExport, loading }) {
  return (
    <button onClick={() => onExport(format)} disabled={loading}>
      <Download className="w-4 h-4" />
      Export {format.toUpperCase()}
    </button>
  )
}
```

2. Export handler:
```tsx
async function handleExport(format: 'csv' | 'xlsx' | 'pdf' | 'png') {
  const blob = await exportData({
    format,
    route: currentRoute,
    filters: currentFilters,
    data_type: 'table',
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scout-export-${Date.now()}.${format}`
  a.click()
}
```

**Estimated Time:** 2-3 hours

---

### 5.3 Tests (Vitest + React Testing Library)

**Files to Create:**

1. `/src/stores/__tests__/filterStore.test.ts`
   - Test filter state updates
   - Test time range presets
   - Test filter presets

2. `/src/hooks/__tests__/useScout.test.ts`
   - Test hooks with mock API responses
   - Test loading/error states

3. `/src/components/__tests__/KpiCard.test.tsx`
   - Test rendering with different props
   - Test trend indicators

4. `/src/routes/__tests__/DashboardOverview.test.tsx`
   - Test page rendering
   - Test with mock data

**Estimated Time:** 4-5 hours

---

## 📊 Overall Progress Tracking

| Phase | Component | Status | Estimated Time | Actual Time |
|-------|-----------|--------|----------------|-------------|
| **1. Infrastructure** | Types | ✅ Complete | 2h | 2h |
| | API Client | ✅ Complete | 2h | 2h |
| | TanStack Hooks | ✅ Complete | 2h | 2h |
| | Zustand Store | ✅ Complete | 2h | 2h |
| | Auth Context | ✅ Complete | 2h | 2h |
| **2. Existing Pages** | Dashboard Overview | ⏳ In Progress | 1h | - |
| | Transaction Trends | ⏭️ Planned | 4-6h | - |
| | Product Mix | ⏭️ Planned | 5-7h | - |
| | Consumer Behavior | ⏭️ Planned | 5-7h | - |
| | Consumer Profiling | ⏭️ Planned | 4-6h | - |
| | Geo Intelligence | ⏭️ Planned | 6-8h | - |
| | Data Dictionary | ⏭️ Planned | 3-4h | - |
| **3. New Features** | Retail OS Landing | ⏭️ Planned | 3-4h | - |
| | AI Assistant Panel | ⏭️ Planned | 4-5h | - |
| | Advanced Filters | ⏭️ Planned | 6-8h | - |
| **4. Chart Library** | 8 Chart Components | ⏭️ Planned | 10-12h | - |
| **5. Polish** | States & Export | ⏭️ Planned | 4-6h | - |
| | Tests | ⏭️ Planned | 4-5h | - |
| **TOTAL** | | **18% Complete** | **65-85h** | **10h** |

---

## 🚀 Next Steps (Immediate)

### Step 1: Update Dashboard Overview (1 hour)
- Replace old API call with `useDashboardOverview()` hook
- Pass filter state
- Add proper loading/error states

### Step 2: Create Transaction Trends Page (4-6 hours)
- Implement full page with tabs
- Create TimeSeriesChart component
- Wire to `useTransactionTrends()` hook

### Step 3: Build Chart Library (10-12 hours)
- Start with most common: LineChart, BarChart, PieChart
- Then specialized: FunnelChart, SankeyDiagram
- Finally: MapComponent

### Step 4: Complete Remaining Pages (20-30 hours)
- Product Mix
- Consumer Behavior
- Consumer Profiling
- Geo Intelligence
- Data Dictionary

### Step 5: New Features (15-20 hours)
- Retail OS Landing
- AI Assistant Panel
- Enhanced Filters Panel

### Step 6: Polish & Testing (8-11 hours)
- Loading/error/empty states
- Export functionality
- Unit tests

---

## 📝 Environment Setup

### Backend Requirements

**API Endpoints (Must Exist):**
```bash
GET  /api/scout/dashboard
POST /api/scout/transaction-trends
POST /api/scout/product-mix
POST /api/scout/consumer-behavior
POST /api/scout/consumer-profiling
POST /api/scout/geo-intelligence
GET  /api/scout/transactions-schema
POST /api/scout/ai/ask
GET  /api/scout/retail-os/overview
POST /api/scout/export
```

**Auth Integration:**
- Backend must validate JWT from `Authorization: Bearer <token>`
- Backend must filter by `X-Tenant-ID` header
- Backend must respect `X-User-Roles` header

**Database Tables:**
- `scout.user_roles` (user_id, tenant_id, role, metadata)
- All 18 Scout tables from Phase 3 migrations

### Frontend Configuration

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-api.example.com/api
```

**Dependencies (Already in package.json):**
- `@supabase/supabase-js` ^2.39.0
- `@tanstack/react-query` ^5.17.0
- `zustand` ^4.4.7
- `recharts` ^2.10.3
- `react-router-dom` ^6.21.0

**New Dependencies Needed:**
```bash
npm install leaflet react-leaflet @types/leaflet  # For maps
npm install vitest @testing-library/react @testing-library/jest-dom  # For tests
```

---

## 🎯 Success Criteria

### Phase 1 (Infrastructure) ✅
- [x] All TypeScript types defined
- [x] API client with auth + tenant isolation
- [x] TanStack Query hooks for all endpoints
- [x] Zustand filter store with persistence
- [x] Auth context with role checks

### Phase 2 (Pages)
- [ ] All 6 analytics pages complete and wired
- [ ] Data Dictionary page complete
- [ ] All pages respect filter state
- [ ] All pages have loading/error/empty states

### Phase 3 (Features)
- [ ] Retail OS landing page working
- [ ] AI assistant panel on all pages
- [ ] Advanced filters panel fully functional

### Phase 4 (Charts)
- [ ] 8 chart components built and tested
- [ ] Responsive design
- [ ] Tooltips and legends

### Phase 5 (Polish)
- [ ] Export to CSV/PNG working
- [ ] Test coverage >50%
- [ ] No console errors
- [ ] Performance: P95 page load <2s

---

**Status:** Phase 1 Complete, Ready for Phase 2 Implementation  
**Last Updated:** 2025-12-07  
**Total Estimated Remaining Time:** 55-75 hours
