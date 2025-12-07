# Deakin Enterprise 365 Design System

**Finance PPM Implementation of Microsoft Fluent Design**

---

## System Overview

**Name:** Deakin Enterprise 365 UI  
**Base Framework:** Microsoft Fluent Design (Web)  
**Version:** 2.0.0  
**Visual Language:** Clean, Professional, Data-Rich  
**Theme Mode:** Light (Default)  

**Customization:** Adapted for Deakin University tenant with Finance PPM branding

---

## Design Tokens

### Color Palette

#### Brand Colors

```css
--color-brand-primary-blue: #0078D4;
--color-brand-planner-purple: #4B38B3;
--color-brand-fabric-teal: #00B294;
--color-brand-deakin-black: #000000;
--color-brand-finance-gold: #F2C811;
```

#### Neutral Colors

```css
--color-neutral-white: #FFFFFF;
--color-neutral-canvas: #F3F2F1;
--color-neutral-surface: #FFFFFF;
--color-neutral-border-light: #EDEBE9;
--color-neutral-border-active: #8A8886;
--color-neutral-text-primary: #252423;
--color-neutral-text-secondary: #605E5C;
--color-neutral-text-tertiary: #A19F9D;
```

#### Feedback Colors

```css
--color-feedback-success: #107C10;
--color-feedback-warning: #FFD700;
--color-feedback-error: #A80000;
--color-feedback-info: #0078D4;
```

#### Data Visualization

```css
/* Categorical Colors (for charts) */
--color-data-cat-1: #0078D4;  /* Primary Blue */
--color-data-cat-2: #4B38B3;  /* Planner Purple */
--color-data-cat-3: #00B294;  /* Fabric Teal */
--color-data-cat-4: #D04A02;  /* Orange */
--color-data-cat-5: #F2C811;  /* Gold */

/* Sequential Heatmap */
--color-heatmap-start: #F2C6C6;  /* Light Red */
--color-heatmap-end: #580000;    /* Dark Red */
```

---

### Typography

#### Font Families

```css
--font-family-base: "Segoe UI", "Segoe UI Web (West European)", 
                    -apple-system, BlinkMacSystemFont, Roboto, 
                    "Helvetica Neue", sans-serif;
--font-family-monospace: Consolas, "Courier New", monospace;
```

#### Font Weights

```css
--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

#### Font Sizes

```css
--font-size-display: 28px;
--font-size-title-large: 24px;
--font-size-title-medium: 20px;
--font-size-body-large: 16px;
--font-size-body-base: 14px;
--font-size-caption: 12px;
--font-size-tiny: 10px;
```

#### Line Heights

```css
--line-height-display: 1.2;
--line-height-title: 1.3;
--line-height-body: 1.5;
```

---

### Spacing

#### Base Unit

```css
--spacing-base: 4px;
```

#### Scale

```css
--spacing-xxs: 4px;   /* 1 unit */
--spacing-xs: 8px;    /* 2 units */
--spacing-s: 12px;    /* 3 units */
--spacing-m: 16px;    /* 4 units */
--spacing-l: 24px;    /* 6 units */
--spacing-xl: 32px;   /* 8 units */
--spacing-xxl: 48px;  /* 12 units */
```

#### Layout Grid

```css
--grid-column-gap: 20px;
--grid-card-padding: 16px;
--grid-dashboard-gap: 24px;
```

---

### Effects

#### Shadows (Elevation)

```css
--shadow-elevation-4: 0 1.6px 3.6px 0 rgba(0,0,0,0.13), 
                      0 0.3px 0.9px 0 rgba(0,0,0,0.11);
--shadow-elevation-8: 0 3.2px 7.2px 0 rgba(0,0,0,0.13), 
                      0 0.6px 1.8px 0 rgba(0,0,0,0.11);
--shadow-elevation-16: 0 6.4px 14.4px 0 rgba(0,0,0,0.13), 
                       0 1.2px 3.6px 0 rgba(0,0,0,0.11);
--shadow-modal: 0 25.6px 57.6px 0 rgba(0,0,0,0.22), 
                0 4.8px 14.4px 0 rgba(0,0,0,0.18);
```

#### Border Radius

```css
--radius-small: 2px;
--radius-medium: 4px;
--radius-large: 8px;
--radius-circle: 50%;
```

---

## Component Specifications

### Global Navigation

#### Top Bar

```css
.top-bar {
  height: 48px;
  background: var(--color-brand-deakin-black);
  color: var(--color-neutral-white);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-m);
  box-shadow: var(--shadow-elevation-8);
}

.top-bar__logo {
  font-size: var(--font-size-body-large);
  font-weight: var(--font-weight-semibold);
  margin-left: var(--spacing-m);
}

