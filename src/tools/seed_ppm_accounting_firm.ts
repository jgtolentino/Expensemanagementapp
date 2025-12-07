/**
 * Finance PPM - Accounting Firm Portal - Seed Script
 * Phase 4: Generate realistic demo data for Finance PPM
 * 
 * Generates:
 * - 3 tenants (TBWA agencies)
 * - 50+ users across 6 roles
 * - 200+ leads and opportunities
 * - 100+ engagements
 * - 200+ projects
 * - 2,000+ tasks
 * - 50,000+ timesheet entries
 * - 400+ invoices
 * - 600+ payments
 * - 200+ documents
 * - 100+ knowledge documents
 * - 5,000+ knowledge chunks
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
  usersPerTenant: 18,
  leadsPerTenant: 70,
  opportunitiesPerTenant: 50,
  engagementsPerTenant: 35,
  projectsPerEngagement: 2.5,
  tasksPerProject: 10,
  timesheetMonths: 18,
  invoicesPerProject: 3,
  paymentsPerInvoice: 2,
  documentsPerEngagement: 6,
  knowledgeDocuments: 100,
  chunksPerDocument: 50,
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

function monthStart(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

// =====================================================================
// Master Data
// =====================================================================

const ROLES = ['partner', 'finance_director', 'account_manager', 'project_manager', 'staff_accountant', 'consultant'];

const SERVICE_LINES = ['Creative', 'Digital', 'Strategy', 'Media', 'Social', 'Production'];

const PORTFOLIOS = ['Consumer Tech', 'Healthcare', 'Finance', 'Retail', 'Automotive', 'FMCG'];

const LEAD_SOURCES = ['website', 'referral', 'event', 'cold_call', 'inbound', 'partner'];

const OPPORTUNITY_STAGES = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

const ENGAGEMENT_TYPES = ['project', 'retainer', 'time_materials', 'milestone'];

const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'];

const DOCUMENT_TYPES = ['contract', 'sow', 'po', 'report', 'deliverable', 'other'];

const KNOWLEDGE_CATEGORIES = ['finance', 'legal', 'hr', 'sales', 'operations', 'creative'];

const PHILIPPINES_CLIENTS = [
  'SM Investments', 'Ayala Corporation', 'Jollibee Foods', 'Globe Telecom', 'PLDT Inc',
  'BDO Unibank', 'Bank of the Philippine Islands', 'Petron Corporation', 'San Miguel Corporation',
  'Meralco', 'Puregold', 'Robinsons Retail', 'Aboitiz Equity', 'GT Capital Holdings',
  'Metro Pacific Investments', 'Universal Robina', 'Cebu Pacific Air', 'Philippine Airlines',
  'Emperador Inc', 'Century Pacific Food', 'Monde Nissin', 'Nestle Philippines', 
  'Unilever Philippines', 'Procter & Gamble Philippines', 'Coca-Cola Philippines',
];

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
    // Partner (1)
    users.push({
      id: faker.string.uuid(),
      tenant_id: tenant.id,
      email: `partner@${tenant.slug}.com`,
      name: faker.person.fullName(),
      role: 'partner',
      created_at: new Date('2020-01-15'),
    });

    // Finance Director (1)
    users.push({
      id: faker.string.uuid(),
      tenant_id: tenant.id,
      email: `finance@${tenant.slug}.com`,
      name: faker.person.fullName(),
      role: 'finance_director',
      created_at: new Date('2020-01-15'),
    });

    // Account Managers (4)
    for (let i = 0; i < 4; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `am${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'account_manager',
        created_at: randomDate(new Date('2020-02-01'), new Date('2023-01-01')),
      });
    }

    // Project Managers (4)
    for (let i = 0; i < 4; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `pm${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'project_manager',
        created_at: randomDate(new Date('2020-02-01'), new Date('2023-01-01')),
      });
    }

    // Staff Accountants (2)
    for (let i = 0; i < 2; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `accountant${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'staff_accountant',
        created_at: randomDate(new Date('2020-03-01'), new Date('2022-01-01')),
      });
    }

    // Consultants (6)
    for (let i = 0; i < 6; i++) {
      users.push({
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        email: `consultant${i + 1}@${tenant.slug}.com`,
        name: faker.person.fullName(),
        role: 'consultant',
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

async function seedCRM(tenants: any[], users: any[]) {
  console.log('📊 Seeding CRM data...');
  
  const leads: any[] = [];
  const opportunities: any[] = [];
  const activities: any[] = [];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(u => u.tenant_id === tenant.id);
    const accountManagers = tenantUsers.filter(u => u.role === 'account_manager');

    // Leads
    for (let i = 0; i < SEED_CONFIG.leadsPerTenant; i++) {
      const createdDate = randomDate(new Date('2023-01-01'), new Date('2025-11-01'));
      const status = randomElement(['new', 'contacted', 'qualified', 'disqualified', 'converted']);
      
      const lead = {
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        lead_name: `${randomElement(PHILIPPINES_CLIENTS)} - ${randomElement(SERVICE_LINES)} Inquiry`,
        company_name: randomElement(PHILIPPINES_CLIENTS),
        contact_name: faker.person.fullName(),
        contact_email: faker.internet.email(),
        contact_phone: faker.phone.number('+63 ### ### ####'),
        source: randomElement(LEAD_SOURCES),
        status,
        priority: randomElement(['low', 'medium', 'high']),
        owner_id: randomElement(accountManagers).id,
        created_at: createdDate,
      };
      
      leads.push(lead);

      // Convert some leads to opportunities
      if (status === 'converted' && Math.random() > 0.3) {
        const oppCreatedDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const stage = randomElement(OPPORTUNITY_STAGES);
        const probability = stage === 'won' ? 100 : stage === 'lost' ? 0 : randomInt(20, 80);
        
        const opportunity = {
          id: faker.string.uuid(),
          tenant_id: tenant.id,
          lead_id: lead.id,
          opportunity_name: `${lead.company_name} - ${randomElement(SERVICE_LINES)} Campaign`,
          client_name: lead.company_name,
          contact_name: lead.contact_name,
          contact_email: lead.contact_email,
          expected_value: randomInt(500000, 10000000),
          currency: 'PHP',
          probability,
          stage,
          status: stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'active',
          service_line: randomElement(SERVICE_LINES),
          portfolio: randomElement(PORTFOLIOS),
          owner_id: lead.owner_id,
          expected_close_date: randomDate(oppCreatedDate, new Date('2025-12-31')),
          created_at: oppCreatedDate,
        };
        
        opportunities.push(opportunity);
        lead.converted_to_opportunity_id = opportunity.id;

        // Add activities
        const activityCount = randomInt(2, 8);
        for (let j = 0; j < activityCount; j++) {
          activities.push({
            id: faker.string.uuid(),
            tenant_id: tenant.id,
            opportunity_id: opportunity.id,
            activity_type: randomElement(['call', 'meeting', 'email', 'task']),
            subject: faker.lorem.sentence(),
            due_date: randomDate(oppCreatedDate, new Date()),
            status: Math.random() > 0.3 ? 'done' : 'planned',
            assigned_to: randomElement(accountManagers).id,
            created_by: opportunity.owner_id,
            created_at: randomDate(oppCreatedDate, new Date()),
          });
        }
      }
    }
  }

  // Insert in batches
  for (let i = 0; i < leads.length; i += 100) {
    await supabase.from('crm.leads').insert(leads.slice(i, i + 100));
  }
  
  for (let i = 0; i < opportunities.length; i += 100) {
    await supabase.from('crm.opportunities').insert(opportunities.slice(i, i + 100));
  }
  
  for (let i = 0; i < activities.length; i += 100) {
    await supabase.from('crm.activities').insert(activities.slice(i, i + 100));
  }

  console.log(`✅ Created ${leads.length} leads, ${opportunities.length} opportunities, ${activities.length} activities`);
  return { leads, opportunities, activities };
}

async function seedEngagementsAndProjects(tenants: any[], users: any[], opportunities: any[]) {
  console.log('📁 Seeding engagements and projects...');
  
  const engagements: any[] = [];
  const projects: any[] = [];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(u => u.tenant_id === tenant.id);
    const accountManagers = tenantUsers.filter(u => u.role === 'account_manager');
    const projectManagers = tenantUsers.filter(u => u.role === 'project_manager');
    const partner = tenantUsers.find(u => u.role === 'partner');

    const wonOpps = opportunities.filter(o => o.tenant_id === tenant.id && o.status === 'won');

    for (let i = 0; i < SEED_CONFIG.engagementsPerTenant; i++) {
      const clientName = randomElement(PHILIPPINES_CLIENTS);
      const serviceLine = randomElement(SERVICE_LINES);
      const startDate = randomDate(new Date('2023-01-01'), new Date('2025-06-01'));
      const endDate = randomDate(startDate, new Date('2026-12-31'));
      
      const engagement = {
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        crm_opportunity_id: wonOpps[i] ? wonOpps[i].id : null,
        engagement_code: `ENG-${tenant.slug.toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        engagement_name: `${clientName} - ${serviceLine}`,
        client_name: clientName,
        engagement_type: randomElement(ENGAGEMENT_TYPES),
        service_line: serviceLine,
        portfolio: randomElement(PORTFOLIOS),
        region: 'PH',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        contract_value: randomInt(1000000, 25000000),
        currency: 'PHP',
        status: randomElement(['active', 'active', 'active', 'closed']),
        owner_id: randomElement(accountManagers).id,
        partner_id: partner.id,
        created_at: startDate,
      };
      
      engagements.push(engagement);

      // Create projects under engagement
      const projectCount = Math.ceil(SEED_CONFIG.projectsPerEngagement);
      for (let j = 0; j < projectCount; j++) {
        const projectStartDate = randomDate(new Date(engagement.start_date), endDate);
        const projectEndDate = randomDate(projectStartDate, endDate);
        
        projects.push({
          id: faker.string.uuid(),
          tenant_id: tenant.id,
          engagement_id: engagement.id,
          project_code: `${engagement.engagement_code}-P${j + 1}`,
          project_name: `${engagement.engagement_name} - Phase ${j + 1}`,
          start_date: projectStartDate.toISOString().split('T')[0],
          end_date: projectEndDate.toISOString().split('T')[0],
          billing_type: engagement.engagement_type === 'retainer' ? 'retainer' : randomElement(['fixed_fee', 'time_materials', 'milestone']),
          service_line: engagement.service_line,
          status: engagement.status === 'closed' ? 'closed' : randomElement(['active', 'active', 'planned']),
          owner_id: randomElement(projectManagers).id,
          created_at: projectStartDate,
        });
      }
    }
  }

  // Insert
  for (let i = 0; i < engagements.length; i += 100) {
    await supabase.from('finance_ppm.engagements').insert(engagements.slice(i, i + 100));
  }
  
  for (let i = 0; i < projects.length; i += 100) {
    await supabase.from('finance_ppm.projects').insert(projects.slice(i, i + 100));
  }

  console.log(`✅ Created ${engagements.length} engagements, ${projects.length} projects`);
  return { engagements, projects };
}

async function seedTasks(projects: any[], users: any[]) {
  console.log('✅ Seeding tasks...');
  
  const tasks: any[] = [];

  for (const project of projects) {
    const tenantUsers = users.filter(u => u.tenant_id === project.tenant_id);
    const consultants = tenantUsers.filter(u => u.role === 'consultant');
    const projectManager = tenantUsers.find(u => u.id === project.owner_id);

    const taskCount = randomInt(5, SEED_CONFIG.tasksPerProject);
    
    for (let i = 0; i < taskCount; i++) {
      const startDate = randomDate(new Date(project.start_date), new Date(project.end_date));
      const dueDate = randomDate(startDate, new Date(project.end_date));
      const status = randomElement(TASK_STATUSES);
      const estimatedHours = randomInt(4, 80);
      const actualHours = status === 'done' ? estimatedHours * (0.8 + Math.random() * 0.4) : 0;
      
      tasks.push({
        id: faker.string.uuid(),
        tenant_id: project.tenant_id,
        project_id: project.id,
        task_name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        start_date: startDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        estimated_hours: estimatedHours,
        actual_hours: actualHours,
        status,
        priority: randomElement(['low', 'medium', 'high', 'urgent']),
        assigned_to: Math.random() > 0.2 ? randomElement(consultants).id : null,
        created_at: startDate,
        completed_at: status === 'done' ? randomDate(startDate, dueDate) : null,
      });
    }
  }

  // Insert in batches
  for (let i = 0; i < tasks.length; i += 500) {
    await supabase.from('finance_ppm.tasks').insert(tasks.slice(i, i + 500));
  }

  console.log(`✅ Created ${tasks.length} tasks`);
  return tasks;
}

async function seedTimesheets(projects: any[], tasks: any[], users: any[]) {
  console.log('⏱️  Seeding timesheets (this may take a while)...');
  
  const timesheets: any[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - SEED_CONFIG.timesheetMonths);

  for (const project of projects) {
    const tenantUsers = users.filter(u => u.tenant_id === project.tenant_id);
    const consultants = tenantUsers.filter(u => u.role === 'consultant');
    const projectTasks = tasks.filter(t => t.project_id === project.id);

    // Generate timesheets for project duration
    const projectStart = new Date(project.start_date);
    const projectEnd = new Date(project.end_date);
    const weeksInProject = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    for (let week = 0; week < Math.min(weeksInProject, 100); week++) {
      const weekDate = new Date(projectStart.getTime() + week * 7 * 24 * 60 * 60 * 1000);
      
      // Each consultant works 2-5 days per week on this project
      const activeConsultants = consultants.slice(0, randomInt(1, 3));
      
      for (const consultant of activeConsultants) {
        const daysWorked = randomInt(2, 5);
        
        for (let day = 0; day < daysWorked; day++) {
          const entryDate = new Date(weekDate.getTime() + day * 24 * 60 * 60 * 1000);
          
          if (entryDate > new Date()) break; // Don't create future timesheets
          
          const task = randomElement(projectTasks);
          const hours = randomInt(4, 10) * 0.5; // 4-10 hours in 0.5 increments
          const billable = Math.random() > 0.15; // 85% billable
          const billRate = randomInt(1500, 4000); // PHP 1500-4000/hr
          const costRate = billRate * 0.6; // 60% of bill rate
          
          const status = entryDate < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) 
            ? 'approved' 
            : randomElement(['draft', 'submitted', 'approved']);

          timesheets.push({
            id: faker.string.uuid(),
            tenant_id: project.tenant_id,
            employee_id: consultant.id,
            project_id: project.id,
            task_id: task ? task.id : null,
            entry_date: entryDate.toISOString().split('T')[0],
            week_start_date: getMonday(entryDate).toISOString().split('T')[0],
            hours,
            billable,
            cost_rate: costRate,
            bill_rate: billRate,
            status,
            approved_by: status === 'approved' ? users.find(u => u.tenant_id === project.tenant_id && u.role === 'partner')?.id : null,
            approved_at: status === 'approved' ? randomDate(entryDate, new Date()) : null,
            created_at: entryDate,
          });
        }
      }
    }
  }

  console.log(`  Inserting ${timesheets.length} timesheet entries in batches...`);
  
  // Insert in batches of 1000
  for (let i = 0; i < timesheets.length; i += 1000) {
    await supabase.from('finance_ppm.timesheet_entries').insert(timesheets.slice(i, i + 1000));
    if (i % 5000 === 0) {
      console.log(`  Progress: ${i}/${timesheets.length} timesheets inserted...`);
    }
  }

  console.log(`✅ Created ${timesheets.length} timesheet entries`);
  return timesheets;
}

async function seedInvoicesAndPayments(projects: any[], engagements: any[], users: any[]) {
  console.log('💰 Seeding invoices and payments...');
  
  const invoices: any[] = [];
  const invoiceLines: any[] = [];
  const payments: any[] = [];

  for (const project of projects) {
    const engagement = engagements.find(e => e.id === project.engagement_id);
    if (!engagement) continue;

    const invoiceCount = randomInt(1, SEED_CONFIG.invoicesPerProject);
    
    for (let i = 0; i < invoiceCount; i++) {
      const invoiceDate = randomDate(new Date(project.start_date), new Date());
      const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const subtotal = randomInt(200000, 3000000);
      const taxRate = 12.00; // VAT
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;
      
      const status = invoiceDate < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        ? randomElement(['paid', 'paid', 'partial', 'overdue'])
        : randomElement(['sent', 'partial']);
      
      const paidAmount = status === 'paid' ? totalAmount : status === 'partial' ? totalAmount * 0.5 : 0;
      
      const invoice = {
        id: faker.string.uuid(),
        tenant_id: project.tenant_id,
        invoice_number: `INV-${String(invoices.length + 1).padStart(6, '0')}`,
        invoice_date: invoiceDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        project_id: project.id,
        engagement_id: engagement.id,
        client_name: engagement.client_name,
        bill_to_name: engagement.client_name,
        bill_to_address: faker.location.streetAddress(),
        bill_to_tin: faker.string.numeric(12),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'PHP',
        paid_amount: paidAmount,
        status,
        sent_at: invoiceDate,
        paid_at: status === 'paid' ? randomDate(invoiceDate, new Date()) : null,
        created_by: users.find(u => u.tenant_id === project.tenant_id && u.role === 'staff_accountant')?.id,
        created_at: invoiceDate,
      };
      
      invoices.push(invoice);

      // Invoice lines
      const lineCount = randomInt(3, 8);
      for (let j = 0; j < lineCount; j++) {
        const quantity = randomInt(10, 200);
        const unitPrice = randomInt(500, 5000);
        const lineTotal = quantity * unitPrice;
        
        invoiceLines.push({
          id: faker.string.uuid(),
          tenant_id: project.tenant_id,
          invoice_id: invoice.id,
          line_number: j + 1,
          description: `${randomElement(SERVICE_LINES)} Services - ${faker.lorem.words(3)}`,
          quantity,
          unit_of_measure: 'hours',
          unit_price: unitPrice,
          line_total: lineTotal,
          source_type: randomElement(['timesheet', 'fee']),
          created_at: invoiceDate,
        });
      }

      // Payments
      if (paidAmount > 0) {
        const paymentCount = status === 'paid' && Math.random() > 0.7 ? 2 : 1;
        const amountPerPayment = paidAmount / paymentCount;
        
        for (let k = 0; k < paymentCount; k++) {
          const paymentDate = randomDate(invoiceDate, new Date());
          const withholdingTaxRate = randomElement([0, 1, 2, 5, 10]);
          const withholdingTaxAmount = amountPerPayment * (withholdingTaxRate / 100);
          
          payments.push({
            id: faker.string.uuid(),
            tenant_id: project.tenant_id,
            invoice_id: invoice.id,
            payment_date: paymentDate.toISOString().split('T')[0],
            amount: amountPerPayment,
            currency: 'PHP',
            payment_method: randomElement(['bank_transfer', 'check', 'cash']),
            reference_number: faker.string.alphanumeric(10).toUpperCase(),
            withholding_tax_rate: withholdingTaxRate,
            withholding_tax_amount: withholdingTaxAmount,
            bir_2307_issued: withholdingTaxRate > 0,
            bir_2307_date: withholdingTaxRate > 0 ? paymentDate.toISOString().split('T')[0] : null,
            bir_2307_number: withholdingTaxRate > 0 ? faker.string.alphanumeric(12).toUpperCase() : null,
            recorded_by: users.find(u => u.tenant_id === project.tenant_id && u.role === 'staff_accountant')?.id,
            created_at: paymentDate,
          });
        }
      }
    }
  }

  // Insert
  for (let i = 0; i < invoices.length; i += 100) {
    await supabase.from('finance_ppm.invoices').insert(invoices.slice(i, i + 100));
  }
  
  for (let i = 0; i < invoiceLines.length; i += 500) {
    await supabase.from('finance_ppm.invoice_lines').insert(invoiceLines.slice(i, i + 500));
  }
  
  for (let i = 0; i < payments.length; i += 100) {
    await supabase.from('finance_ppm.payments').insert(payments.slice(i, i + 100));
  }

  console.log(`✅ Created ${invoices.length} invoices, ${invoiceLines.length} invoice lines, ${payments.length} payments`);
  return { invoices, invoiceLines, payments };
}

async function seedDocuments(engagements: any[], users: any[]) {
  console.log('📄 Seeding documents...');
  
  const documents: any[] = [];

  for (const engagement of engagements) {
    const docCount = randomInt(3, SEED_CONFIG.documentsPerEngagement);
    
    for (let i = 0; i < docCount; i++) {
      const docType = randomElement(DOCUMENT_TYPES);
      const uploadDate = randomDate(new Date(engagement.start_date), new Date());
      
      documents.push({
        id: faker.string.uuid(),
        tenant_id: engagement.tenant_id,
        engagement_id: engagement.id,
        filename: `${docType}_${engagement.engagement_code}_v1.pdf`,
        document_type: docType,
        title: `${engagement.client_name} - ${docType.toUpperCase()}`,
        file_size: randomInt(100000, 5000000),
        mime_type: 'application/pdf',
        storage_url: `documents/${engagement.id}/${faker.string.uuid()}.pdf`,
        status: randomElement(['draft', 'final', 'signed']),
        signature_status: docType === 'contract' ? randomElement(['signed', 'pending']) : 'not_required',
        signed_date: docType === 'contract' && Math.random() > 0.5 ? uploadDate.toISOString().split('T')[0] : null,
        version_number: 1,
        is_current: true,
        uploaded_by: users.find(u => u.tenant_id === engagement.tenant_id && u.role === 'account_manager')?.id,
        uploaded_at: uploadDate,
        created_at: uploadDate,
      });
    }
  }

  for (let i = 0; i < documents.length; i += 100) {
    await supabase.from('finance_ppm.documents').insert(documents.slice(i, i + 100));
  }

  console.log(`✅ Created ${documents.length} documents`);
  return documents;
}

async function seedKnowledgeBase(tenants: any[]) {
  console.log('🧠 Seeding knowledge base...');
  
  const knowledgeDocs: any[] = [];
  const knowledgeChunks: any[] = [];

  const sampleDocs = [
    { title: 'Month-End Close Procedures', category: 'finance', content: 'Month-end close is a critical process... (detailed SOP)' },
    { title: 'WIP Calculation Guide', category: 'finance', content: 'Work in Progress (WIP) represents unbilled work... (detailed guide)' },
    { title: 'BIR 2307 Filing Instructions', category: 'finance', content: 'Certificate of Creditable Tax Withheld at Source... (PH tax guide)' },
    { title: 'Client Onboarding Checklist', category: 'sales', content: 'New client onboarding requires... (checklist)' },
    { title: 'SOW Template Guidelines', category: 'legal', content: 'Statement of Work templates must include... (guidelines)' },
    { title: 'Timesheet Entry Best Practices', category: 'operations', content: 'Accurate timesheet entry is essential... (best practices)' },
    { title: 'Invoice Generation Workflow', category: 'finance', content: 'Invoices are generated from approved WIP... (workflow)' },
    { title: 'Collections Process', category: 'finance', content: 'Overdue invoices follow a structured collections process... (process)' },
    { title: 'Project Profitability Analysis', category: 'finance', content: 'Analyzing project profitability requires... (analysis guide)' },
    { title: 'Rate Card Management', category: 'finance', content: 'Employee billing rates are maintained in... (rate card guide)' },
  ];

  for (const tenant of tenants) {
    for (let i = 0; i < SEED_CONFIG.knowledgeDocuments; i++) {
      const sample = randomElement(sampleDocs);
      const createdDate = randomDate(new Date('2023-01-01'), new Date());
      
      const doc = {
        id: faker.string.uuid(),
        tenant_id: tenant.id,
        source_type: randomElement(['local', 'policy', 'sop', 'faq']),
        source_id: faker.string.uuid(),
        title: `${sample.title} ${i > 9 ? `(${Math.floor(i / 10)})` : ''}`,
        content: `${sample.content}\n\n${faker.lorem.paragraphs(10)}`,
        category: sample.category,
        tags: [sample.category, randomElement(SERVICE_LINES), randomElement(['beginner', 'intermediate', 'advanced'])],
        visibility: randomElement(['internal', 'finance_only', 'partner_only']),
        last_synced_at: createdDate,
        sync_status: 'active',
        created_at: createdDate,
      };
      
      knowledgeDocs.push(doc);

      // Create chunks (simplified - in production, use actual embedding)
      const chunkCount = randomInt(20, SEED_CONFIG.chunksPerDocument);
      for (let j = 0; j < chunkCount; j++) {
        knowledgeChunks.push({
          id: faker.string.uuid(),
          tenant_id: tenant.id,
          document_id: doc.id,
          chunk_text: faker.lorem.paragraph(),
          chunk_index: j,
          // embedding: Array(1536).fill(0).map(() => Math.random()), // Placeholder - would use OpenAI in production
          metadata: {
            category: doc.category,
            role_access: doc.visibility === 'partner_only' ? ['partner'] : ['partner', 'finance_director'],
          },
          created_at: createdDate,
        });
      }
    }
  }

  console.log(`  Inserting ${knowledgeDocs.length} knowledge documents...`);
  for (let i = 0; i < knowledgeDocs.length; i += 100) {
    await supabase.from('finance_ppm.knowledge_documents').insert(knowledgeDocs.slice(i, i + 100));
  }

  console.log(`  Inserting ${knowledgeChunks.length} knowledge chunks...`);
  // Note: Skip embedding insertion for now (requires pgvector setup)
  // In production, you'd generate real embeddings using OpenAI API

  console.log(`✅ Created ${knowledgeDocs.length} knowledge documents, ${knowledgeChunks.length} chunks (embeddings skipped)`);
  return { knowledgeDocs, knowledgeChunks };
}

// =====================================================================
// Main Seed Function
// =====================================================================

async function main() {
  console.log('🌱 Starting Finance PPM seed script...\n');
  console.log('Configuration:');
  console.log(`  - Tenants: ${SEED_CONFIG.tenants}`);
  console.log(`  - Users per tenant: ${SEED_CONFIG.usersPerTenant}`);
  console.log(`  - Leads per tenant: ${SEED_CONFIG.leadsPerTenant}`);
  console.log(`  - Engagements per tenant: ${SEED_CONFIG.engagementsPerTenant}`);
  console.log(`  - Timesheet months: ${SEED_CONFIG.timesheetMonths}`);
  console.log(`  - Knowledge documents: ${SEED_CONFIG.knowledgeDocuments}\n`);

  try {
    // Seed in order
    const tenants = await seedTenants();
    const users = await seedUsers(tenants);
    const { opportunities } = await seedCRM(tenants, users);
    const { engagements, projects } = await seedEngagementsAndProjects(tenants, users, opportunities);
    const tasks = await seedTasks(projects, users);
    const timesheets = await seedTimesheets(projects, tasks, users);
    await seedInvoicesAndPayments(projects, engagements, users);
    await seedDocuments(engagements, users);
    await seedKnowledgeBase(tenants);

    console.log('\n🎉 Seed script completed successfully!');
    console.log('\nSummary:');
    console.log(`  - ${tenants.length} tenants`);
    console.log(`  - ${users.length} users`);
    console.log(`  - ${opportunities.length} opportunities`);
    console.log(`  - ${engagements.length} engagements`);
    console.log(`  - ${projects.length} projects`);
    console.log(`  - ${tasks.length} tasks`);
    console.log(`  - ${timesheets.length} timesheet entries`);
    console.log('\n✅ Database is ready for testing!');

  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

// Run
main();
