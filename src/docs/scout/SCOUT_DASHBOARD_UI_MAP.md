# Scout Dashboard - UI/UX Map (Phase 1)

**Date:** 2025-12-07  
**Phase:** 1 - Routes, Tabs, Components, User Journeys  
**Reference:** `https://scout-dashboard-xi.vercel.app/`

---

## Application Layout

### Shell Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [TBWA Scout Logo]  |  Scout Dashboard  |  [Tenant]  [User] ☰  │ Top Bar
├─────────┬───────────────────────────────────────────────┬───────┤
│         │                                               │       │
│  LEFT   │           MAIN CONTENT AREA                   │ RIGHT │
│  NAV    │                                               │FILTER │
│         │  [Page Title]                                 │ PANEL │
│  • Home │                                               │       │
│  • Tran │  ┌─────────────────────────────────────────┐ │Brands │
│  • Prod │  │                                         │ │  □ A  │
│  • Cons │  │       DASHBOARD CONTENT                 │ │  □ B  │
│  • Prof │  │       (Charts, Tables, KPIs)            │ │       │
│  • Geo  │  │                                         │ │Categ. │
│  • Dict │  └─────────────────────────────────────────┘ │  □ Snk│
│         │                                               │  □ Bev│
│  [Suqi] │  [Tab1] [Tab2] [Tab3] [Tab4]                │       │
│   AI    │                                               │Time   │
│         │                                               │[Date] │
└─────────┴───────────────────────────────────────────────┴───────┘
```

### Layout Components

**`AppShell`**
- Top bar (header)
- Left sidebar navigation
- Main content area
- Right filter panel (collapsible)
- "Ask Suqi" AI drawer (bottom-right)

**`TopBar`**
- TBWA + Scout branding
- Page title (dynamic)
- Tenant switcher
- User menu (profile, settings, logout)
- Notifications bell
- Export button

**`LeftNav`** (Primary Navigation)
- Dashboard / Home
- Transaction Trends
- Product Mix & SKU Analytics
- Consumer Behavior Analytics
- Consumer Profiling
- Geographical Intelligence
- Data Dictionary
- "Ask Suqi" AI (toggle drawer)

**`RightFilterPanel`**
- Collapsible (hide/show button)
- Sticky position
- Sections:
  - Brands (multi-select)
  - Categories (multi-select)
  - Locations (hierarchical tree)
  - Time & Temporal (date range, presets)
  - Advanced Filters (expandable)
  - Display Options (chart types, aggregation)
- Apply / Reset buttons
- Active filter count badge

**`AskSuqiDrawer`** (AI Assistant)
- Slide up from bottom-right
- Chat interface
- Query input box
- Streaming responses
- Source citations
- Chart generation
- History sidebar

---

## Route Map

### Overview Table

| # | Route | Page Title | Tabs | Components | Data Sources |
|---|-------|------------|------|------------|--------------|
| 1 | `/` | Dashboard Overview | 4 | KPI cards, trend charts | `v_dashboard_overview` |
| 2 | `/transaction-trends` | Transaction Trends | 4 | Time series charts | `v_transaction_trends` |
| 3 | `/product-mix` | Product Mix & SKU | 4 | Pie, bar, pareto charts | `v_product_mix` |
| 4 | `/consumer-behavior` | Consumer Behavior | 4 | Funnel, breakdown charts | `v_consumer_behavior` |
| 5 | `/consumer-profiling` | Consumer Profiling | 4 | Demographics charts | `v_consumer_profiling` |
| 6 | `/geo-intelligence` | Geographical Intelligence | 4 | Maps, regional charts | `v_geo_intelligence` |
| 7 | `/data-dictionary` | Data Dictionary | 1 | Table explorer | `information_schema` |

---

## Page 1: Dashboard Overview (`/`)

### Purpose
Executive summary with top-level KPIs and recent trends.

### URL
```
GET /?brands=jollibee,coca-cola&dateRange=last30d
```

### Tabs (4)
1. **Overview** (default)
2. **Top Performers** (products + regions)
3. **Alerts** (anomalies, low stock, growth alerts)
4. **Recent Activity** (latest transactions, updates)

### Components

#### Header Section
- **Page Title:** "Scout Dashboard Overview"
- **Date Range Display:** "Showing data for: Nov 7 - Dec 7, 2025"
- **Refresh Button:** Last updated timestamp
- **Export Button:** Export current view to PDF/Excel

#### KPI Cards (4 across)

**Card 1: Total Transactions**
```typescript
{
  title: "Total Transactions",
  value: "18,453",
  change: "+12.3%",
  trend: "up",
  period: "vs last 30 days",
  icon: "ShoppingCart",
}
```

**Card 2: Total Revenue**
```typescript
{
  title: "Total Revenue",
  value: "₱2.4M",
  change: "+8.7%",
  trend: "up",
  period: "vs last 30 days",
  icon: "DollarSign",
}
```

**Card 3: Active Stores**
```typescript
{
  title: "Active Stores",
  value: "247",
  change: "+5",
  trend: "up",
  period: "new this month",
  icon: "Store",
}
```

**Card 4: Avg Basket Size**
```typescript
{
  title: "Avg Basket Size",
  value: "2.8 items",
  change: "-0.2",
  trend: "down",
  period: "vs last 30 days",
  icon: "ShoppingBasket",
}
```

#### Charts Section (2x2 Grid)

**Chart 1: Transaction Volume Trend (Top-Left)**
- Type: Area chart
- X-axis: Date (daily)
- Y-axis: Transaction count
- Data: Last 30 days daily volume
- Data source: `SELECT date, COUNT(*) FROM scout.transactions GROUP BY date`

**Chart 2: Revenue Trend (Top-Right)**
- Type: Line chart
- X-axis: Date (daily)
- Y-axis: Revenue (₱)
- Data: Last 30 days daily revenue
- Data source: `SELECT date, SUM(total_amount) FROM scout.transactions GROUP BY date`

**Chart 3: Top 10 Categories (Bottom-Left)**
- Type: Horizontal bar chart
- X-axis: Revenue (₱)
- Y-axis: Product category
- Data: Top categories by revenue
- Data source: `v_product_mix`

**Chart 4: Top 10 Regions (Bottom-Right)**
- Type: Horizontal bar chart
- X-axis: Transaction count
- Y-axis: Region name
- Data: Top regions by volume
- Data source: `v_geo_intelligence`

#### Recent Activity Table
- **Columns:** Timestamp, Store, Product, Amount, Status
- **Rows:** Last 20 transactions
- **Actions:** View details (modal)
- **Data source:** `scout.transactions ORDER BY timestamp DESC LIMIT 20`

### Data Requirements

**API Call:**
```typescript
GET /api/scout/dashboard
Response: {
  kpis: { total_transactions, total_revenue, active_stores, avg_basket_size },
  trends: { daily_volume: [], daily_revenue: [] },
  top_categories: [],
  top_regions: [],
  recent_activity: [],
}
```

**Filters Applied:**
- Date range (default: last 30 days)
- Brands (if selected)
- Categories (if selected)
- Regions (if selected)

---

## Page 2: Transaction Trends (`/transaction-trends`)

### Purpose
Analyze transaction patterns over time: volume, revenue, basket size, duration.

### URL
```
GET /transaction-trends?tab=volume&dateRange=last90d&granularity=daily
```

### Tabs (4)
1. **Volume** - Transaction count trends
2. **Revenue** - Sales amount trends
3. **Basket Size** - Items per transaction trends
4. **Duration** - Transaction time analysis

### Tab 1: Volume

#### KPI Cards (3 across)

**Total Transactions**
- Value: 54,120
- Change: +15.2% vs prior period
- Sparkline: Mini trend line

**Daily Average**
- Value: 602 txns/day
- Change: +12 txns/day
- Peak day: Dec 1 (845 txns)

**Peak Hour**
- Value: 5-6 PM
- Transactions: 8,234 (15.2%)
- Change: +3.1% vs avg hour

#### Charts

**Daily Volume Trend (Main Chart)**
- Type: Area chart with gradient
- X-axis: Date (daily, weekly, or monthly based on granularity)
- Y-axis: Transaction count
- Annotations: Weekends, holidays highlighted
- Data: `SELECT date, COUNT(*) as txn_count FROM scout.transactions GROUP BY date`

**Volume by Time of Day (Secondary)**
- Type: Column chart
- X-axis: Hour (24-hour format)
- Y-axis: Transaction count
- Series: Weekday vs Weekend
- Data: `SELECT EXTRACT(HOUR FROM timestamp), COUNT(*) GROUP BY hour`

**Volume by Day of Week**
- Type: Bar chart (horizontal)
- X-axis: Transaction count
- Y-axis: Day name (Mon-Sun)
- Data: `SELECT EXTRACT(DOW FROM timestamp), COUNT(*) GROUP BY dow`

#### Table: Daily Breakdown
- **Columns:** Date, Transactions, Change %, Day of Week, Notes
- **Rows:** All dates in range
- **Sort:** Date descending
- **Export:** CSV, Excel

### Tab 2: Revenue

#### KPI Cards (3 across)

**Total Revenue**
- Value: ₱7.2M
- Change: +18.5% vs prior period

**Daily Average**
- Value: ₱80,000/day
- Change: +₱10,500/day

**Avg Transaction Value**
- Value: ₱133.05
- Change: +₱2.45

#### Charts

**Daily Revenue Trend (Main Chart)**
- Type: Line chart with dual Y-axis
- Left Y-axis: Revenue (₱)
- Right Y-axis: Transaction count
- X-axis: Date
- Data: `SELECT date, SUM(total_amount), COUNT(*) FROM scout.transactions GROUP BY date`

**Revenue by Category (Secondary)**
- Type: Stacked area chart
- X-axis: Date
- Y-axis: Revenue (₱)
- Series: Top 5 categories + Others
- Data: `v_product_mix` time series

**Revenue Distribution (Tertiary)**
- Type: Box plot
- Shows: Min, Q1, Median, Q3, Max, Outliers
- Breakdown: By day of week or time of day

### Tab 3: Basket Size

#### KPI Cards (3 across)

**Avg Basket Size**
- Value: 2.8 items
- Change: -0.1 items
- Mode: 2 items (most common)

**Max Basket Size**
- Value: 12 items
- Store: SM Makati
- Date: Dec 5, 2025

**Single-Item Transactions**
- Value: 35.2%
- Count: 19,050 txns
- Change: -2.1%

#### Charts

**Basket Size Trend (Main Chart)**
- Type: Line chart
- X-axis: Date
- Y-axis: Avg items per basket
- Data: `SELECT date, AVG(items_count) FROM (SELECT basket_id, COUNT(*) as items_count FROM scout.transactions GROUP BY basket_id)`

**Basket Size Distribution**
- Type: Histogram
- X-axis: Items count (1, 2, 3, 4, 5+)
- Y-axis: Transaction count
- Data: `SELECT items_count, COUNT(*) GROUP BY items_count`

**Basket Size by Category Mix**
- Type: Heatmap
- Rows: Primary category
- Columns: Secondary category
- Value: Avg basket size
- Shows: Which categories are bought together

### Tab 4: Duration

#### KPI Cards (3 across)

**Avg Transaction Duration**
- Value: 4.2 minutes
- Change: -0.3 min (faster)
- Distribution: 2-8 min range

**Fastest Transactions**
- Value: < 1 minute
- Percent: 12.5%
- Common: Single-item, repeat customers

**Slowest Transactions**
- Value: > 10 minutes
- Percent: 5.2%
- Common: Large baskets, new products

#### Charts

**Duration Trend (Main Chart)**
- Type: Line chart with confidence interval
- X-axis: Date
- Y-axis: Avg duration (minutes)
- Bands: 25th-75th percentile range

**Duration by Basket Size**
- Type: Scatter plot with trend line
- X-axis: Items in basket
- Y-axis: Duration (minutes)
- Color: Store type
- Shows: Correlation between basket size and time

**Duration Distribution**
- Type: Violin plot
- X-axis: Time of day or Day of week
- Y-axis: Duration (minutes)
- Shows: When transactions are faster/slower

### Data Requirements

**API Call:**
```typescript
POST /api/scout/transaction-trends
Body: {
  tab: "volume" | "revenue" | "basket_size" | "duration",
  filters: { dateRange, brands, categories, regions, granularity },
}
Response: {
  kpis: { ... },
  time_series: [],
  breakdowns: { by_time_of_day: [], by_day_of_week: [] },
  distribution: [],
}
```

**Views Used:**
- `scout.v_transaction_trends` (pre-aggregated daily metrics)
- `scout.transactions` (raw data for custom aggregations)

---

## Page 3: Product Mix & SKU Analytics (`/product-mix`)

### Purpose
Analyze product performance, category distribution, SKU rankings, substitutions, basket composition.

### URL
```
GET /product-mix?tab=category-mix&category=Beverage&dateRange=last30d
```

### Tabs (4)
1. **Category Mix** - Distribution by product category
2. **Pareto Analysis** - 80/20 rule for SKUs
3. **Substitutions** - Product switching behavior
4. **Basket Analysis** - Multi-item basket composition

### Tab 1: Category Mix

#### KPI Cards (4 across)

**Top Category**
- Value: Beverage (35.2%)
- Revenue: ₱2.5M
- Change: +2.1%

**Category Count**
- Value: 6 active
- Top 3: 82% of revenue
- Diversity index: 0.65

**Avg SKUs per Category**
- Value: 67 SKUs
- Range: 15-150
- Total SKUs: 402

**Category Growth Leader**
- Value: Personal Care (+28%)
- Revenue: ₱580K
- New SKUs: 12

#### Charts

**Category Distribution (Main Chart - Pie)**
- Type: Donut chart
- Values: % of total revenue
- Colors: Category-specific (Beverage=blue, Snacks=orange, etc.)
- Interaction: Click to filter
- Data: `SELECT product_category, SUM(total_amount) FROM scout.transactions GROUP BY product_category`

**Category Trend (Secondary - Stacked Area)**
- Type: Stacked area chart
- X-axis: Date
- Y-axis: Revenue (₱) or % of total
- Series: All 6 categories
- Shows: How mix changes over time

**Category Performance Matrix**
- Type: Bubble chart
- X-axis: Revenue (₱)
- Y-axis: Growth rate (%)
- Bubble size: Transaction count
- Quadrants: Stars, Cash Cows, Question Marks, Dogs

#### Table: Category Details
- **Columns:** Category, Revenue, Transactions, Avg Price, Share %, Growth %, Top SKU
- **Rows:** All categories
- **Sort:** Revenue descending (default)
- **Expand:** Click to see all SKUs in category

### Tab 2: Pareto Analysis

#### KPI Cards (3 across)

**80% Revenue from**
- Value: Top 82 SKUs (20.4%)
- Total SKUs: 402
- Concentration: High

**Top SKU**
- Name: Coca-Cola 1L
- Revenue: ₱385K (5.3%)
- Transactions: 2,890

**Long Tail**
- SKUs: 320 (bottom 80%)
- Revenue: 20% total
- Avg per SKU: ₱4,500

#### Charts

**Pareto Chart (Main)**
- Type: Combo chart (bar + line)
- X-axis: SKU rank
- Left Y-axis: Revenue per SKU (bars)
- Right Y-axis: Cumulative % (line)
- Annotations: 80% line marker
- Data: `SELECT sku, SUM(total_amount) FROM scout.transactions GROUP BY sku ORDER BY 2 DESC`

**Revenue Concentration Curve**
- Type: Line chart
- X-axis: % of SKUs
- Y-axis: % of revenue
- Reference: Diagonal line (perfect equality)
- Shows: Gini coefficient visualization

#### Table: SKU Rankings
- **Columns:** Rank, SKU, Brand, Category, Revenue, Cumulative %, Transactions
- **Rows:** Top 100 SKUs
- **Highlight:** Top 20% in green
- **Search:** Filter by SKU name or brand

### Tab 3: Substitutions

#### KPI Cards (3 across)

**Substitution Rate**
- Value: 18.5%
- Definition: % of baskets with substitute
- Change: +1.2%

**Top Substitute Pair**
- From: Pepsi 1L
- To: Coca-Cola 1L
- Switch rate: 42%

**Brand Loyalty**
- Value: 67.3%
- Definition: % of repeat purchases same brand
- Top loyal: San Miguel (82%)

#### Charts

**Substitution Matrix (Main - Heatmap)**
- Rows: Original product
- Columns: Substitute product
- Value: Switch count or %
- Color: Intensity (red=high switch rate)
- Filter: Category-specific
- Data: Basket analysis with product change detection

**Substitution Flow (Secondary - Sankey)**
- Left: Original products (top 20)
- Right: Substitute products (top 20)
- Flows: Width = switch volume
- Shows: Migration patterns

**Brand Switching**
- Type: Chord diagram
- Nodes: Top 15 brands
- Chords: Switch volume between brands
- Shows: Competitive dynamics

#### Table: Substitution Pairs
- **Columns:** From Product, To Product, Switch Count, Switch %, Reason (if captured)
- **Rows:** Top 50 pairs
- **Filter:** By category, brand
- **Sort:** Switch count descending

### Tab 4: Basket Analysis

#### KPI Cards (3 across)

**Avg Basket Size**
- Value: 2.8 items
- Change: -0.1 items
- Mode: 2 items

**Top Basket Combo**
- Items: Coke + Chips + Candy
- Frequency: 1,240 baskets (6.7%)
- Avg value: ₱145

**Cross-Category Rate**
- Value: 45.2%
- Definition: % baskets with 2+ categories
- Example: Beverage + Snack

#### Charts

**Basket Composition (Main - Treemap)**
- Hierarchy: Category → Brand → SKU
- Size: Revenue contribution
- Color: Growth rate
- Interaction: Drill down

**Association Rules (Secondary - Network Graph)**
- Nodes: Products
- Edges: Co-purchase frequency
- Size: Product popularity
- Thickness: Association strength
- Shows: Market basket analysis

**Basket Size Distribution**
- Type: Histogram
- X-axis: Items per basket (1, 2, 3, 4, 5+)
- Y-axis: Basket count
- Overlay: Revenue distribution

#### Table: Frequent Itemsets
- **Columns:** Item Set, Support %, Confidence %, Lift, Basket Count
- **Rows:** Top 50 itemsets (2-4 items)
- **Filter:** Min support, min confidence
- **Sort:** Lift descending (most interesting)

### Data Requirements

**API Call:**
```typescript
POST /api/scout/product-analytics
Body: {
  tab: "category_mix" | "pareto" | "substitutions" | "basket",
  filters: { dateRange, brands, categories, regions },
}
Response: {
  kpis: { ... },
  category_distribution: [],
  sku_rankings: [],
  substitution_matrix: [],
  basket_composition: [],
  association_rules: [],
}
```

**Views Used:**
- `scout.v_product_mix` (category aggregations)
- `scout.v_basket_analysis` (co-purchase patterns)

---

## Page 4: Consumer Behavior Analytics (`/consumer-behavior`)

### Purpose
Analyze purchase funnels, request methods, acceptance rates, behavior traits.

### URL
```
GET /consumer-behavior?tab=funnel&segment=urban&dateRange=last30d
```

### Tabs (4)
1. **Purchase Funnel** - Visit → Purchase conversion
2. **Request Methods** - Voice, Text, Gesture breakdown
3. **Acceptance Rates** - Recommendation acceptance
4. **Behavior Traits** - Impulse vs Planned purchasing

### Tab 1: Purchase Funnel

#### KPI Cards (4 across)

**Total Visits**
- Value: 72,450
- Definition: Store visits tracked
- Conversion: 25.5% → Purchase

**Browse Rate**
- Value: 68.2%
- Definition: % visits with browsing
- Count: 49,411 visits

**Request Rate**
- Value: 42.1%
- Definition: % browsers who request
- Count: 20,802 requests

**Purchase Rate**
- Value: 88.7%
- Definition: % requesters who purchase
- Count: 18,453 purchases

#### Charts

**Funnel Visualization (Main)**
- Type: Funnel chart
- Stages:
  1. Visit (72,450 - 100%)
  2. Browse (49,411 - 68.2%)
  3. Request (20,802 - 42.1% of browsers)
  4. Receive Suggestion (18,950 - 91.1% of requesters)
  5. Purchase (18,453 - 97.4% of suggested)
- Colors: Gradient from blue to green
- Drop-off: Red indicators between stages

**Funnel Conversion Trend (Secondary)**
- Type: Line chart (multi-series)
- X-axis: Date
- Y-axis: Conversion rate (%)
- Series: Browse rate, Request rate, Purchase rate
- Shows: How funnel efficiency changes over time

**Funnel by Segment (Tertiary)**
- Type: Grouped bar chart
- X-axis: Consumer segment (High/Middle/Low income, Urban/Rural)
- Y-axis: Conversion rate (%)
- Series: Each funnel stage
- Shows: Segment differences

#### Table: Funnel Details
- **Columns:** Stage, Count, % of Previous, Cumulative %, Avg Duration
- **Rows:** 5 funnel stages
- **Expand:** Click to see breakdown by time of day, day of week

### Tab 2: Request Methods

#### KPI Cards (3 across)

**Most Popular Method**
- Value: Voice (52.3%)
- Count: 10,881 requests
- Growth: +3.2%

**Fastest Method**
- Value: Gesture (avg 1.2 min)
- Accuracy: 78.5%
- Use case: Repeat purchases

**Highest Accuracy**
- Value: Text (94.1%)
- Avg duration: 3.5 min
- Use case: Specific products

#### Charts

**Method Distribution (Main - Pie)**
- Type: Donut chart
- Values: % of total requests
- Segments:
  - Voice: 52.3%
  - Text: 32.1%
  - Gesture: 15.6%
- Colors: Blue, Green, Orange

**Method Trend Over Time (Secondary)**
- Type: Stacked area chart
- X-axis: Date
- Y-axis: Request count
- Series: Voice, Text, Gesture
- Shows: Adoption of each method

**Method Performance Matrix**
- Type: Scatter plot
- X-axis: Avg duration (minutes)
- Y-axis: Accuracy rate (%)
- Bubble size: Usage count
- Quadrants: Ideal (fast + accurate), etc.

#### Table: Method Comparison
- **Columns:** Method, Request Count, % Share, Avg Duration, Accuracy %, Conversion %
- **Rows:** 3 methods
- **Highlight:** Best performer in each metric (green)

### Tab 3: Acceptance Rates

#### KPI Cards (3 across)

**Overall Acceptance**
- Value: 72.3%
- Definition: % accepting AI suggestion
- Count: 13,701 accepted

**Top Accepted Category**
- Value: Beverage (81.2%)
- Count: 4,560 accepted
- Reason: High brand loyalty

**Rejection Rate**
- Value: 27.7%
- Top reason: Price (45%)
- Alternative: Request different SKU

#### Charts

**Acceptance Rate Trend (Main)**
- Type: Line chart with confidence band
- X-axis: Date
- Y-axis: Acceptance rate (%)
- Bands: 95% confidence interval
- Annotations: Events (promotions, etc.)

**Acceptance by Category (Secondary - Bar)**
- Type: Horizontal bar chart
- X-axis: Acceptance rate (%)
- Y-axis: Product category
- Data: Category-specific acceptance
- Sort: Rate descending

**Rejection Reasons (Tertiary - Pie)**
- Type: Donut chart
- Segments:
  - Price too high (45%)
  - Wrong product (28%)
  - Out of stock (15%)
  - No reason given (12%)

#### Table: Suggestion Performance
- **Columns:** Suggestion Type, Count, Accepted, Rejected, Acceptance %, Avg Basket Value
- **Rows:** Upsell, Cross-sell, Alternative, Personalized
- **Sort:** Acceptance % descending

### Tab 4: Behavior Traits

#### KPI Cards (3 across)

**Impulse Purchase Rate**
- Value: 38.5%
- Definition: Purchase within 2 min of request
- Avg basket: ₱95 (lower)

**Planned Purchase Rate**
- Value: 61.5%
- Definition: Browse > 2 min before purchase
- Avg basket: ₱158 (higher)

**Repeat Customer Rate**
- Value: 54.2%
- Definition: > 1 purchase in 30 days
- Avg frequency: 3.8 visits/month

#### Charts

**Behavior Segmentation (Main - Quadrant)**
- Type: Scatter plot with quadrants
- X-axis: Purchase frequency (low to high)
- Y-axis: Avg basket value (low to high)
- Quadrants:
  - High frequency, High value: VIP (12%)
  - High frequency, Low value: Regulars (32%)
  - Low frequency, High value: Occasional splurgers (18%)
  - Low frequency, Low value: One-timers (38%)
- Bubble size: Customer count

**Behavior Evolution (Secondary)**
- Type: Sankey diagram
- Left: New customers (segments)
- Middle: 30-day behavior
- Right: 90-day behavior
- Shows: How customer behavior matures

**Decision Time Distribution**
- Type: Histogram
- X-axis: Time from browse to purchase (minutes)
- Y-axis: Transaction count
- Annotations: Impulse threshold (2 min)

#### Table: Customer Segments
- **Columns:** Segment, Customer Count, % Share, Avg Basket, Avg Frequency, Lifetime Value
- **Rows:** VIP, Regular, Occasional, One-timer
- **Sort:** Lifetime value descending

### Data Requirements

**API Call:**
```typescript
POST /api/scout/consumer-analytics
Body: {
  tab: "funnel" | "methods" | "acceptance" | "traits",
  filters: { dateRange, segments, regions },
}
Response: {
  kpis: { ... },
  funnel_stages: [],
  request_methods: [],
  acceptance_data: [],
  behavior_segments: [],
}
```

**Views Used:**
- `scout.v_consumer_behavior` (funnel metrics)
- `scout.v_customer_segments` (profiling data)

---

## Page 5: Consumer Profiling (`/consumer-profiling`)

### Purpose
Demographic analysis: age, gender, location, income segments.

### URL
```
GET /consumer-profiling?tab=demographics&segment=urban&dateRange=last30d
```

### Tabs (4)
1. **Demographics** - Overall demographic breakdown
2. **Age & Gender** - Age groups and gender splits
3. **Location** - Urban vs Rural, regional distribution
4. **Segment Behavior** - Purchasing patterns by segment

### Tab 1: Demographics

#### KPI Cards (4 across)

**Total Active Consumers**
- Value: 10,247
- Definition: Unique customers in period
- New this month: 1,520 (14.8%)

**Urban vs Rural**
- Urban: 65.3% (6,691)
- Rural: 34.7% (3,556)
- Change: Urban +2.1%

**Income Distribution**
- High: 15.2%
- Middle: 52.7%
- Low: 32.1%

**Gender Split**
- Male: 48.5%
- Female: 51.5%
- Unknown: < 0.1%

#### Charts

**Demographic Overview (Main - Multi-level Pie)**
- Type: Sunburst chart
- Center: All consumers
- Ring 1: Urban (65%) vs Rural (35%)
- Ring 2: Income segments
- Ring 3: Age groups
- Ring 4: Gender
- Interaction: Click to filter

**Demographic Pyramid (Secondary)**
- Type: Population pyramid
- Y-axis: Age groups (18-24, 25-34, 35-44, 45-54, 55+)
- X-axis: Count (left=Male, right=Female)
- Colors: Blue (male), Pink (female)
- Shows: Age and gender distribution

**Segment Composition Matrix**
- Type: Heatmap
- Rows: Income segment (High, Middle, Low)
- Columns: Location (Urban, Rural)
- Value: Customer count
- Color: Intensity

#### Table: Demographic Breakdown
- **Columns:** Segment, Customer Count, % Share, Avg Age, Gender Split, Avg Basket
- **Rows:** All 6 segments (High/Middle/Low × Urban/Rural)
- **Sort:** Customer count descending

### Tab 2: Age & Gender

#### KPI Cards (3 across)

**Dominant Age Group**
- Value: 25-34 (38.2%)
- Count: 3,914 customers
- Avg basket: ₱142

**Gender Gap**
- Value: 3.0% more female
- Female: 5,277
- Male: 4,970

**Youngest Avg Age Category**
- Category: Personal Care (avg 28.3 years)
- Skew: Female (72%)
- Growth: +18%

#### Charts

**Age Distribution (Main - Histogram)**
- Type: Grouped bar chart
- X-axis: Age group (18-24, 25-34, 35-44, 45-54, 55+)
- Y-axis: Customer count
- Series: Male (blue), Female (pink)
- Overlay: Avg basket value (line)

**Gender × Age Matrix (Secondary - Heatmap)**
- Rows: Gender
- Columns: Age group
- Value: Customer count
- Color: Intensity (blue to red scale)

**Age & Gender Category Preference (Tertiary)**
- Type: Grouped horizontal bar chart
- Y-axis: Product category
- X-axis: % of purchases
- Series: Age groups
- Shows: Which age groups buy which categories

#### Table: Age Group Details
- **Columns:** Age Group, Male Count, Female Count, Total, % Share, Avg Basket, Top Category
- **Rows:** 5 age groups
- **Highlight:** Largest group (green)

### Tab 3: Location

#### KPI Cards (3 across)

**Top Region**
- Value: Metro Manila (NCR)
- Customers: 3,847 (37.5%)
- Revenue: ₱2.7M

**Urban Dominance**
- Value: 65.3% urban
- Stores: 185 urban, 65 rural
- Avg basket: Urban ₱148, Rural ₱102

**Regional Diversity**
- Value: 15 active regions
- Top 5 regions: 82% of customers
- Fastest growing: CALABARZON (+22%)

#### Charts

**Regional Distribution (Main - Map)**
- Type: Choropleth map (Philippines)
- Regions: Color-coded by customer density
- Tooltips: Region name, customer count, revenue
- Interaction: Click to filter

**Urban vs Rural Comparison (Secondary)**
- Type: Grouped bar chart
- X-axis: Metrics (Customers, Revenue, Avg Basket, Frequency)
- Y-axis: Value
- Series: Urban (blue), Rural (green)

**Top 10 Cities (Tertiary - Bar)**
- Type: Horizontal bar chart
- X-axis: Customer count
- Y-axis: City name
- Data: Top cities by unique customers

#### Table: Regional Breakdown
- **Columns:** Region, Customers, % Share, Revenue, Avg Basket, Urban %, Rural %
- **Rows:** All 17 regions
- **Sort:** Customers descending
- **Expand:** Click to see provinces, cities

### Tab 4: Segment Behavior

#### KPI Cards (3 across)

**Highest Value Segment**
- Value: High Income Urban
- Avg basket: ₱215
- Frequency: 4.2 visits/month
- Share: 12.3%

**Largest Segment**
- Value: Middle Income Urban
- Customer count: 3,620 (35.3%)
- Avg basket: ₱135
- Share of revenue: 42.1%

**Fastest Growing Segment**
- Value: Middle Income Rural (+28%)
- New customers: 485
- Avg basket: ₱95
- Growth driver: Store expansion

#### Charts

**Segment Performance Matrix (Main - Bubble)**
- Type: Bubble chart
- X-axis: Avg basket value (₱)
- Y-axis: Purchase frequency (visits/month)
- Bubble size: Customer count
- Color: Income segment
- Quadrants: High value-high frequency = VIP, etc.

**Segment Basket Composition (Secondary)**
- Type: Stacked bar chart (100%)
- X-axis: Segment (6 segments)
- Y-axis: % of basket value
- Series: Product categories
- Shows: Category preference by segment

**Segment Trend (Tertiary - Line)**
- Type: Multi-series line chart
- X-axis: Date
- Y-axis: Customer count
- Series: Each of 6 segments
- Shows: Segment growth over time

#### Table: Segment Details
- **Columns:** Segment, Customers, Revenue, Avg Basket, Frequency, Top Category, Loyalty %
- **Rows:** 6 segments (High/Middle/Low × Urban/Rural)
- **Sort:** Revenue descending
- **Actions:** Export, drill down

### Data Requirements

**API Call:**
```typescript
POST /api/scout/consumer-profiling
Body: {
  tab: "demographics" | "age_gender" | "location" | "segment",
  filters: { dateRange, segments, regions },
}
Response: {
  kpis: { ... },
  demographic_breakdown: [],
  age_gender_distribution: [],
  regional_data: [],
  segment_performance: [],
}
```

**Views Used:**
- `scout.v_consumer_profiling` (demographic aggregations)
- `scout.v_customer_segments` (segment behavior)

---

## Page 6: Geographical Intelligence (`/geo-intelligence`)

### Purpose
Regional performance, store locations, market penetration, coverage analysis.

### URL
```
GET /geo-intelligence?tab=regional&region=NCR&dateRange=last30d
```

### Tabs (4)
1. **Regional Performance** - Revenue and growth by region
2. **Store Locations** - Store distribution and density
3. **Demographics** - Regional demographic differences
4. **Market Penetration** - Coverage and opportunity analysis

### Tab 1: Regional Performance

#### KPI Cards (4 across)

**Top Region**
- Value: Metro Manila (NCR)
- Revenue: ₱2.7M (37.5%)
- Stores: 95
- Avg per store: ₱28,421

**Fastest Growing Region**
- Value: CALABARZON (+22.3%)
- Revenue: ₱1.2M
- New stores: 8
- YoY growth: ₱220K

**Total Active Regions**
- Value: 15 out of 17
- Coverage: 88.2%
- Inactive: Regions 12, 13 (Mindanao)
- Expansion plan: Q1 2026

**Regional Diversity Index**
- Value: 0.68 (moderate)
- Definition: Even distribution score (0-1)
- Top 5 regions: 82% of revenue
- Opportunity: Expand to underserved regions

#### Charts

**Regional Revenue Map (Main - Choropleth)**
- Type: Interactive map of Philippines
- Regions: Color-coded by revenue
- Color scale: Light yellow (low) to dark blue (high)
- Tooltips: Region name, revenue, stores, growth %
- Interaction: Click region to filter all data

**Regional Growth Matrix (Secondary - Scatter)**
- Type: Bubble chart
- X-axis: Current revenue (₱)
- Y-axis: Growth rate (%)
- Bubble size: Number of stores
- Color: Island group (Luzon=blue, Visayas=green, Mindanao=orange)
- Quadrants: Stars, Cash Cows, Question Marks, Dogs

**Top 10 Regions by Revenue (Tertiary - Bar)**
- Type: Horizontal bar chart
- X-axis: Revenue (₱)
- Y-axis: Region name
- Data: Top regions ranked
- Color: Growth rate (green=positive, red=negative)

#### Table: Regional Performance Details
- **Columns:** Region, Revenue, Growth %, Stores, Avg per Store, Market Share %, Customers
- **Rows:** All 17 regions
- **Sort:** Revenue descending
- **Expand:** Click to see provinces

### Tab 2: Store Locations

#### KPI Cards (3 across)

**Total Active Stores**
- Value: 247
- Urban: 185 (75%)
- Rural: 62 (25%)
- New this month: 5

**Avg Stores per Region**
- Value: 16.5 stores
- Range: 2 (Caraga) to 95 (NCR)
- Target: 20 stores per region

**Store Density**
- Value: 0.23 stores per 10K population
- Top: NCR (0.72)
- Lowest: Mindanao regions (0.05)
- Target: 0.30 nationwide

#### Charts

**Store Distribution Map (Main - Point Map)**
- Type: Interactive map with markers
- Points: Each store location
- Size: Revenue per store
- Color: Store type (sari-sari, mini-mart, etc.)
- Clusters: Group nearby stores
- Tooltips: Store name, city, revenue

**Store Density by Region (Secondary - Bar)**
- Type: Horizontal bar chart
- X-axis: Stores per 10K population
- Y-axis: Region name
- Data: Density metric
- Color: Density level (low/medium/high)

**Store Type Distribution (Tertiary - Pie)**
- Type: Donut chart
- Segments:
  - Sari-sari stores: 65%
  - Mini-marts: 28%
  - Supermarkets: 5%
  - Wholesalers: 2%

#### Table: Store Locations List
- **Columns:** Store Name, Code, Type, City, Province, Region, Revenue, Status
- **Rows:** All 247 stores
- **Search:** Filter by name, location
- **Export:** CSV with coordinates

### Tab 3: Demographics

#### KPI Cards (3 across)

**Most Populous Region**
- Value: CALABARZON
- Population: 16.2M
- Customers: 1,520 (penetration: 0.009%)
- Opportunity: High

**Youngest Region**
- Value: NCR
- Avg age: 29.3 years
- Skew: 25-34 age group (42%)
- Top category: Personal Care

**Highest Income Region**
- Value: NCR
- High income %: 28.5%
- Avg basket: ₱178
- Premium product demand

#### Charts

**Regional Demographics Matrix (Main - Heatmap)**
- Rows: Regions
- Columns: Demographics (Avg Age, Urban %, High Income %, Gender Split)
- Value: Normalized score (0-1)
- Color: Blue to red scale

**Age Distribution by Region (Secondary - Box Plot)**
- X-axis: Region
- Y-axis: Age (years)
- Shows: Min, Q1, Median, Q3, Max per region
- Comparison: Which regions are younger/older

**Income Segmentation by Region (Tertiary - Stacked Bar)**
- X-axis: Region
- Y-axis: % of customers
- Series: High, Middle, Low income
- Shows: Income distribution differences

#### Table: Regional Demographics
- **Columns:** Region, Population, Customers, Penetration %, Avg Age, Urban %, High Income %
- **Rows:** All 17 regions
- **Sort:** Population descending

### Tab 4: Market Penetration

#### KPI Cards (4 across)

**Overall Penetration**
- Value: 0.009% of population
- Customers: 10,247
- Population: 110M (Philippines)
- Target: 0.05% (5x)

**Coverage Rate**
- Value: 42.3%
- Definition: % of barangays with nearby store
- Covered: 17,766 / 42,000 barangays
- Gap: 24,234 barangays

**Expansion Opportunity**
- Value: ₱15.8M potential revenue
- Uncovered: High-population barangays
- Top targets: CALABARZON, Central Luzon

**Market Share**
- Value: 2.3% (estimated)
- Competitors: 500K+ sari-sari stores nationwide
- Growth target: 5% by 2027

#### Charts

**Penetration by Region (Main - Map with Overlay)**
- Type: Choropleth map
- Color: Penetration rate (% of population)
- Overlay: Opportunity heatmap (high-population areas without stores)
- Interaction: Click to see expansion plan

**Coverage vs Opportunity (Secondary - Scatter)**
- Type: Bubble chart
- X-axis: Current coverage (%)
- Y-axis: Potential revenue (₱)
- Bubble size: Population
- Color: Region
- Quadrants: Prioritize high opportunity, low coverage

**Penetration Trend (Tertiary - Line)**
- Type: Multi-series line chart
- X-axis: Date (monthly)
- Y-axis: Penetration rate (%)
- Series: Top 5 regions
- Shows: Coverage growth over time

#### Table: Regional Opportunities
- **Columns:** Region, Coverage %, Penetration %, Population, Potential Revenue, Priority
- **Rows:** All 17 regions
- **Sort:** Potential revenue descending
- **Highlight:** High priority (red/orange)

### Data Requirements

**API Call:**
```typescript
POST /api/scout/geo-intelligence
Body: {
  tab: "regional" | "stores" | "demographics" | "penetration",
  filters: { dateRange, regions, storeTypes },
}
Response: {
  kpis: { ... },
  regional_performance: [],
  store_locations: [],
  demographics: [],
  penetration_metrics: [],
}
```

**Views Used:**
- `scout.v_geo_intelligence` (regional aggregations)
- `scout.stores` (location data)
- `scout.v_market_penetration` (coverage metrics)

---

## Page 7: Data Dictionary (`/data-dictionary`)

### Purpose
Explore the Scout Dashboard data model: tables, fields, relationships.

### URL
```
GET /data-dictionary?table=transactions
```

### Tabs (1)
1. **Schema Explorer** (single tab)

### KPI Cards (3 across)

**Total Tables**
- Value: 12
- Core: 5 (transactions, stores, customers, products, brands)
- Views: 7 (analytics views)

**Total Fields**
- Value: 187
- Indexed: 42
- FKs: 15

**Total Records**
- Value: 28,642
- Transactions: 18,453
- Stores: 247
- Customers: 10,247

### Components

#### Table Explorer (Main - Left Panel)

**Table List**
- Grouped by type:
  - **Core Tables** (5)
  - **Analytics Views** (7)
  - **Lookup Tables** (brands, categories)
- Search: Filter tables by name
- Click: Select table to view details

#### Field Details (Main - Right Panel)

**Selected Table: `scout.transactions`**

**Table Metadata**
- Name: `scout.transactions`
- Type: Table (fact table)
- Rows: 18,453
- Size: 12.3 MB
- Last updated: 2025-12-07 14:32:15

**Field List Table**
- **Columns:** Field Name, Type, Nullable, Default, Description, Sample Value
- **Rows:** All fields in table
- **Example rows:**

| Field | Type | Nullable | Description | Sample |
|-------|------|----------|-------------|--------|
| id | uuid | No | Primary key | `a1b2c3...` |
| store_id | uuid | No | FK to scout.stores | `d4e5f6...` |
| timestamp | timestamptz | No | Transaction datetime (UTC) | `2025-12-07 06:32:15+00` |
| time_of_day | enum | No | Morning/Afternoon/Evening/Night | `Morning` |
| barangay | varchar(100) | Yes | Barangay name | `Barangay 123` |
| city | varchar(100) | No | City/Municipality | `Quezon City` |
| province | varchar(100) | No | Province | `Metro Manila` |
| region | varchar(100) | No | Region | `NCR` |
| island_group | varchar(20) | No | Luzon/Visayas/Mindanao | `Luzon` |
| brand_name | varchar(100) | No | Product brand | `Coca-Cola` |
| sku | varchar(50) | No | Product SKU code | `COKE-1L-PET` |
| product_category | varchar(50) | No | Category | `Beverage` |
| quantity | int | No | Units purchased | `2` |
| unit_price | decimal(10,2) | No | Price per unit (₱) | `45.00` |
| total_amount | decimal(10,2) | No | Total transaction amount (₱) | `90.00` |
| basket_id | uuid | Yes | Basket identifier (multi-item) | `b7c8d9...` |
| customer_id | uuid | Yes | FK to scout.customers | `e0f1g2...` |

**Indexes**
- `idx_transactions_timestamp` (timestamp DESC)
- `idx_transactions_store` (store_id)
- `idx_transactions_customer` (customer_id)
- `idx_transactions_region_category` (region, product_category)

**Foreign Keys**
- `fk_transactions_store` → `scout.stores(id)`
- `fk_transactions_customer` → `scout.customers(id)`

**Used in Views**
- `scout.v_transaction_trends`
- `scout.v_product_mix`
- `scout.v_consumer_behavior`

#### Relationships Diagram (Bottom Panel)

**ER Diagram (Interactive)**
- Type: Entity-relationship diagram
- Tables: All core tables
- Lines: Foreign key relationships
- Interaction: Click table to highlight relationships
- Export: Download as SVG, PNG

### Data Requirements

**API Call:**
```typescript
GET /api/scout/data-dictionary?table=transactions
Response: {
  tables: [],
  fields: [],
  indexes: [],
  foreign_keys: [],
  sample_data: [],
}
```

**Data Source:**
- `information_schema` (PostgreSQL system catalog)
- Custom metadata table: `scout.data_dictionary` (field descriptions)

---

## AI Assistant: "Ask Suqi" (`/ai` - Drawer)

### Purpose
Natural language query interface powered by OpenAI GPT-4 + RAG.

### UI Location
- **Trigger:** Button in left nav ("Ask Suqi")
- **Display:** Slide-up drawer from bottom-right (500px height)
- **Persistent:** Stays open across page navigation

### Components

#### Chat Interface

**Input Box**
- Placeholder: "Ask Suqi anything about your retail data..."
- Auto-resize: Expands to 3 lines
- Submit: Enter key or send button
- Voice input: Microphone icon (optional)

**Message List**
- User messages: Right-aligned, blue background
- AI responses: Left-aligned, gray background
- Streaming: Text appears word-by-word
- Timestamps: Relative time (e.g., "2 min ago")

**Message Components**
- **Text Response:** Formatted markdown
- **Sources:** Expandable list of cited documents
- **Charts:** Inline chart generation (if query warrants)
- **Actions:** "Show me this data", "Export", "Ask follow-up"

#### Sample Queries (Quick Buttons)

**Top row:**
- "What are the top-selling products?"
- "Show me regional growth trends"
- "Which customer segments are most profitable?"

**Second row:**
- "Compare urban vs rural performance"
- "Analyze basket composition by time of day"
- "What's driving revenue growth?"

#### Chat History Sidebar (Optional Expandable)

- **Sessions:** List of past conversations
- **Titles:** Auto-generated from first query
- **Actions:** Resume, Delete, Export
- **Search:** Filter by keyword

### AI Capabilities

#### Query Understanding
- Natural language parsing with GPT-4
- Intent classification: Data query, Analysis request, Definition lookup
- Entity extraction: Brands, categories, regions, time ranges

#### RAG (Retrieval-Augmented Generation)
- Vector search over knowledge base
- Relevant docs: Product guides, market reports, best practices
- Top 3 results included in context
- Sources cited in response

#### Tool Calling (7 Tools)

1. **`get_transaction_trends`**
   - Input: date_range, brands, categories, regions
   - Output: Time series data + KPIs
   - Use case: "Show me transaction volume last month"

2. **`get_product_performance`**
   - Input: product_name | category, date_range
   - Output: SKU rankings, revenue, growth
   - Use case: "How is Coca-Cola performing?"

3. **`get_consumer_segments`**
   - Input: segment_type (age, income, location)
   - Output: Segment breakdown + behavior
   - Use case: "Profile urban millennials"

4. **`get_regional_performance`**
   - Input: region_name, metric (revenue, growth, penetration)
   - Output: Regional stats + comparison
   - Use case: "Compare NCR vs CALABARZON"

5. **`get_basket_analysis`**
   - Input: min_support, min_confidence
   - Output: Frequent itemsets, associations
   - Use case: "What products are bought together?"

6. **`get_store_locations`**
   - Input: region, store_type
   - Output: Store list with coordinates
   - Use case: "Show me all stores in Metro Manila"

7. **`search_scout_knowledge`**
   - Input: query, category (optional)
   - Output: Relevant docs/chunks
   - Use case: "What is market penetration?"

#### Chart Generation
- If query implies visualization, generate chart config
- Chart types: Line, Bar, Pie, Scatter
- Render inline in chat message
- Export: Download as PNG, CSV

### Example Conversations

**Example 1: Data Query**
```
User: "What are the top 5 selling products in Metro Manila last week?"

