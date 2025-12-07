# API Reference

Complete reference for all Scout × SariCoach API endpoints.

---

## Base URL

```
Production: https://your-project.supabase.co/functions/v1
Local Dev:  http://localhost:54321/functions/v1
```

---

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

**Getting a JWT:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

## Common Headers

```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-Tenant-ID: <tenant-uuid>       (optional, extracted from JWT)
X-User-Roles: analyst,super_admin (optional, extracted from JWT)
```

---

## 1. Dashboard Overview

### `POST /scout-dashboard`

Get executive summary KPIs and top performers.

**Request:**
```json
{
  "start_date": "2024-11-07",
  "end_date": "2025-12-07",
  "regions": ["NCR", "CALABARZON"],
  "categories": ["beverage", "snacks"]
}
```

**Response:**
```json
{
  "overview": {
    "total_baskets": 6410,
    "total_revenue": 425000.50,
    "unique_customers": 10000,
    "active_stores": 250,
    "avg_basket_value": 66.30,
    "avg_items_per_basket": 3.2,
    "avg_duration_seconds": 180
  },
  "trends": {
    "revenue_growth_pct": 12.5,
    "basket_growth_pct": 8.3,
    "customer_growth_pct": 0.0
  },
  "top_categories": [
    {
      "category": "beverage",
      "revenue": 150000.00,
      "share_pct": 35.3
    }
  ],
  "top_regions": [
    {
      "region": "NCR",
      "revenue": 170000.00,
      "basket_count": 2500
    }
  ],
  "top_products": [
    {
      "product_name": "Coca-Cola 1.5L PET",
      "brand_name": "Coca-Cola",
      "revenue": 45000.00,
      "units_sold": 2000
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (missing/invalid JWT)
- `500` - Server error

---

## 2. Transaction Trends

### `POST /scout-transaction-trends`

Get time series analysis for volume, revenue, basket size, or duration.

**Request:**
```json
{
  "tab": "revenue",
  "granularity": "day",
  "start_date": "2024-11-07",
  "end_date": "2025-12-07",
  "brands": ["coca-cola-uuid", "pepsi-uuid"],
  "categories": ["beverage"],
  "regions": ["NCR"]
}
```

**Parameters:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `tab` | string | Yes | `volume`, `revenue`, `basket_size`, `duration` |
| `granularity` | string | No (default: `day`) | `hour`, `day`, `week`, `month` |
| `start_date` | string | Yes | ISO 8601 date |
| `end_date` | string | Yes | ISO 8601 date |
| `brands` | string[] | No | Brand UUIDs |
| `categories` | string[] | No | Category names |
| `regions` | string[] | No | Region names |

**Response:**
```json
{
  "kpis": {
    "daily_volume": 120,
    "daily_revenue": 7500.00,
    "avg_basket_size": 3.2,
    "avg_duration": 185
  },
  "time_series": {
    "volume": [
      { "timestamp": "2024-11-07", "value": 110 },
      { "timestamp": "2024-11-08", "value": 125 }
    ],
    "revenue": [
      { "timestamp": "2024-11-07", "value": 7200.00 },
      { "timestamp": "2024-11-08", "value": 8100.00 }
    ],
    "basket_size": [...],
    "duration": [...]
  },
  "breakdowns": {
    "by_time_of_day": [
      { "label": "morning", "value": 2500, "percentage": 33.3 },
      { "label": "afternoon", "value": 3000, "percentage": 40.0 }
    ],
    "by_day_of_week": [...],
    "by_category": [...]
  }
}
```

---

## 3. Product Mix & SKU Analytics

### `POST /scout-product-mix`

Get category distribution, Pareto analysis, substitutions, and basket composition.

**Request:**
```json
{
  "tab": "category_mix",
  "start_date": "2024-11-07",
  "end_date": "2025-12-07",
  "brands": [],
  "regions": ["NCR"]
}
```

**Parameters:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `tab` | string | Yes | `category_mix`, `pareto`, `substitutions`, `basket` |

**Response (category_mix):**
```json
{
  "kpis": {
    "total_skus": 400,
    "active_skus": 380,
    "new_skus": 15,
    "category_diversity": 7
  },
  "category_distribution": [
    {
      "category": "beverage",
      "revenue": 150000.00,
      "unit_count": 6500,
      "share_pct": 35.3,
      "growth_pct": 12.5
    }
  ],
  "pareto_analysis": {
    "products": [
      {
        "sku": "COKE-001-PET",
        "product_name": "Coca-Cola 1.5L PET",
        "brand_name": "Coca-Cola",
        "revenue": 45000.00,
        "cumulative_pct": 10.6,
        "rank": 1
      }
    ],
    "pareto_point": 80
  },
  "substitution_matrix": {
    "flows": [
      {
        "from_brand": "Pepsi",
        "to_brand": "Coca-Cola",
        "count": 45,
        "reason": "out_of_stock",
        "conversion_rate": 0.73
      }
    ]
  },
  "basket_composition": {
    "avg_items": 3.2,
    "avg_categories": 2.1,
    "common_combinations": [
      {
        "products": ["Coca-Cola 1.5L", "Chips"],
        "frequency": 250,
        "lift": 1.8
      }
    ]
  }
}
```

---

## 4. Consumer Behavior Analytics

### `POST /scout-consumer-behavior`

Get behavior funnel, request methods, acceptance rates, and traits.

**Request:**
```json
{
  "tab": "funnel",
  "start_date": "2024-11-07",
  "end_date": "2025-12-07"
}
```

**Parameters:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `tab` | string | Yes | `funnel`, `request_methods`, `acceptance`, `traits` |

**Response (funnel):**
```json
{
  "kpis": {
    "total_interactions": 8000,
    "avg_acceptance_rate": 0.68,
    "impulse_purchase_rate": 0.35,
    "brand_loyalty_score": 0.72
  },
  "funnel": {
    "stages": [
      {
        "stage": "store_visit",
        "count": 10000,
        "percentage": 100.0,
        "drop_off_rate": 0.0
      },
      {
        "stage": "product_browse",
        "count": 8500,
        "percentage": 85.0,
        "drop_off_rate": 15.0
      },
      {
        "stage": "brand_request",
        "count": 7200,
        "percentage": 72.0,
        "drop_off_rate": 15.3
      },
      {
        "stage": "accept_suggestion",
        "count": 4900,
        "percentage": 49.0,
        "drop_off_rate": 31.9
      },
      {
        "stage": "purchase",
        "count": 6410,
        "percentage": 64.1,
        "drop_off_rate": 10.9
      }
    ]
  },
  "request_methods": {
    "methods": [
      {
        "method": "verbal",
        "count": 4500,
        "percentage": 62.5,
        "avg_basket_value": 68.50
      },
      {
        "method": "pointing",
        "count": 1800,
        "percentage": 25.0,
        "avg_basket_value": 55.20
      },
      {
        "method": "indirect",
        "count": 900,
        "percentage": 12.5,
        "avg_basket_value": 72.10
      }
    ]
  },
  "acceptance_rates": {
    "overall_rate": 0.68,
    "by_category": [
      {
        "category": "beverage",
        "acceptance_rate": 0.75,
        "suggestion_count": 3500
      }
    ],
    "by_time_of_day": [
      {
        "time": "morning",
        "acceptance_rate": 0.71
      }
    ]
  },
  "behavior_traits": {
    "impulse_rate": 0.35,
    "brand_loyalty_score": 0.72,
    "avg_decision_time": 45,
    "traits": [
      {
        "trait": "price_conscious",
        "prevalence": 0.42,
        "impact_on_basket": -5.20
      }
    ]
  }
}
```

---

## 5. Consumer Profiling Analytics

### `POST /scout-consumer-profiling`

Get demographic distributions and segment behaviors.

**Request:**
```json
{
  "tab": "income",
  "start_date": "2024-11-07",
  "end_date": "2025-12-07"
}
```

**Parameters:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `tab` | string | Yes | `income`, `age_gender`, `urban_rural`, `segments` |

**Response (income):**
```json
{
  "kpis": {
    "total_customers": 10000,
    "avg_age": 32.5,
    "gender_split": {
      "male": 4200,
      "female": 5800
    },
    "urban_customers": 6500
  },
  "income_distribution": [
    {
      "label": "low",
      "count": 4000,
      "percentage": 40.0,
      "avg_basket_value": 55.20
    },
    {
      "label": "middle",
      "count": 4500,
      "percentage": 45.0,
      "avg_basket_value": 68.50
    },
    {
      "label": "high",
      "count": 1500,
      "percentage": 15.0,
      "avg_basket_value": 95.30
    }
  ],
  "age_gender_distribution": [...],
  "urban_rural_split": [...],
  "segment_behaviors": [
    {
      "segment_name": "High-Value Urban Professionals",
      "size": 1200,
      "avg_basket_value": 98.50,
      "visit_frequency": 4.2,
      "preferred_categories": ["beverage", "personal_care"],
      "lifetime_value": 4920.00
    }
  ]
}
```

---

## 6. Geographical Intelligence

### `POST /scout-geo-intelligence`

Get regional performance, store locations, demographics, and market penetration.

**Request:**
```json
{
  "tab": "regional",
  "start_date": "2024-11-07",
  "end_date": "2025-12-07"
}
```

**Parameters:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `tab` | string | Yes | `regional`, `stores`, `demographics`, `penetration` |

**Response (regional):**
```json
{
  "kpis": {
    "top_region": "NCR",
    "regional_coverage": 17,
    "avg_performance": 25000.00,
    "market_penetration": 0.12
  },
  "regional_performance": [
    {
      "region": "NCR",
      "revenue": 170000.00,
      "basket_count": 2500,
      "store_count": 75,
      "avg_basket_value": 68.00,
      "growth_pct": 15.2,
      "market_share": 0.40
    }
  ],
  "store_locations": [
    {
      "store_id": "store-uuid-1",
      "store_name": "Aling Maria Sari-Sari",
      "latitude": 14.5995,
      "longitude": 120.9842,
      "region": "NCR",
      "city": "Manila",
      "revenue": 12500.00,
      "performance_score": 0.85
    }
  ],
  "regional_demographics": [...],
  "market_penetration": [...]
}
```

---

## 7. Data Dictionary (Transactions Schema)

### `GET /scout-transactions-schema`

Get the schema definition for the transactions table.

**Request:** No body required

**Response:**
```json
{
  "table_name": "transactions",
  "description": "Granular sales transaction data from POS systems",
  "record_count": 18431,
  "fields": [
    {
      "field_name": "id",
      "type": "uuid",
      "required": true,
      "description": "Unique transaction identifier",
      "example": "123e4567-e89b-12d3-a456-426614174000",
      "tags": ["basic_info"]
    },
    {
      "field_name": "store_id",
      "type": "uuid",
      "required": true,
      "description": "Foreign key to stores table",
      "example": "store-uuid-1",
      "tags": ["basic_info"]
    },
    {
      "field_name": "timestamp",
      "type": "timestamptz",
      "required": true,
      "description": "Transaction timestamp (ISO 8601)",
      "example": "2024-11-07T06:32:15Z",
      "tags": ["basic_info"]
    },
    {
      "field_name": "product_id",
      "type": "uuid",
      "required": true,
      "description": "Foreign key to products table",
      "example": "product-uuid-1",
      "tags": ["product_data"]
    },
    {
      "field_name": "brand_name",
      "type": "text",
      "required": true,
      "description": "Product brand name",
      "example": "Coca-Cola",
      "tags": ["product_data"]
    },
    {
      "field_name": "product_category",
      "type": "text",
      "required": true,
      "description": "Product category (beverage, snacks, etc.)",
      "example": "beverage",
      "tags": ["product_data"]
    },
    {
      "field_name": "quantity",
      "type": "numeric",
      "required": true,
      "description": "Quantity sold",
      "example": "2",
      "tags": ["business_logic"]
    },
    {
      "field_name": "unit_price",
      "type": "numeric",
      "required": true,
      "description": "Price per unit (PHP)",
      "example": "22.50",
      "tags": ["business_logic"]
    },
    {
      "field_name": "line_amount",
      "type": "numeric",
      "required": true,
      "description": "Total amount for this line (quantity * unit_price)",
      "example": "45.00",
      "tags": ["business_logic"]
    },
    {
      "field_name": "suggestion_made",
      "type": "boolean",
      "required": false,
      "description": "Whether store owner made a product suggestion",
      "example": "true",
      "tags": ["behavior"]
    },
    {
      "field_name": "suggestion_accepted",
      "type": "boolean",
      "required": false,
      "description": "Whether customer accepted the suggestion",
      "example": "false",
      "tags": ["behavior"]
    }
  ]
}
```

---

## 8. AI Assistant (Ask Suqi)

### `POST /scout-ai-query`

Send a natural language query to the AI assistant.

**Request:**
```json
{
  "session_id": "existing-session-uuid",
  "message": "What are my top 5 products this month in NCR?",
  "context": {
    "route": "transaction-trends",
    "filters": {
      "start_date": "2024-11-01",
      "end_date": "2024-11-30",
      "regions": ["NCR"]
    },
    "selected_entities": {
      "brands": [],
      "regions": ["NCR"],
      "skus": []
    }
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | No | Existing session ID (or omit for new session) |
| `message` | string | Yes | User's natural language query |
| `context.route` | string | Yes | Current page (e.g., "transaction-trends") |
| `context.filters` | object | Yes | Current filter state |
| `context.selected_entities` | object | No | Highlighted brands/regions/SKUs |

**Response:**
```json
{
  "session_id": "session-uuid",
  "message": {
    "id": "msg-uuid",
    "role": "assistant",
    "content": "Based on the data for NCR in November 2024, your top 5 products are:\n\n1. **Coca-Cola 1.5L PET** (Coca-Cola) - ₱45,000 revenue, 2,000 units\n2. **Lucky Me! Pancit Canton** (Monde Nissin) - ₱38,500 revenue, 1,850 units\n3. **Safeguard Soap Bar** (Procter & Gamble) - ₱32,000 revenue, 1,600 units\n4. **Bear Brand Milk** (Nestlé) - ₱28,750 revenue, 1,150 units\n5. **Spam Lite** (Hormel) - ₱25,200 revenue, 900 units\n\nCoca-Cola continues to dominate with 11.7% of total revenue. There's a notable increase in personal care products (Safeguard) this month.",
    "timestamp": "2025-12-07T10:30:00Z",
    "tool_calls": [
      {
        "tool": "get_product_performance",
        "input": {
          "start_date": "2024-11-01",
          "end_date": "2024-11-30",
          "regions": ["NCR"],
          "limit": 5,
          "sort_by": "revenue"
        },
        "output": {
          "products": [...]
        }
      }
    ]
  },
  "insights": [
    {
      "id": "insight-uuid",
      "title": "Strong Beverage Performance",
      "description": "Beverage category up 15% vs last month",
      "impact": "high",
      "category": "trend",
      "metric_change": 15.0,
      "timestamp": "2025-12-07T10:30:00Z"
    }
  ],
  "recommendations": [
    {
      "id": "rec-uuid",
      "title": "Increase Safeguard Stock",
      "description": "Personal care showing strong growth, consider increasing stock levels",
      "action_items": [
        "Order 20% more Safeguard inventory",
        "Promote personal care category in-store"
      ],
      "expected_impact": "5-8% revenue increase in personal care",
      "confidence": 0.82,
      "priority": "high",
      "timestamp": "2025-12-07T10:30:00Z"
    }
  ]
}
```

---

## 9. RAG Search (Knowledge Base)

### `POST /scout-rag-search`

Perform vector similarity search on knowledge base.

**Request:**
```json
{
  "query": "How to increase sales on rainy days?",
  "limit": 5,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "results": [
    {
      "chunk_id": "chunk-uuid-1",
      "document_title": "Rainy Day Sales Strategies",
      "chunk_text": "During rainy weather, stores see a 15% increase in impulse purchases, particularly in comfort foods and hot beverages. Recommendations: 1) Display hot chocolate and instant noodles near entrance...",
      "similarity": 0.89
    },
    {
      "chunk_id": "chunk-uuid-2",
      "document_title": "Weather-Driven Demand Forecasting",
      "chunk_text": "Rain increases demand for umbrellas (+45%), instant noodles (+22%), and canned goods (+18%). Stock accordingly during monsoon season...",
      "similarity": 0.84
    }
  ]
}
```

---

## 10. Retail OS Overview

### `GET /scout/retail-os/overview`

Get stats for all 4 Retail OS features (Tantrum Tamer, Scan & Switch, Predictive Stock, Brand Command Center).

**Request:** No body required

**Response:**
```json
{
  "tantrum_tamer": {
    "total_tantrums": 450,
    "avg_duration_seconds": 180,
    "resolved_by_suggestion": 320,
    "top_calming_products": [
      {
        "product_name": "Choc-nut Candy",
        "success_rate": 0.78
      }
    ]
  },
  "scan_and_switch": {
    "total_scans": 1250,
    "switch_rate": 0.32,
    "top_conquests": [
      {
        "from_brand": "Pepsi",
        "to_brand": "Coca-Cola",
        "count": 85
      }
    ]
  },
  "predictive_stock": {
    "stockout_risk_count": 12,
    "overstock_count": 5,
    "forecasted_demand": [
      {
        "sku": "COKE-001-PET",
        "forecast_7d": 250,
        "confidence": 0.88
      }
    ],
    "weather_impact": [
      {
        "condition": "rainy",
        "demand_multiplier": 1.15
      }
    ]
  },
  "brand_command_center": {
    "active_campaigns": 3,
    "total_impressions": 125000,
    "conversion_rate": 0.042,
    "top_performing_brands": [
      {
        "brand": "Coca-Cola",
        "revenue": 170000.00,
        "growth_pct": 15.2
      }
    ]
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing JWT token",
    "details": {
      "timestamp": "2025-12-07T10:30:00Z",
      "request_id": "req-uuid"
    }
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request body or missing required fields |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 403 | `FORBIDDEN` | User doesn't have permission for this resource |
| 404 | `NOT_FOUND` | Resource not found |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Rate Limits

**Current Limits:**
- 100 requests/minute per user
- 1000 requests/hour per tenant

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```

---

## Pagination

For endpoints returning large datasets (future):

**Request:**
```json
{
  "page": 1,
  "page_size": 50
}
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_pages": 10,
    "total_count": 500
  }
}
```

---

## Testing

### Example cURL

```bash
# Get dashboard overview
curl -X POST https://your-project.supabase.co/functions/v1/scout-dashboard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "start_date": "2024-11-07",
    "end_date": "2025-12-07",
    "regions": ["NCR"]
  }'
```

### Example Fetch (JavaScript)

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/scout-dashboard', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({
    start_date: '2024-11-07',
    end_date: '2025-12-07',
    regions: ['NCR'],
  }),
})

const data = await response.json()
console.log(data)
```

---

**Last Updated:** 2025-12-07  
**API Version:** 1.0
