/**
 * Agency Creative Workroom - Seed Script
 * Phase 4: Generate realistic demo data for Agency Workroom
 * 
 * Generates:
 * - 3 tenants (TBWA agencies)
 * - 80+ users (Creative Director, AD, CD, Designer, etc.)
 * - 40+ clients (Philippines brands)
 * - 80+ brands
 * - 200+ campaigns (18 months)
 * - 1,200+ artifacts (briefs, scripts, decks, boards)
 * - 50,000+ timesheet entries
 * - 200+ knowledge documents
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// =====================================================================
// Configuration
// =====================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Seed data volumes
const SEED_CONFIG = {
  tenants: 3,
  usersPerTenant: 28,
  clientsPerTenant: 14,
  brandsPerClient: 2,
  campaignsPerTenant: 70,
  artifactsPerCampaign: 6,
  versionsPerArtifact: 2,
  commentsPerArtifact: 4,
  timesheetMonths: 18,
  knowledgeDocsPerTenant: 70,
};

// =====================================================================
// Utility Functions
// =====================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// =====================================================================
// Master Data
// =====================================================================

const ROLES = [
  'creative_director',
  'art_director',
  'copywriter',
  'designer',
  'strategist',
  'account_manager',
  'producer',
  'motion_designer',
];

const PHILIPPINES_CLIENTS = [
  'SM Supermalls', 'Ayala Malls', 'Jollibee', 'McDonald\'s Philippines', 'KFC Philippines',
  'Globe Telecom', 'Smart Communications', 'PLDT', 'Sun Cellular',
  'BDO', 'BPI', 'Metrobank', 'UnionBank',
  'Meralco', 'Manila Water', 'Maynilad',
  'San Miguel Beer', 'Red Horse Beer', 'Emperador Brandy',
  'Nestle Philippines', 'Unilever Philippines', 'P&G Philippines',
  'SM Store', 'Robinsons Department Store', 'Landmark',
  'Century Tuna', 'Argentina Corned Beef', 'Lucky Me Noodles',
  'Penshoppe', 'Bench', 'Human',
  'Cebu Pacific', 'Philippine Airlines',
  'NLEX', 'SLEX', 'Skyway',
  'Mall of Asia', 'Bonifacio Global City', 'Makati CBD',
  'Petron', 'Shell Philippines', 'Caltex',
];

const BRAND_SUFFIXES = ['', ' Premium', ' Gold', ' Max', ' Plus', ' Pro', ' Select'];

const CAMPAIGN_TYPES = [
  'Brand Launch', 'Product Launch', 'Seasonal', 'Digital Campaign',
  'Social Media', 'TV Commercial', 'Radio Spot', 'Print Campaign',
  'Experiential', 'Influencer Campaign', 'Partnership', 'Rebrand',
];

const CAMPAIGN_STATUSES = ['planning', 'in_progress', 'in_review', 'completed', 'on_hold'];

const ARTIFACT_TYPES = [
  'creative_brief', 'strategy_deck', 'mood_board', 'script', 
  'storyboard', 'design_comp', 'social_post', 'presentation',
  'media_plan', 'production_brief', 'shot_list', 'edit_notes',
];

const ARTIFACT_STATUSES = ['draft', 'in_review', 'approved', 'final', 'archived'];

const KNOWLEDGE_CATEGORIES = ['creative', 'strategy', 'production', 'best_practices', 'case_study'];

// =====================================================================
// Seed Functions
// =====================================================================

async function seedTenants() {
  console.log('🏢 Seeding tenants...');
  
  const tenants = [
    {
      id: faker.string.uuid(),
      name: 'TBWA\\Santiago Mangada Puno',
      slug: 'tbwa-smp',
      region: 'PH',
      currency: 'PHP',
      created_at: new Date('2020-01-01'),
    },
    {
      id: faker.string.uuid(),
      name: 'TBWA\\Digital Arts Network',
      slug: 'tbwa-dan',
      region: 'PH',
      currency: 'PHP',
      created_at: new Date('2020-01-01'),
    },
    {
      id: faker.string.uuid(),
      name: 'TBWA\\Manila',
      slug: 'tbwa-manila',
      region: 'PH',
      currency: 'PHP',
      created_at: new Date('2020-01-01'),
    },
  ];

  for (const tenant of tenants) {
    await supabase.from('core.tenants').insert(tenant);
  }

  console.log(`✅ Created ${tenants.length} tenants`);
  return tenants;
}

async function seedUsers(tenants: any[]) {
  console.log('👥 Seeding users...');
  
  const users: any[] = [];
  
  for (const tenant of tenants) {
    // Creative Directors (2)
    for (let i = 0; i < 2; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `cd${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'creative_director',
        created_at: new Date('2020-01-15'),
      });
    }

    // Art Directors (4)
    for (let i = 0; i < 4; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `ad${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'art_director',
        created_at: randomDate(new Date('2020-02-01'), new Date('2023-01-01')),
      });
    }

    // Copywriters (4)
    for (let i = 0; i < 4; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `cw${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'copywriter',
        created_at: randomDate(new Date('2020-02-01'), new Date('2023-01-01')),
      });
    }

    // Designers (6)
    for (let i = 0; i < 6; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `designer${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'designer',
        created_at: randomDate(new Date('2020-03-01'), new Date('2023-06-01')),
      });
    }

    // Strategists (3)
    for (let i = 0; i < 3; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `strategist${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'strategist',
        created_at: randomDate(new Date('2020-02-01'), new Date('2022-01-01')),
      });
    }

    // Account Managers (4)
    for (let i = 0; i < 4; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `am${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'account_manager',
        created_at: randomDate(new Date('2020-01-15'), new Date('2023-01-01')),
      });
    }

    // Producers (2)
    for (let i = 0; i < 2; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `producer${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'producer',
        created_at: randomDate(new Date('2020-04-01'), new Date('2023-01-01')),
      });
    }

    // Motion Designers (3)
    for (let i = 0; i < 3; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `motion${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'motion_designer',
        created_at: randomDate(new Date('2020-06-01'), new Date('2024-01-01')),
      });
    }
  }

  for (const user of users) {
    await supabase.from('core.users').insert(user);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedClientsAndBrands(tenants: any[]) {
  console.log('🏢 Seeding clients and brands...');
  
  const clients: any[] = [];
  const brands: any[] = [];

  for (const tenant of tenants) {
    const tenantClients = PHILIPPINES_CLIENTS.slice(0, SEED_CONFIG.clientsPerTenant);

    for (const clientName of tenantClients) {
      const clientCreated = randomDate(new Date('2020-01-01'), new Date('2024-01-01'));
      
      const client = {
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        client_name: clientName,
        client_code: clientName.substring(0, 3).toUpperCase() + randomInt(100, 999),
        industry: randomElement(['FMCG', 'Retail', 'Telecom', 'Finance', 'Services', 'F&B']),
        retention_type: randomElement(['retainer', 'project', 'hybrid']),
        status: 'active',
        created_at: clientCreated,
      };

      clients.push(client);

      // Create brands for each client
      const brandCount = randomInt(1, SEED_CONFIG.brandsPerClient);
      for (let i = 0; i < brandCount; i++) {
        brands.push({
          id: faker.string.uuid(),
          tenant_id: tenant.id,
          client_id: client.id,
          brand_name: clientName + randomElement(BRAND_SUFFIXES),
          brand_code: client.client_code + '-B' + (i + 1),
          status: 'active',
          created_at: clientCreated,
        });
      }
    }
  }

  // Insert
  for (let i = 0; i < clients.length; i += 50) {
    await supabase.from('agency.clients').insert(clients.slice(i, i + 50));
  }
  
  for (let i = 0; i < brands.length; i += 100) {
    await supabase.from('agency.brands').insert(brands.slice(i, i + 100));
  }

  console.log(`✅ Created ${clients.length} clients, ${brands.length} brands`);
  return { clients, brands };
}

async function seedCampaigns(tenants: any[], users: any[], clients: any[], brands: any[]) {
  console.log('📢 Seeding campaigns...');
  
  const campaigns: any[] = [];
  const phases: any[] = [];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(u => u.tenant_id === tenant.id);
    const creativeDirs = tenantUsers.filter(u => u.role === 'creative_director');
    const accountMgrs = tenantUsers.filter(u => u.role === 'account_manager');
    const tenantClients = clients.filter(c => c.tenant_id === tenant.id);
    const tenantBrands = brands.filter(b => b.tenant_id === tenant.id);

    for (let i = 0; i < SEED_CONFIG.campaignsPerTenant; i++) {
      const client = randomElement(tenantClients);
      const clientBrands = tenantBrands.filter(b => b.client_id === client.id);
      const brand = clientBrands.length > 0 ? randomElement(clientBrands) : null;

      const campaignType = randomElement(CAMPAIGN_TYPES);
      const startDate = randomDate(new Date('2023-06-01'), new Date('2025-10-01'));
      const endDate = randomDate(startDate, new Date('2026-06-01'));
      
      const campaign = {
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        client_id: client.id,
        brand_id: brand?.id || null,
        campaign_code: `${client.client_code}-${String(i + 1).padStart(3, '0')}`,
        campaign_name: `${client.client_name} - ${campaignType}`,
        campaign_type: campaignType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: randomElement(CAMPAIGN_STATUSES),
        budget_amount: randomInt(500000, 15000000),
        currency: 'PHP',
        lead_creative: randomElement(creativeDirs).id,
        account_manager: randomElement(accountMgrs).id,
        created_at: startDate,
      };

      campaigns.push(campaign);

      // Create campaign phases
      const phaseTypes = ['Strategy', 'Creative Development', 'Production', 'Post-Production'];
      for (let j = 0; j < phaseTypes.length; j++) {
        const phaseStart = new Date(startDate.getTime() + j * 14 * 24 * 60 * 60 * 1000);
        const phaseEnd = new Date(phaseStart.getTime() + 21 * 24 * 60 * 60 * 1000);

        phases.push({
          id: faker.string.uuid(),
          tenant_id: tenant.id,
          campaign_id: campaign.id,
          phase_name: phaseTypes[j],
          phase_order: j + 1,
          start_date: phaseStart.toISOString().split('T')[0],
          end_date: phaseEnd.toISOString().split('T')[0],
          status: j < 2 ? 'completed' : randomElement(['in_progress', 'planned']),
          created_at: phaseStart,
        });
      }
    }
  }

  // Insert
  for (let i = 0; i < campaigns.length; i += 100) {
    await supabase.from('agency.campaigns').insert(campaigns.slice(i, i + 100));
  }
  
  for (let i = 0; i < phases.length; i += 200) {
    await supabase.from('agency.campaign_phases').insert(phases.slice(i, i + 200));
  }

  console.log(`✅ Created ${campaigns.length} campaigns, ${phases.length} phases`);
  return { campaigns, phases };
}

async function seedArtifacts(campaigns: any[], users: any[]) {
  console.log('🎨 Seeding artifacts...');
  
  const artifacts: any[] = [];
  const versions: any[] = [];
  const comments: any[] = [];

  for (const campaign of campaigns) {
    const tenantUsers = users.filter(u => u.tenant_id === campaign.tenant_id);
    const artifactCount = randomInt(3, SEED_CONFIG.artifactsPerCampaign);

    for (let i = 0; i < artifactCount; i++) {
      const artifactType = randomElement(ARTIFACT_TYPES);
      const createdDate = randomDate(new Date(campaign.start_date), new Date());
      const creator = randomElement(tenantUsers);

      const artifact = {
        id: faker.string.uuid(),
        tenant_id: campaign.tenant_id,
        campaign_id: campaign.id,
        artifact_type: artifactType,
        title: `${campaign.campaign_name} - ${artifactType.replace('_', ' ').toUpperCase()}`,
        content: faker.lorem.paragraphs(5),
        status: randomElement(ARTIFACT_STATUSES),
        created_by: creator.id,
        last_edited_by: creator.id,
        created_at: createdDate,
        updated_at: createdDate,
      };

      artifacts.push(artifact);

      // Create versions
      const versionCount = randomInt(1, SEED_CONFIG.versionsPerArtifact);
      for (let j = 0; j < versionCount; j++) {
        const versionDate = new Date(createdDate.getTime() + j * 24 * 60 * 60 * 1000);
        
        versions.push({
          id: faker.string.uuid(),
          tenant_id: campaign.tenant_id,
          artifact_id: artifact.id,
          version_number: j + 1,
          content: artifact.content + '\n\n[Version ' + (j + 1) + ' changes]',
          created_by: randomElement(tenantUsers).id,
          created_at: versionDate,
        });
      }

      // Create comments
      const commentCount = randomInt(1, SEED_CONFIG.commentsPerArtifact);
      for (let k = 0; k < commentCount; k++) {
        comments.push({
          id: faker.string.uuid(),
          tenant_id: campaign.tenant_id,
          artifact_id: artifact.id,
          comment_text: faker.lorem.sentence(),
          created_by: randomElement(tenantUsers).id,
          created_at: randomDate(createdDate, new Date()),
        });
      }
    }
  }

  console.log(`  Inserting ${artifacts.length} artifacts...`);
  for (let i = 0; i < artifacts.length; i += 100) {
    await supabase.from('agency.artifacts').insert(artifacts.slice(i, i + 100));
  }
  
  console.log(`  Inserting ${versions.length} versions...`);
  for (let i = 0; i < versions.length; i += 200) {
    await supabase.from('agency.artifact_versions').insert(versions.slice(i, i + 200));
  }
  
  console.log(`  Inserting ${comments.length} comments...`);
  for (let i = 0; i < comments.length; i += 200) {
    await supabase.from('agency.artifact_comments').insert(comments.slice(i, i + 200));
  }

  console.log(`✅ Created ${artifacts.length} artifacts, ${versions.length} versions, ${comments.length} comments`);
  return { artifacts, versions, comments };
}

async function seedTimesheets(campaigns: any[], users: any[]) {
  console.log('⏱️  Seeding timesheets (this may take a while)...');
  
  const timesheets: any[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - SEED_CONFIG.timesheetMonths);

  for (const campaign of campaigns) {
    const tenantUsers = users.filter(u => u.tenant_id === campaign.tenant_id);
    const creativeUsers = tenantUsers.filter(u => 
      ['creative_director', 'art_director', 'copywriter', 'designer', 'strategist', 'motion_designer'].includes(u.role)
    );

    // Generate timesheets for campaign duration
    const campaignStart = new Date(campaign.start_date);
    const campaignEnd = new Date(campaign.end_date);
    const weeksInCampaign = Math.ceil((campaignEnd.getTime() - campaignStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    for (let week = 0; week < Math.min(weeksInCampaign, 80); week++) {
      const weekDate = new Date(campaignStart.getTime() + week * 7 * 24 * 60 * 60 * 1000);
      
      // Each campaign has 2-4 active team members per week
      const activeUsers = creativeUsers.slice(0, randomInt(2, 4));
      
      for (const user of activeUsers) {
        const daysWorked = randomInt(2, 5);
        
        for (let day = 0; day < daysWorked; day++) {
          const entryDate = new Date(weekDate.getTime() + day * 24 * 60 * 60 * 1000);
          
          if (entryDate > new Date()) break;
          
          const hours = randomInt(2, 8) * 0.5;
          const billable = Math.random() > 0.1; // 90% billable
          const billRate = randomInt(2000, 5000); // PHP 2000-5000/hr
          const costRate = billRate * 0.65;
          
          const status = entryDate < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) 
            ? 'approved' 
            : randomElement(['draft', 'submitted', 'approved']);

          timesheets.push({
            id: faker.string.uuid(),
            tenant_id: campaign.tenant_id,
            employee_id: user.id,
            campaign_id: campaign.id,
            entry_date: entryDate.toISOString().split('T')[0],
            week_start_date: getMonday(entryDate).toISOString().split('T')[0],
            hours,
            billable,
            cost_rate: costRate,
            bill_rate: billRate,
            status,
            created_at: entryDate,
          });
        }
      }
    }
  }

  console.log(`  Inserting ${timesheets.length} timesheet entries in batches...`);
  
  for (let i = 0; i < timesheets.length; i += 1000) {
    await supabase.from('agency.timesheet_entries').insert(timesheets.slice(i, i + 1000));
    if (i % 5000 === 0) {
      console.log(`  Progress: ${i}/${timesheets.length} timesheets inserted...`);
    }
  }

  console.log(`✅ Created ${timesheets.length} timesheet entries`);
  return timesheets;
}

async function seedKnowledgeBase(tenants: any[]) {
  console.log('🧠 Seeding knowledge base...');
  
  const knowledgeDocs: any[] = [];

  const sampleDocs = [
    { title: 'Creative Brief Template', category: 'creative', content: 'A creative brief should include...' },
    { title: 'Brand Strategy Framework', category: 'strategy', content: 'Brand strategy starts with...' },
    { title: 'TV Commercial Production Guide', category: 'production', content: 'TV production involves...' },
    { title: 'Social Media Best Practices', category: 'best_practices', content: 'Effective social media...' },
    { title: 'Award-Winning Campaigns Case Study', category: 'case_study', content: 'This campaign won...' },
    { title: 'Copywriting Guidelines', category: 'creative', content: 'Great copy should...' },
    { title: 'Art Direction Principles', category: 'creative', content: 'Art direction is...' },
    { title: 'Client Presentation Tips', category: 'best_practices', content: 'When presenting to clients...' },
    { title: 'Motion Graphics Standards', category: 'production', content: 'Motion graphics at TBWA...' },
    { title: 'Campaign Launch Checklist', category: 'best_practices', content: 'Before launching...' },
  ];

  for (const tenant of tenants) {
    for (let i = 0; i < SEED_CONFIG.knowledgeDocsPerTenant; i++) {
      const sample = randomElement(sampleDocs);
      const createdDate = randomDate(new Date('2023-01-01'), new Date());
      
      knowledgeDocs.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        source_type: randomElement(['internal', 'template', 'case_study', 'guide']),
        title: `${sample.title} ${i > 9 ? `(${Math.floor(i / 10)})` : ''}`,
        content: `${sample.content}\n\n${faker.lorem.paragraphs(8)}`,
        category: sample.category,
        tags: [sample.category, randomElement(['beginner', 'intermediate', 'advanced'])],
        visibility: randomElement(['all_staff', 'creative_only', 'management_only']),
        created_at: createdDate,
      });
    }
  }

  for (let i = 0; i < knowledgeDocs.length; i += 100) {
    await supabase.from('agency.knowledge_documents').insert(knowledgeDocs.slice(i, i + 100));
  }

  console.log(`✅ Created ${knowledgeDocs.length} knowledge documents`);
  return knowledgeDocs;
}

// =====================================================================
// Main Seed Function
// =====================================================================

async function main() {
  console.log('🌱 Starting Agency Workroom seed script...\n');
  console.log('Configuration:');
  console.log(`  - Tenants: ${SEED_CONFIG.tenants}`);
  console.log(`  - Users per tenant: ${SEED_CONFIG.usersPerTenant}`);
  console.log(`  - Clients per tenant: ${SEED_CONFIG.clientsPerTenant}`);
  console.log(`  - Campaigns per tenant: ${SEED_CONFIG.campaignsPerTenant}`);
  console.log(`  - Timesheet months: ${SEED_CONFIG.timesheetMonths}\n`);

  try {
    const tenants = await seedTenants();
    const users = await seedUsers(tenants);
    const { clients, brands } = await seedClientsAndBrands(tenants);
    const { campaigns } = await seedCampaigns(tenants, users, clients, brands);
    await seedArtifacts(campaigns, users);
    await seedTimesheets(campaigns, users);
    await seedKnowledgeBase(tenants);

    console.log('\n🎉 Seed script completed successfully!');
    console.log('\nSummary:');
    console.log(`  - ${tenants.length} tenants`);
    console.log(`  - ${users.length} users`);
    console.log(`  - ${clients.length} clients`);
    console.log(`  - ${brands.length} brands`);
    console.log(`  - ${campaigns.length} campaigns`);
    console.log('\n✅ Database is ready for testing!');

  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

// Run
main();