Suqi: [Calls get_product_performance tool]
"Here are the top 5 products in Metro Manila (Nov 30 - Dec 6, 2025):

1. Coca-Cola 1L - ₱45,230 (1,205 units)
2. Lucky Me Instant Noodles - ₱32,120 (1,840 units)
3. Marlboro Red - ₱28,950 (579 units)
4. Tide Detergent 50g - ₱21,340 (1,067 units)
5. Jack n Jill Chips - ₱18,650 (933 units)

[Chart: Bar chart showing revenue per product]

Sources: [scout.transactions table] [NCR Product Report]"
```

**Example 2: Analysis Request**
```
User: "Why is revenue declining in Visayas?"

Suqi: [Calls get_regional_performance + get_transaction_trends]
"Based on the data, Visayas revenue declined 8.3% last month. Key factors:

1. Store Closures: 3 stores in Cebu closed due to competition
2. Seasonality: Post-holiday dip (normal pattern)
3. Category Shift: Tobacco sales down 15% (regulatory changes)
4. Bright Spot: Personal Care up 22% (new SKUs)

Recommendation: Focus on expanding Personal Care offerings and reopening Cebu locations.

[Chart: Line chart showing Visayas revenue trend with annotations]

Sources: [Regional Performance Report] [Store Closure Log]"
```

**Example 3: Definition Lookup**
```
User: "What is market penetration?"

