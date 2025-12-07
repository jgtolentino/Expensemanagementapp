# Scout Dashboard - Frontend

React + TypeScript frontend for the Scout sari-sari retail analytics platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Root component with routing
├── index.css                # Global styles
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx     # Main layout container
│   │   ├── TopBar.tsx       # Header with logo, menu, user
│   │   ├── SidebarNav.tsx   # Left navigation (7 routes)
│   │   └── RightFilterPanel.tsx  # Global filters panel
│   └── charts/
│       └── KpiCard.tsx      # Metric card with trend indicator
├── routes/
│   ├── DashboardOverview.tsx      # ✅ COMPLETE
│   ├── TransactionTrends.tsx      # ⏭️ Placeholder
│   └── AiAssistant.tsx            # ⏭️ Placeholder
└── lib/
    ├── supabase.ts          # Supabase client & Edge Function helper
    ├── store.ts             # Zustand store (filters, tenant)
    └── utils.ts             # Formatting helpers (currency, numbers, dates)
```

## 🔧 Tech Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Router 6** - Routing
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons

## 🎯 Implemented Features (Phase 6.1 - Prototype)

### ✅ Layout Components
- **AppShell**: Main container with responsive sidebar + filter panel
- **TopBar**: Logo, menu toggle, notifications, user menu
- **SidebarNav**: 7 route links (Dashboard, Trends, Products, Consumers, Geo, KB, AI)
- **RightFilterPanel**: Date range, regions, categories (Zustand state)

### ✅ Dashboard Overview Page
- **GET /scout-dashboard** Edge Function integration
- **4 KPI Cards**: Total Revenue, Baskets, Customers, Stores (with growth trends)
- **Secondary Metrics**: Avg Basket Value, Items/Basket, Duration
- **Top Categories**: Progress bars with revenue share %
- **Top Regions**: Table with revenue + basket count
- **Top Products**: Table with brand, revenue, units sold

### ⏭️ Placeholder Pages
- Transaction Trends
- AI Assistant (Ask Suqi)
- Product Analytics (not created yet)
- Consumer Analytics (not created yet)
- Geo Intelligence (not created yet)
- Knowledge Base (not created yet)

## 🔌 API Integration

### Supabase Edge Functions

All API calls go through `invokeScoutFunction` helper:

```typescript
import { invokeScoutFunction } from '@/lib/supabase'

const { data, error } = await invokeScoutFunction<ResponseType>('scout-dashboard', {
  method: 'GET' | 'POST',
  body: {...}, // For POST requests
})
```

### TanStack Query Example

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['dashboard'],
  queryFn: async () => {
    const { data, error } = await invokeScoutFunction('scout-dashboard', {
      method: 'GET',
    })
    if (error) throw error
    return data
  },
})
```

## 📊 State Management

### Zustand (Global Filters)

```typescript
import { useFilterStore } from '@/lib/store'

const {
  dateRange,
  selectedRegions,
  selectedCategories,
  setDateRange,
  resetFilters,
} = useFilterStore()
```

### TanStack Query (Server State)

- Automatic caching (5 min stale time)
- Background refetching
- Error handling
- Loading states

## 🎨 Styling

### Tailwind Utility Classes

- `card` - White background, shadow, border, padding
- `btn-primary` - Primary button style
- `btn-secondary` - Secondary button style
- `input` - Input field style

### Custom Colors (tailwind.config.js)

```javascript
colors: {
  scout: {
    primary: '#2563eb',   // Blue
    secondary: '#64748b', // Slate
    accent: '#f59e0b',    // Amber
    success: '#10b981',   // Green
    warning: '#f59e0b',   // Amber
    error: '#ef4444',     // Red
  },
}
```

## 🚧 Next Steps (Phase 6.2 - Full Implementation)

### 1. Complete Remaining Pages

- [ ] **Transaction Trends** (4 tabs: volume, revenue, basket_size, duration)
  - Time series chart (Recharts LineChart)
  - Tab switcher
  - Breakdown by time_of_day, day_of_week
  - POST /scout-transaction-trends

- [ ] **Product Analytics** (4 tabs: category_mix, pareto, substitutions, basket)
  - Pie chart (category mix)
  - Pareto chart (top 20% products)
  - Sankey diagram (substitution flows)
  - POST /scout-product-analytics

- [ ] **Consumer Analytics** (2 tabs: behavior, profiling)
  - Request type/mode breakdowns (bar charts)
  - Demographics (pie charts)
  - Segment behavior table
  - POST /scout-consumer-analytics

- [ ] **Geo Intelligence** (4 tabs: regional, stores, demographics, penetration)
  - Regional performance table
  - Map with store locations (Leaflet)
  - POST /scout-geo-intelligence

- [ ] **Knowledge Base**
  - Search input
  - Results with similarity scores
  - POST /scout-rag-search

- [ ] **AI Assistant (Ask Suqi)**
  - Chat interface
  - Message list with user/assistant messages
  - Tool call visualization
  - POST /scout-ai-query

### 2. Build Chart Components

- [ ] LineChart (Recharts wrapper)
- [ ] BarChart (Recharts wrapper)
- [ ] PieChart (Recharts wrapper)
- [ ] SankeyDiagram (for substitution flows)
- [ ] ScatterPlot (for basket analysis)
- [ ] HeatMap (for time-of-day patterns)

### 3. Authentication

- [ ] Login page (Supabase Auth)
- [ ] Signup page
- [ ] Password reset
- [ ] Protected routes
- [ ] User context (tenant_id, role)

### 4. Mobile Responsive

- [ ] Hamburger menu for mobile sidebar
- [ ] Responsive grid layouts
- [ ] Touch-friendly UI elements

## 📝 Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🧪 Testing

```bash
# (To be implemented)
npm run test
```

## 🏗️ Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build output directory: dist
npm run build
# Deploy dist folder to Netlify
```

---

**Status:** ✅ Prototype Complete (Dashboard + Layout)  
**Next:** Implement remaining 6 pages + chart components  
**Progress:** ~15% of Phase 6 (3/7 pages, 10/180 components)