.top-bar__title {
  font-size: var(--font-size-body-base);
  margin-left: var(--spacing-l);
  color: var(--color-neutral-white);
}
```

**Elements:**
- Waffle Menu (Left) - 48px × 48px icon button
- Deakin University Wordmark (Left) - White text
- App Title (Left) - "Finance PPM"
- Search Bar (Center/Right) - 320px width
- User Profile (Right) - Avatar + name dropdown

#### Sidebar

```css
.sidebar {
  width: var(--sidebar-width-collapsed, 48px);
  background: var(--color-neutral-canvas);
  border-right: 1px solid var(--color-neutral-border-light);
  transition: width 0.2s ease;
}

.sidebar--expanded {
  --sidebar-width-collapsed: 240px;
}

.sidebar__item {
  height: 48px;
  padding: 0 var(--spacing-m);
  display: flex;
  align-items: center;
  color: var(--color-neutral-text-primary);
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
}

.sidebar__item:hover {
  background: var(--color-neutral-border-light);
}

.sidebar__item--active {
  background: var(--color-neutral-white);
  border-left-color: var(--color-brand-primary-blue);
  font-weight: var(--font-weight-semibold);
}
```

---

### Buttons

#### Primary Button

```css
.btn-primary {
  background: var(--color-brand-planner-purple);
  color: var(--color-neutral-white);
  border: none;
  border-radius: var(--radius-medium);
  padding: 6px 20px;
  font-size: var(--font-size-body-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: #3d2d8f; /* Darker purple */
  box-shadow: var(--shadow-elevation-8);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button

```css
.btn-secondary {
  background: transparent;
  color: var(--color-neutral-text-primary);
  border: 1px solid var(--color-neutral-border-active);
  border-radius: var(--radius-medium);
  padding: 6px 20px;
  font-size: var(--font-size-body-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--color-neutral-border-light);
  border-color: var(--color-neutral-text-primary);
}
```

#### Icon Button

```css
.btn-icon {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-medium);
  cursor: pointer;
  color: var(--color-neutral-text-secondary);
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: var(--color-neutral-border-light);
  color: var(--color-neutral-text-primary);
}
```

---

### Cards

#### Standard Card

```css
.card {
  background: var(--color-neutral-white);
  border: 1px solid var(--color-neutral-border-light);
  border-radius: var(--radius-medium);
  padding: var(--grid-card-padding);
  box-shadow: var(--shadow-elevation-4);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-elevation-8);
  transform: translateY(-2px);
}

.card__header {
  font-size: var(--font-size-title-medium);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-text-primary);
  margin-bottom: var(--spacing-m);
}

.card__body {
  font-size: var(--font-size-body-base);
  color: var(--color-neutral-text-secondary);
  line-height: var(--line-height-body);
}
```

#### Kanban Task Card

```css
.task-card {
  background: var(--color-neutral-white);
  border: 1px solid var(--color-neutral-border-light);
  border-radius: var(--radius-medium);
  padding: var(--spacing-m);
  margin-bottom: var(--spacing-xs);
  cursor: pointer;
  transition: all 0.15s ease;
}

.task-card:hover {
  box-shadow: var(--shadow-elevation-8);
}

.task-card__label {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-small);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.task-card__title {
  font-size: var(--font-size-body-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-text-primary);
  margin-bottom: var(--spacing-s);
}

.task-card__checklist {
  font-size: var(--font-size-caption);
  color: var(--color-neutral-text-secondary);
  margin-bottom: var(--spacing-s);
}

.task-card__assignee {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.task-card__avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-circle);
  background: var(--color-brand-primary-blue);
  color: var(--color-neutral-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}
```

---

### Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
  text-align: center;
}

.empty-state__icon {
  width: 120px;
  height: 120px;
  margin-bottom: var(--spacing-l);
}

.empty-state__title {
  font-size: var(--font-size-title-large);
  font-weight: var(--font-weight-semibold);
  color: var(--color-brand-primary-blue);
  margin-bottom: var(--spacing-m);
}

.empty-state__description {
  font-size: var(--font-size-body-base);
  color: var(--color-neutral-text-secondary);
  max-width: 400px;
  line-height: var(--line-height-body);
  margin-bottom: var(--spacing-l);
}

.empty-state__action {
  /* Use .btn-primary */
}
```

**Visual Style:**
- 3D Rendered Glossy Icons (Sun, Checkmark, Abstract)
- Centered alignment
- Friendly, encouraging copy

---

### Data Tables

```css
.data-table {
  width: 100%;
  background: var(--color-neutral-white);
  border: 1px solid var(--color-neutral-border-light);
  border-radius: var(--radius-medium);
  overflow: hidden;
}

.data-table__header {
  background: var(--color-neutral-canvas);
  border-bottom: 2px solid var(--color-neutral-border-light);
}

.data-table__header-cell {
  padding: var(--spacing-m);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table__row {
  border-bottom: 1px solid var(--color-neutral-border-light);
  transition: background 0.15s ease;
}

.data-table__row:hover {
  background: var(--color-neutral-canvas);
}

.data-table__cell {
  padding: var(--spacing-m);
  font-size: var(--font-size-body-base);
  color: var(--color-neutral-text-primary);
}
```

---

### Charts (Recharts Configuration)

```javascript
// Recharts theme for Finance PPM
const chartTheme = {
  colors: {
    categorical: [
      '#0078D4',  // Primary Blue
      '#4B38B3',  // Planner Purple
      '#00B294',  // Fabric Teal
      '#D04A02',  // Orange
      '#F2C811',  // Gold
    ],
    heatmap: {
      start: '#F2C6C6',
      end: '#580000',
    },
  },
  
  // Bar chart config
  bar: {
    fill: '#0078D4',
    radius: [4, 4, 0, 0],
  },
  
  // Line chart config
  line: {
    stroke: '#0078D4',
    strokeWidth: 2,
    dot: { fill: '#0078D4', r: 4 },
  },
  
  // Axis config
  axis: {
    stroke: '#EDEBE9',
    tick: { fill: '#605E5C', fontSize: 12 },
    axisLine: { stroke: '#EDEBE9' },
  },
  
  // Grid config
  grid: {
    stroke: '#F3F2F1',
    strokeDasharray: '3 3',
  },
  
  // Tooltip config
  tooltip: {
    contentStyle: {
      background: '#FFFFFF',
      border: '1px solid #EDEBE9',
      borderRadius: '4px',
      boxShadow: '0 3.2px 7.2px 0 rgba(0,0,0,0.13)',
    },
  },
};
```

---

## Usage Examples

### Finance PPM Dashboard Layout

```html
<div class="app-shell">
  <!-- Top Bar -->
  <header class="top-bar">
    <button class="btn-icon" aria-label="Menu">☰</button>
    <div class="top-bar__logo">Deakin University</div>
    <div class="top-bar__title">Finance PPM</div>
    
    <div class="top-bar__spacer"></div>
    
    <input type="search" class="top-bar__search" placeholder="Search...">
    
    <button class="btn-icon" aria-label="Notifications">🔔</button>
    <div class="top-bar__profile">
      <img src="avatar.jpg" alt="User" class="avatar">
      <span>CKVC</span>
    </div>
  </header>
  
  <!-- Sidebar -->
  <aside class="sidebar sidebar--expanded">
    <nav>
      <a href="#dashboard" class="sidebar__item sidebar__item--active">
        <i class="icon">📊</i>
        <span>Dashboard</span>
      </a>
      <a href="#wbs" class="sidebar__item">
        <i class="icon">📋</i>
        <span>WBS Structure</span>
      </a>
      <a href="#risks" class="sidebar__item">
        <i class="icon">⚠️</i>
        <span>Risks</span>
      </a>
      <a href="#financials" class="sidebar__item">
        <i class="icon">💰</i>
        <span>Financials</span>
      </a>
    </nav>
  </aside>
  
  <!-- Main Content -->
  <main class="main-content">
    <div class="page-header">
      <h1>Good evening, Cherry Kate</h1>
      <button class="btn-primary">+ Create New Task</button>
    </div>
    
    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- KPI Cards -->
      <div class="card">
        <div class="card__header">Total Tasks</div>
        <div class="card__body">
          <div class="kpi-value">36</div>
          <div class="kpi-change positive">+8% vs last month</div>
        </div>
      </div>
      
      <!-- WBS Progress Chart -->
      <div class="card card--wide">
        <div class="card__header">WBS Progress</div>
        <div class="card__body">
          <!-- Recharts component here -->
        </div>
      </div>
    </div>
  </main>
</div>
```

---

## Implementation Guide

### 1. Odoo Web Module

**File:** `static/src/css/deakin_theme.css`

Include all CSS variables and component styles from this document.

**File:** `static/src/js/deakin_theme.js`

```javascript
// Chart theme configuration
export const DEAKIN_CHART_THEME = {
  colors: {
    categorical: ['#0078D4', '#4B38B3', '#00B294', '#D04A02', '#F2C811'],
    heatmap: { start: '#F2C6C6', end: '#580000' },
  },
  // ... rest of theme
};
```

### 2. Tailwind Configuration

**File:** `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0078D4',
          purple: '#4B38B3',
          teal: '#00B294',
          black: '#000000',
          gold: '#F2C811',
        },
        neutral: {
          canvas: '#F3F2F1',
          // ... rest of neutrals
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: '28px',
        'title-lg': '24px',
        // ... rest of sizes
      },
      boxShadow: {
        'elevation-4': '0 1.6px 3.6px 0 rgba(0,0,0,0.13), 0 0.3px 0.9px 0 rgba(0,0,0,0.11)',
        // ... rest of shadows
      },
    },
  },
};
```

---

## Next Steps

1. **Apply to Finance PPM Views** - Update all Odoo XML views
2. **Create Component Library** - Build reusable Fluent-styled components
3. **Implement Dashboards** - Use Recharts with theme
4. **Test Accessibility** - Ensure WCAG 2.1 AA compliance

---

**Last Updated:** 2025-12-07  
**Version:** 2.0.0  
**Maintained By:** Finance PPM Team