Suqi: [Calls search_scout_knowledge]
"Market penetration is the percentage of the target population that has been reached or engaged by your stores. 

In Scout Dashboard, it's calculated as:
**Penetration % = (Active Customers / Target Population) × 100**

For example, if NCR has 13M population and you have 3,847 active customers:
**Penetration = (3,847 / 13,000,000) × 100 = 0.03%**

This metric helps identify expansion opportunities. Regions with low penetration but high population are prime targets.

Sources: [Scout Metrics Guide] [Market Analysis Best Practices]"
```

### Data Requirements

**API Call:**
```typescript
POST /api/scout/ai-query
Body: {
  session_id: "uuid" (optional, creates new if not provided),
  message: "User's natural language query",
}
Response: {
  session_id: "uuid",
  message: "AI response text",
  sources: [ { type: "document", title: "...", excerpt: "..." } ],
  tool_calls: [ { tool: "get_transaction_trends", params: {...}, result: {...} } ],
  chart: { type: "bar", data: [...], config: {...} } (optional),
}
```

**Backend Flow:**
1. User sends message
2. Generate embedding for query
3. RAG search (top 3 docs)
4. Build GPT-4 prompt with context + tools
5. GPT-4 decides which tools to call
6. Execute tools (call Edge Functions)
7. GPT-4 generates final response
8. Return response + sources + tool calls
9. Save conversation to `scout.ai_conversations`

---

## Filter Panel (Right Sidebar)

### Purpose
Global filters that apply across all pages.

### UI Location
- Right sidebar (300px width)
- Collapsible (hide/show button)
- Sticky position (scrolls with page)
- Active filter count badge in header

### Filter Sections

#### 1. Brands (Multi-select)

**Component:** Dropdown with checkboxes

**Options:** All brands (40-50)
- [ ] All Brands (select all)
- [ ] Coca-Cola
- [ ] Pepsi
- [ ] San Miguel
- [ ] Nestlé
- [ ] ... (alphabetical)

**Features:**
- Search: Filter brand list
- Select all / Clear all
- Active count: "12 selected"

---

#### 2. Categories (Multi-select)

**Component:** Checkbox list

**Options:**
- [ ] All Categories
- [ ] Beverage
- [ ] Snacks
- [ ] Tobacco
- [ ] Household
- [ ] Personal Care
- [ ] Others

**Features:**
- Icon per category
- % of total revenue shown
- Select all / Clear all

---

#### 3. Locations (Hierarchical tree)

**Component:** Tree select

**Structure:**
```
▼ Luzon
  ▼ NCR (Metro Manila)
    □ Quezon City
    □ Manila
    □ Makati
  ▼ CALABARZON
    □ Cavite
    □ Laguna
    □ Batangas
