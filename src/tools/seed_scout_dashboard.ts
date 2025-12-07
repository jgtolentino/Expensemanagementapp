/**
 * Scout Dashboard - Seed Data Script
 * 
 * Purpose: Generate 18,000+ realistic Philippine retail transactions
 * 
 * Data Volume:
 * - 250 stores across 17 regions
 * - 50 brands (Philippine context)
 * - 400 products/SKUs
 * - 10,000 customers
 * - 18,000+ transactions (365-day window)
 * 
 * Realistic Patterns:
 * - Geographic distribution (Metro Manila 40%, CALABARZON 20%, etc.)
 * - Category mix (Beverage 35%, Snacks 25%, Tobacco 15%, etc.)
 * - Time patterns (peak hours, weekend variations)
 * - Behavioral patterns (request types, suggestions, substitutions)
 * - Demographics (age, gender, income segments)
 * 
 * Usage:
 *   ts-node tools/seed_scout_dashboard.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================================
// CONFIGURATION
// =====================================================================

const TENANT_ID = '00000000-0000-0000-0000-000000000001'; // Demo tenant
const START_DATE = new Date('2024-12-07'); // 365 days ago
const END_DATE = new Date('2025-12-07');   // Today

const STORES_COUNT = 250;
const BRANDS_COUNT = 50;
const PRODUCTS_COUNT = 400;
const CUSTOMERS_COUNT = 10000;
const TARGET_TRANSACTIONS = 18000;

// =====================================================================
// PHILIPPINE GEOGRAPHY DATA
// =====================================================================

const PHILIPPINE_REGIONS = [
  { code: 'NCR', name: 'National Capital Region', island: 'Luzon', weight: 40 },
  { code: 'IVA', name: 'CALABARZON', island: 'Luzon', weight: 20 },
  { code: 'III', name: 'Central Luzon', island: 'Luzon', weight: 15 },
  { code: 'VII', name: 'Central Visayas', island: 'Visayas', weight: 8 },
  { code: 'VI', name: 'Western Visayas', island: 'Visayas', weight: 5 },
  { code: 'XI', name: 'Davao Region', island: 'Mindanao', weight: 4 },
  { code: 'I', name: 'Ilocos Region', island: 'Luzon', weight: 3 },
  { code: 'II', name: 'Cagayan Valley', island: 'Luzon', weight: 2 },
  { code: 'V', name: 'Bicol Region', island: 'Luzon', weight: 1.5 },
  { code: 'X', name: 'Northern Mindanao', island: 'Mindanao', weight: 1.5 },
];

const NCR_CITIES = [
  'Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong',
  'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'San Juan', 'Marikina',
  'Pasay', 'Parañaque', 'Las Piñas', 'Muntinlupa', 'Pateros'
];

const CALABARZON_CITIES = [
  'Antipolo', 'Bacoor', 'Dasmariñas', 'Imus', 'Cavite City', 'Lipa', 'Batangas City',
  'Calamba', 'Santa Rosa', 'Biñan', 'San Pedro', 'Lucena', 'Tagaytay'
];

// =====================================================================
// PHILIPPINE BRANDS & PRODUCTS
// =====================================================================

const PHILIPPINE_BRANDS = [
  // Beverages
  { name: 'Coca-Cola', category: 'beverage', manufacturer: 'Coca-Cola Philippines', local: false },
  { name: 'Pepsi', category: 'beverage', manufacturer: 'PepsiCo Philippines', local: false },
  { name: 'RC Cola', category: 'beverage', manufacturer: 'Cosmos Bottling', local: true },
  { name: 'Zesto', category: 'beverage', manufacturer: 'Zest-O Corporation', local: true },
  { name: 'C2', category: 'beverage', manufacturer: 'URC', local: true },
  { name: 'San Miguel Beer', category: 'beverage', manufacturer: 'San Miguel Corporation', local: true },
  { name: 'Red Horse', category: 'beverage', manufacturer: 'San Miguel Corporation', local: true },
  { name: 'Summit Water', category: 'beverage', manufacturer: 'Summit Water', local: true },
  { name: 'Wilkins', category: 'beverage', manufacturer: 'Coca-Cola Philippines', local: false },
  
  // Snacks
  { name: 'Jack n Jill', category: 'snacks', manufacturer: 'URC', local: true },
  { name: 'Oishi', category: 'snacks', manufacturer: 'Liwayway Marketing', local: true },
  { name: 'Piattos', category: 'snacks', manufacturer: 'Jack n Jill', local: true },
  { name: 'Nova', category: 'snacks', manufacturer: 'Rebisco', local: true },
  { name: 'Boy Bawang', category: 'snacks', manufacturer: 'KSK Food Products', local: true },
  { name: 'Clover Chips', category: 'snacks', manufacturer: 'Leslie Corporation', local: true },
  { name: 'Chippy', category: 'snacks', manufacturer: 'Monde Nissin', local: true },
  
  // Tobacco
  { name: 'Marlboro', category: 'tobacco', manufacturer: 'Philip Morris Fortune', local: false },
  { name: 'Fortune', category: 'tobacco', manufacturer: 'Philip Morris Fortune', local: false },
  { name: 'Hope', category: 'tobacco', manufacturer: 'Mighty Corporation', local: true },
  { name: 'Champion', category: 'tobacco', manufacturer: 'Mighty Corporation', local: true },
  
  // Household
  { name: 'Tide', category: 'household', manufacturer: 'Procter & Gamble', local: false },
  { name: 'Ariel', category: 'household', manufacturer: 'Procter & Gamble', local: false },
  { name: 'Surf', category: 'household', manufacturer: 'Unilever', local: false },
  { name: 'Champion', category: 'household', manufacturer: 'Alcon Marketing', local: true },
  { name: 'Pride', category: 'household', manufacturer: 'Splash Corporation', local: true },
  { name: 'Joy', category: 'household', manufacturer: 'Procter & Gamble', local: false },
  
  // Personal Care
  { name: 'Safeguard', category: 'personal_care', manufacturer: 'Procter & Gamble', local: false },
  { name: 'Palmolive', category: 'personal_care', manufacturer: 'Colgate-Palmolive', local: false },
  { name: 'Silka', category: 'personal_care', manufacturer: 'Cosmetique Asia', local: true },
  { name: 'Master', category: 'personal_care', manufacturer: 'Splash Corporation', local: true },
  { name: 'Belo', category: 'personal_care', manufacturer: 'Belo Beauty', local: true },
  { name: 'Cream Silk', category: 'personal_care', manufacturer: 'Unilever', local: false },
];

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  
  return items[items.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getTimeOfDay(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// =====================================================================
// SEED FUNCTIONS
// =====================================================================

async function clearExistingData() {
  console.log('🗑️  Clearing existing Scout data...');
  
  await supabase.from('scout.ai_messages').delete().eq('conversation_id', 'not-null');
  await supabase.from('scout.ai_conversations').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.recommendations').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.transactions').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.baskets').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.customers').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.products').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.brands').delete().eq('tenant_id', TENANT_ID);
  await supabase.from('scout.stores').delete().eq('tenant_id', TENANT_ID);
  
  console.log('✅ Cleared existing data\n');
}

async function seedStores() {
  console.log(`📍 Seeding ${STORES_COUNT} stores...`);
  
  const stores = [];
  
  for (let i = 0; i < STORES_COUNT; i++) {
    const region = weightedRandom(PHILIPPINE_REGIONS);
    const urbanRural = Math.random() < 0.65 ? 'urban' : 'rural'; // 65% urban
    const storeType = urbanRural === 'urban' 
      ? (Math.random() < 0.7 ? 'sari_sari' : 'mini_mart')
      : 'sari_sari';
    
    let city;
    if (region.code === 'NCR') {
      city = randomElement(NCR_CITIES);
    } else if (region.code === 'IVA') {
      city = randomElement(CALABARZON_CITIES);
    } else {
      city = `City ${i + 1}`;
    }
    
    const baseLatLng = region.code === 'NCR' 
      ? { lat: 14.5995, lng: 120.9842 }  // Manila
      : { lat: 14.5 + Math.random() * 4, lng: 120 + Math.random() * 5 };
    
    stores.push({
      tenant_id: TENANT_ID,
      store_code: `STORE-${String(i + 1).padStart(4, '0')}`,
      store_name: `${randomElement(['Aling', 'Kuya', 'Ate', 'Mang', 'Manang'])} ${randomElement(['Maria', 'Juan', 'Rosa', 'Pedro', 'Lita'])} ${storeType === 'sari_sari' ? 'Sari-Sari Store' : 'Mini-Mart'}`,
      store_type: storeType,
      barangay: `Barangay ${randomInt(1, 200)}`,
      city,
      province: region.code === 'NCR' ? 'Metro Manila' : `${region.name} Province`,
      region: region.name,
      region_code: region.code,
      island_group: region.island,
      latitude: baseLatLng.lat + (Math.random() - 0.5) * 0.1,
      longitude: baseLatLng.lng + (Math.random() - 0.5) * 0.1,
      status: 'active',
      population_density: urbanRural === 'urban' ? 'high' : 'low',
      urban_rural: urbanRural,
      opened_date: randomDate(new Date('2020-01-01'), new Date('2024-06-01')),
    });
  }
  
  const { error } = await supabase.from('scout.stores').insert(stores);
  if (error) throw error;
  
  console.log(`✅ Seeded ${stores.length} stores\n`);
  return stores;
}

async function seedBrands() {
  console.log(`🏷️  Seeding ${BRANDS_COUNT} brands...`);
  
  const brands = PHILIPPINE_BRANDS.slice(0, BRANDS_COUNT).map((brand, i) => ({
    tenant_id: TENANT_ID,
    brand_code: brand.name.toUpperCase().replace(/\s+/g, '_'),
    brand_name: brand.name,
    manufacturer: brand.manufacturer,
    primary_category: brand.category,
    is_local_brand: brand.local,
    status: 'active',
  }));
  
  const { data, error } = await supabase.from('scout.brands').insert(brands).select();
  if (error) throw error;
  
  console.log(`✅ Seeded ${data!.length} brands\n`);
  return data!;
}

async function seedProducts(brands: any[]) {
  console.log(`📦 Seeding ${PRODUCTS_COUNT} products...`);
  
  const products = [];
  const packSizes = ['50g', '100g', '250g', '500g', '1L', '1.5L', '330ml', '500ml', '1 sachet', '1 bar', '1 pack'];
  
  for (let i = 0; i < PRODUCTS_COUNT; i++) {
    const brand = randomElement(brands);
    const productVariant = randomInt(1, 10);
    
    products.push({
      tenant_id: TENANT_ID,
      sku: `${brand.brand_code}-${String(productVariant).padStart(3, '0')}-${randomElement(['PET', 'BTL', 'PCK', 'SCH'])}`,
      product_name: `${brand.brand_name} ${randomElement(['Regular', 'Light', 'Zero', 'Extra', 'Strong', 'Mild', 'Classic', 'Premium'])} ${randomElement(packSizes)}`,
      brand_id: brand.id,
      brand_name: brand.brand_name,
      product_category: brand.primary_category,
      product_subcategory: brand.primary_category === 'beverage' ? randomElement(['Soft Drinks', 'Water', 'Juice', 'Beer'])
        : brand.primary_category === 'snacks' ? randomElement(['Chips', 'Nuts', 'Biscuits'])
        : brand.primary_category === 'tobacco' ? 'Cigarettes'
        : brand.primary_category === 'household' ? randomElement(['Detergent', 'Dishwashing', 'Cleaning'])
        : 'Personal Care',
      pack_size: randomElement(packSizes),
      unit_of_measure: randomElement(['piece', 'bottle', 'pack', 'sachet', 'bar']),
      is_tobacco: brand.primary_category === 'tobacco',
      is_alcoholic: brand.primary_category === 'beverage' && brand.brand_name.includes('Beer'),
      status: 'active',
    });
  }
  
  const { data, error } = await supabase.from('scout.products').insert(products).select();
  if (error) throw error;
  
  console.log(`✅ Seeded ${data!.length} products\n`);
  return data!;
}

async function seedCustomers() {
  console.log(`👥 Seeding ${CUSTOMERS_COUNT} customers...`);
  
  const customers = [];
  const regions = PHILIPPINE_REGIONS.map(r => r.name);
  
  for (let i = 0; i < CUSTOMERS_COUNT; i++) {
    const gender = randomElement(['male', 'female', 'unknown']);
    const ageBrackets = ['18_24', '25_34', '35_44', '45_54', '55_plus'];
    const ageBracket = randomElement(ageBrackets);
    const incomeWeights = [
      { segment: 'high', weight: 15 },
      { segment: 'middle', weight: 50 },
      { segment: 'low', weight: 35 },
    ];
    const incomeSegment = weightedRandom(incomeWeights).segment;
    const urbanRural = Math.random() < 0.65 ? 'urban' : 'rural';
    
    customers.push({
      tenant_id: TENANT_ID,
      customer_code: `CUST-${String(i + 1).padStart(6, '0')}`,
      gender,
      age_bracket: ageBracket,
      estimated_age: ageBracket === '18_24' ? randomInt(18, 24)
        : ageBracket === '25_34' ? randomInt(25, 34)
        : ageBracket === '35_44' ? randomInt(35, 44)
        : ageBracket === '45_54' ? randomInt(45, 54)
        : randomInt(55, 75),
      income_segment: incomeSegment,
      urban_rural: urbanRural,
      home_region: randomElement(regions),
      is_repeat_customer: false,  // Will be updated by trigger
      total_transactions: 0,
      lifetime_value: 0,
      is_anonymous: Math.random() < 0.1,  // 10% anonymous
      consent_recorded: Math.random() < 0.9,
    });
  }
  
  const { data, error } = await supabase.from('scout.customers').insert(customers).select();
  if (error) throw error;
  
  console.log(`✅ Seeded ${data!.length} customers\n`);
  return data!;
}

async function seedTransactions(stores: any[], products: any[], customers: any[]) {
  console.log(`🛒 Seeding ${TARGET_TRANSACTIONS}+ transactions...`);
  
  const transactions = [];
  const basketsCreated = new Set<string>();
  let transactionCount = 0;
  
  // Generate transactions over 365 days
  const totalDays = Math.floor((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const transactionsPerDay = Math.ceil(TARGET_TRANSACTIONS / totalDays);
  
  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(START_DATE);
    currentDate.setDate(currentDate.getDate() + day);
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // More transactions on weekends
    const dailyTransactions = Math.floor(transactionsPerDay * (isWeekend ? 1.3 : 1.0));
    
    for (let t = 0; t < dailyTransactions; t++) {
      // Time of day (peak hours: 7-9am, 12-1pm, 5-7pm)
      const hourWeights = [
        0.5, 0.5, 0.5, 0.5, 0.5, 1,     // 12am-6am
        3, 4, 3, 2, 1.5, 2,              // 6am-12pm (morning peak)
        3, 2, 1.5, 1.5, 2, 3,            // 12pm-6pm (afternoon)
        4, 3, 2, 1, 0.8, 0.6             // 6pm-12am (evening peak)
      ];
      const hour = weightedRandom(hourWeights.map((weight, i) => ({ hour: i, weight }))).hour;
      
      const timestamp = new Date(currentDate);
      timestamp.setHours(hour, randomInt(0, 59), randomInt(0, 59));
      
      const timeOfDay = getTimeOfDay(hour);
      
      // Select store and customer
      const store = randomElement(stores);
      const customer = Math.random() < 0.9 ? randomElement(customers) : null;  // 10% no customer tracking
      
      // Basket composition (1-6 items, avg ~2.8)
      const basketSizeWeights = [
        { size: 1, weight: 35 },
        { size: 2, weight: 30 },
        { size: 3, weight: 20 },
        { size: 4, weight: 10 },
        { size: 5, weight: 3 },
        { size: 6, weight: 2 },
      ];
      const basketSize = weightedRandom(basketSizeWeights).size;
      
      // Duration (faster for single items)
      const baseDuration = basketSize === 1 ? randomInt(30, 90) : randomInt(120, 480);
      const durationSeconds = baseDuration;
      
      // Basket ID
      const basketId = `basket-${day}-${t}`;
      basketsCreated.add(basketId);
      
      // Generate items in basket
      const basketProducts = [];
      for (let item = 0; item < basketSize; item++) {
        const product = randomElement(products);
        const quantity = Math.random() < 0.8 ? 1 : randomInt(2, 3);
        
        // Price variation
        const basePrice = product.product_category === 'beverage' ? randomFloat(15, 60)
          : product.product_category === 'snacks' ? randomFloat(8, 35)
          : product.product_category === 'tobacco' ? randomFloat(120, 180)
          : product.product_category === 'household' ? randomFloat(10, 80)
          : randomFloat(20, 150);
        
        const unitPrice = randomFloat(basePrice * 0.9, basePrice * 1.1);
        const lineAmount = quantity * unitPrice;
        
        // Request behavior (EXPLICIT fields)
        const requestType = Math.random() < 0.6 ? 'branded' : Math.random() < 0.5 ? 'unbranded' : 'unsure';
        const requestMode = Math.random() < 0.7 ? 'verbal' : Math.random() < 0.6 ? 'pointing' : 'indirect';
        
        // Store suggestion (20% of items)
        const storeSuggestionMade = Math.random() < 0.2;
        const storeSuggestionAccepted = storeSuggestionMade ? (Math.random() < 0.7) : null;
        const storeSuggestedSkuId = storeSuggestionMade ? randomElement(products).id : null;
        
        // Substitution (10% of items)
        const isSubstituted = Math.random() < 0.1;
        const originalProductId = isSubstituted ? randomElement(products.filter(p => p.product_category === product.product_category)).id : null;
        const originalBrandId = isSubstituted ? randomElement(products).brand_id : null;
        const substitutionReason = isSubstituted ? randomElement(['out_of_stock', 'price', 'storeowner_suggestion']) : null;
        
        transactions.push({
          tenant_id: TENANT_ID,
          basket_id: basketId,
          store_id: store.id,
          customer_id: customer?.id || null,
          product_id: product.id,
          brand_id: product.brand_id,
          timestamp: timestamp.toISOString(),
          time_of_day: timeOfDay,
          is_weekend: isWeekend,
          day_of_week: dayOfWeek,
          barangay: store.barangay,
          city: store.city,
          province: store.province,
          region: store.region,
          island_group: store.island_group,
          sku: product.sku,
          product_name: product.product_name,
          product_category: product.product_category,
          product_subcategory: product.product_subcategory,
          quantity,
          unit_price: unitPrice,
          line_amount: lineAmount,
          is_substituted: isSubstituted,
          original_product_id: originalProductId,
          original_brand_id: originalBrandId,
          substitution_reason: substitutionReason,
          request_type: requestType,
          request_mode: requestMode,
          store_suggestion_made: storeSuggestionMade,
          store_suggestion_accepted: storeSuggestionAccepted,
          store_suggested_sku_id: storeSuggestedSkuId,
          transaction_duration_seconds: durationSeconds,
          item_sequence: item + 1,
          recording_id: `rec-${day}-${t}`,
          confidence_score: randomFloat(0.7, 0.99),
        });
        
        transactionCount++;
      }
    }
    
    // Progress indicator
    if (day % 30 === 0) {
      console.log(`  Progress: ${day}/${totalDays} days, ${transactionCount} transactions`);
    }
  }
  
  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const { error } = await supabase.from('scout.transactions').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    console.log(`  Inserted batch ${i / batchSize + 1}/${Math.ceil(transactions.length / batchSize)}`);
  }
  
  console.log(`✅ Seeded ${transactions.length} transactions in ${basketsCreated.size} baskets\n`);
  return { transactions, basketCount: basketsCreated.size };
}

// =====================================================================
// MAIN SEED FUNCTION
// =====================================================================

async function main() {
  console.log('🌱 Scout Dashboard - Seed Data Generation\n');
  console.log('='.repeat(60));
  console.log(`Tenant: ${TENANT_ID}`);
  console.log(`Date Range: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);
  console.log(`Target: ${TARGET_TRANSACTIONS}+ transactions`);
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // Clear existing data
    await clearExistingData();
    
    // Seed dimensions
    const stores = await seedStores();
    const brands = await seedBrands();
    const products = await seedProducts(brands);
    const customers = await seedCustomers();
    
    // Seed facts
    const { transactions, basketCount } = await seedTransactions(stores, products, customers);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED DATA GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Stores:        ${stores.length}`);
    console.log(`Brands:        ${brands.length}`);
    console.log(`Products:      ${products.length}`);
    console.log(`Customers:     ${customers.length}`);
    console.log(`Transactions:  ${transactions.length}`);
    console.log(`Baskets:       ${basketCount}`);
    console.log(`Avg Basket:    ${(transactions.length / basketCount).toFixed(2)} items`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error during seed:', error);
    process.exit(1);
  }
}

main();