▼ Visayas
  ▼ Central Visayas (Region 7)
    □ Cebu
    □ Bohol
▼ Mindanao
  ▼ Davao Region
    □ Davao City
```

**Features:**
- Expand/collapse regions
- Check parent = check all children
- Active: "5 regions selected"

---

#### 4. Time & Temporal Analysis

**Component:** Date range picker + extras

**Date Range:**
- Preset buttons:
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - Year to Date
  - Custom range
- Calendar picker: Start date → End date

**Day of Week Filter:**
- Checkboxes: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- Use case: "Show only weekends"

**Time of Day Filter:**
- Radio buttons:
  - All Day
  - Morning (6am-12pm)
  - Afternoon (12pm-6pm)
  - Evening (6pm-10pm)
  - Night (10pm-6am)

---

#### 5. Advanced Filters (Expandable)

**Component:** Accordion (collapsed by default)

**Store Type:**
- [ ] Sari-sari stores
- [ ] Mini-marts
- [ ] Supermarkets
- [ ] Wholesalers

**Consumer Segment:**
- [ ] High Income
- [ ] Middle Income
- [ ] Low Income
- [ ] Urban
- [ ] Rural

**Transaction Size:**
- Slider: Basket size (1-10+ items)
- Slider: Transaction amount (₱0-₱500+)

**Other Flags:**
- [ ] First-time customers only
- [ ] Repeat customers only
- [ ] AI recommendation accepted
- [ ] Impulse purchases (< 2 min)

---

#### 6. Display Options

**Component:** Dropdown + toggles

**Chart Type:**
- Dropdown:
  - Auto (default)
  - Line
  - Bar
  - Area
  - Scatter

**Aggregation:**
- Radio buttons:
  - Daily
  - Weekly
  - Monthly

**Toggles:**
- [ ] Show legend
- [ ] Show data labels
- [ ] Show trend line
- [ ] Show confidence interval

---

### Filter Actions

**Apply Button:**
- Blue primary button
- Applies all filters
- Debounced (300ms delay after last change)

**Reset Button:**
- Ghost button
- Clears all filters to default
- Confirmation modal: "Are you sure?"

**Active Filters Display:**
- Tags above charts: "Brand: Coca-Cola ×", "Region: NCR ×"
- Click × to remove individual filter

**URL Sync:**
- Filters stored in URL query params
- Shareable URLs: Copy link with filters applied
- Back button support

---

## User Flows

### Flow 1: Explore Transaction Trends

1. User lands on Dashboard (`/`)
2. Sees overview KPIs
3. Clicks "Transaction Trends" in left nav
4. Lands on `/transaction-trends?tab=volume`
5. Chart shows daily volume (all time)
6. User adjusts date range: "Last 30 days"
7. User applies brand filter: "Coca-Cola"
8. Chart updates to show Coca-Cola volume trend
9. User switches to "Revenue" tab
10. Sees revenue trend for Coca-Cola
11. User clicks "Export" → Downloads CSV

**Time:** ~2 minutes  
**Pages:** 2  
**Actions:** 6

---

### Flow 2: Analyze Regional Performance with AI

1. User clicks "Geographical Intelligence" in left nav
2. Lands on `/geo-intelligence?tab=regional`
3. Sees regional revenue map
4. User clicks "CALABARZON" region on map
5. All charts filter to CALABARZON
6. User clicks "Ask Suqi" in left nav
7. AI drawer slides up from bottom
8. User types: "Why is CALABARZON growing so fast?"
9. Suqi calls `get_regional_performance` tool
10. Suqi responds with analysis + chart
11. User clicks "Show me this data" action
12. Redirects to filtered view with CALABARZON highlighted

**Time:** ~3 minutes  
**Pages:** 2  
**Actions:** 7

---

### Flow 3: Product Mix Deep Dive

1. User clicks "Product Mix & SKU Analytics" in left nav
2. Lands on `/product-mix?tab=category-mix`
3. Sees category distribution pie chart
4. User clicks "Beverage" slice
5. Page filters to Beverage category only
6. User switches to "Pareto Analysis" tab
7. Sees top Beverage SKUs (80/20 rule)
8. User clicks "Coca-Cola 1L" in table
9. Modal opens with SKU details
10. User clicks "View Substitutions"
11. Switches to "Substitutions" tab filtered to Coke
12. Sees what customers switch to when Coke is unavailable

**Time:** ~4 minutes  
**Pages:** 1 (multiple tabs)  
**Actions:** 8

---

## Technical Requirements

### Performance

**Page Load:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s

**Filter Application:**
- Debounce: 300ms after last user input
- API response: < 500ms
- Chart re-render: < 200ms

**Chart Rendering:**
- Max data points: 1,000 per series
- Use aggregation for larger datasets
- Lazy load off-screen charts

### Responsiveness

**Breakpoints:**
- Desktop: 1280px+
- Tablet: 768px-1279px
- Mobile: < 768px

**Mobile Adaptations:**
- Left nav: Hamburger menu
- Right filter panel: Bottom drawer
- Charts: Simplified, scrollable
- Tables: Horizontal scroll or card view

### Accessibility

**WCAG 2.1 Level AA:**
- Keyboard navigation: All interactive elements
- Screen reader support: ARIA labels
- Color contrast: Minimum 4.5:1 ratio
- Focus indicators: Visible on all elements

### Browser Support

**Minimum:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Summary: Component Inventory

### Total Component Count: 180+

**Layout (5):**
- AppShell, TopBar, LeftNav, RightFilterPanel, AskSuqiDrawer

**Pages (7):**
- DashboardOverview, TransactionTrends, ProductMix, ConsumerBehavior, ConsumerProfiling, GeoIntelligence, DataDictionary

**Charts (25+):**
- AreaChart, LineChart, BarChart, PieChart, DonutChart, HeatmapChart, ScatterChart, BubbleChart, FunnelChart, SankeyChart, ChordChart, TreemapChart, NetworkGraph, BoxPlot, ViolinPlot, HistogramChart, ParetoChart, PyramidChart, RadarChart, GaugeChart, MapChart (Choropleth, Point Map)

**UI Primitives (40+):**
- Button, Input, Select, Checkbox, Radio, Slider, DatePicker, Dropdown, Modal, Drawer, Tooltip, Popover, Badge, Tag, Card, Table, Pagination, Tabs, Accordion, Tree, Toast, Alert, Skeleton, Spinner, Progress, Avatar, Separator, ScrollArea, Sheet, Menubar, ContextMenu, HoverCard, ToggleGroup, NavigationMenu, Combobox, Command, Collapsible, AspectRatio, Resizable

**Domain-Specific (30+):**
- KPICard, TrendChart, CategoryPieChart, RegionalMap, FunnelVisualization, ParetoChart, SubstitutionMatrix, BasketComposition, DemographicPyramid, BehaviorSegmentation, StoreLocationMap, PenetrationHeatmap, FieldExplorer, ERDiagram, AIChatMessage, AISourceCard, FilterTag, ActiveFilterList, ExportButton, RefreshButton, TenantSwitcher, UserMenu, NotificationBell, QuickActionButton

**Total Lines of Code (Estimated):**
- Pages: 1,400 lines (200 per page)
- Components: 6,000 lines (40 per component)
- API layer: 1,200 lines
- Utils/helpers: 600 lines
- **Total: ~9,200 lines**

---

## Next Steps (Phase 2)

✅ **Phase 1 Complete:** UI/UX Map with 7 pages, 28 tabs, 180+ components

⏭️ **Phase 2:** Data Model - Define all tables, fields, views, indexes, relationships

---

**Last Updated:** 2025-12-07  
**Estimated Effort for Phase 1:** 5 hours (actual)  
**Next Phase:** Phase 2 - Data Model Design (est. 4-6 hours)
