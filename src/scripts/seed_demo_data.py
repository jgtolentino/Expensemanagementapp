#!/usr/bin/env python3
"""
Seed demo data for TBWA Agency Databank
Creates realistic demo data for all 8 applications
"""

import argparse
import os
import sys
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List

import psycopg2
from psycopg2.extras import execute_values

# Demo user accounts (from user journey docs)
DEMO_USERS = [
    {
        "email": "admin@tbwa.com",
        "name": "Admin User",
        "role": "admin",
        "password_hash": "$2b$12$demo_hash_admin",
    },
    {
        "email": "manager@tbwa.com",
        "name": "Manager User",
        "role": "manager",
        "password_hash": "$2b$12$demo_hash_manager",
    },
    {
        "email": "employee@tbwa.com",
        "name": "Employee User",
        "role": "employee",
        "password_hash": "$2b$12$demo_hash_employee",
    },
    {
        "email": "finance@tbwa.com",
        "name": "Finance User",
        "role": "finance",
        "password_hash": "$2b$12$demo_hash_finance",
    },
]


class DemoDataSeeder:
    """Seed demo data for all applications"""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None
        self.company_id = None
        self.workspace_id = None
        self.user_ids: Dict[str, str] = {}
        self.client_ids: List[str] = []
        self.project_ids: List[str] = []

    def connect(self):
        """Connect to database"""
        print("🔌 Connecting to database...")
        self.conn = psycopg2.connect(self.db_url)
        self.conn.autocommit = False
        print("✅ Connected")

    def close(self):
        """Close connection"""
        if self.conn:
            self.conn.close()

    def seed_company(self):
        """Seed company (tenant)"""
        print("\n🏢 Seeding company...")
        cursor = self.conn.cursor()

        self.company_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO res_company (
                id, name, legal_name, tax_id, currency, email, phone,
                street, city, country, active, create_date
            ) VALUES (
                %s, 'TBWA Philippines', 'TBWA\\Santiago Mangada Puno Inc.',
                'TIN-123-456-789', 'PHP', 'info@tbwa.com.ph', '+63 2 8888 8888',
                'Bonifacio Global City', 'Taguig', 'PH', TRUE, NOW()
            )
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            """,
            (self.company_id,),
        )

        result = cursor.fetchone()
        if result:
            self.company_id = result[0]

        self.workspace_id = str(uuid.uuid4())
        cursor.close()
        self.conn.commit()
        print(f"   ✅ Company created: {self.company_id}")

    def seed_users(self):
        """Seed demo users"""
        print("\n👥 Seeding users...")
        cursor = self.conn.cursor()

        for user_data in DEMO_USERS:
            user_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO res_users (
                    id, name, email, role, company_id, active, is_admin,
                    password_hash, create_date
                ) VALUES (
                    %s, %s, %s, %s, %s, TRUE, %s, %s, NOW()
                )
                ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
                """,
                (
                    user_id,
                    user_data["name"],
                    user_data["email"],
                    user_data["role"],
                    self.company_id,
                    user_data["role"] == "admin",
                    user_data["password_hash"],
                ),
            )

            result = cursor.fetchone()
            if result:
                self.user_ids[user_data["role"]] = result[0]
                print(f"   ✅ User created: {user_data['email']} ({user_data['role']})")

        cursor.close()
        self.conn.commit()

    def seed_clients(self):
        """Seed client companies"""
        print("\n🤝 Seeding clients...")
        cursor = self.conn.cursor()

        clients = [
            ("Jollibee Foods Corporation", "Fast Food", "TIN-111-222-333"),
            ("Ayala Land Inc.", "Real Estate", "TIN-444-555-666"),
            ("San Miguel Corporation", "Conglomerate", "TIN-777-888-999"),
        ]

        for name, industry, tin in clients:
            client_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO res_partner (
                    id, name, partner_type, is_company, industry, tax_id,
                    company_id, active, create_date, create_uid
                ) VALUES (
                    %s, %s, 'client', TRUE, %s, %s, %s, TRUE, NOW(), %s
                )
                RETURNING id
                """,
                (client_id, name, industry, tin, self.company_id, self.user_ids["admin"]),
            )

            result = cursor.fetchone()
            if result:
                self.client_ids.append(result[0])
                print(f"   ✅ Client created: {name}")

        cursor.close()
        self.conn.commit()

    def seed_projects(self):
        """Seed PPM projects"""
        print("\n📊 Seeding PPM projects...")
        cursor = self.conn.cursor()

        projects = [
            ("Jollibee National Campaign 2024", "JBC-2024-001", self.client_ids[0]),
            ("Ayala Land Property Launch", "AYL-2024-002", self.client_ids[1]),
            ("San Miguel New Product Launch", "SMC-2024-003", self.client_ids[2]),
        ]

        for name, code, client_id in projects:
            project_id = str(uuid.uuid4())
            start_date = datetime.now()
            end_date = start_date + timedelta(days=90)

            cursor.execute(
                """
                INSERT INTO project_project (
                    id, name, code, state, start_date, end_date,
                    project_manager_id, client_id, budget, currency,
                    company_id, active, create_date, create_uid
                ) VALUES (
                    %s, %s, %s, 'in_progress', %s, %s,
                    %s, %s, 5000000.00, 'PHP',
                    %s, TRUE, NOW(), %s
                )
                RETURNING id
                """,
                (
                    project_id,
                    name,
                    code,
                    start_date,
                    end_date,
                    self.user_ids["manager"],
                    client_id,
                    self.company_id,
                    self.user_ids["admin"],
                ),
            )

            result = cursor.fetchone()
            if result:
                self.project_ids.append(result[0])
                print(f"   ✅ Project created: {name}")

        cursor.close()
        self.conn.commit()

    def seed_tasks(self):
        """Seed PPM tasks"""
        print("\n📋 Seeding tasks...")
        cursor = self.conn.cursor()

        for i, project_id in enumerate(self.project_ids):
            tasks = [
                (f"Creative Concept Development", "1", "phase"),
                (f"Client Presentation", "1.1", "task"),
                (f"Campaign Execution", "2", "phase"),
                (f"Media Planning", "2.1", "task"),
                (f"Production", "2.2", "task"),
            ]

            for task_name, wbs_code, task_type in tasks:
                task_id = str(uuid.uuid4())
                start_date = datetime.now() + timedelta(days=i * 30)
                duration = 14 if task_type == "task" else 30

                cursor.execute(
                    """
                    INSERT INTO project_task (
                        id, name, project_id, wbs_code, task_type, state,
                        start_date, duration, estimated_hours,
                        owner_id, company_id, active, create_date, create_uid
                    ) VALUES (
                        %s, %s, %s, %s, %s, 'in_progress',
                        %s, %s, 80.0,
                        %s, %s, TRUE, NOW(), %s
                    )
                    """,
                    (
                        task_id,
                        task_name,
                        project_id,
                        wbs_code,
                        task_type,
                        start_date,
                        duration,
                        self.user_ids["employee"],
                        self.company_id,
                        self.user_ids["manager"],
                    ),
                )

        cursor.close()
        self.conn.commit()
        print("   ✅ Tasks created")

    def seed_expenses(self):
        """Seed expense reports"""
        print("\n💰 Seeding expense reports...")
        cursor = self.conn.cursor()

        # Create expense report
        expense_report_id = str(uuid.uuid4())
        period_start = datetime.now() - timedelta(days=7)
        period_end = datetime.now()

        cursor.execute(
            """
            INSERT INTO hr_expense_sheet (
                id, name, code, purpose, period_start, period_end,
                state, employee_id, total_amount, currency,
                company_id, active, create_date, create_uid
            ) VALUES (
                %s, 'Client Meeting Expenses', 'EXP-2024-001',
                'Client presentation and lunch meeting', %s, %s,
                'draft', %s, 15000.00, 'PHP',
                %s, TRUE, NOW(), %s
            )
            """,
            (
                expense_report_id,
                period_start,
                period_end,
                self.user_ids["employee"],
                self.company_id,
                self.user_ids["employee"],
            ),
        )

        # Create expense lines
        expenses = [
            ("Transportation - Grab", "transportation", 500.00, period_start),
            ("Client Lunch", "meals", 3500.00, period_start + timedelta(hours=3)),
            ("Parking Fee", "parking", 150.00, period_start + timedelta(hours=4)),
        ]

        for name, category, amount, date in expenses:
            expense_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO hr_expense (
                    id, name, expense_report_id, date, category,
                    merchant, amount, currency, state, employee_id,
                    company_id, active, create_date, create_uid
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    'Various', %s, 'PHP', 'draft', %s,
                    %s, TRUE, NOW(), %s
                )
                """,
                (
                    expense_id,
                    name,
                    expense_report_id,
                    date,
                    category,
                    amount,
                    self.user_ids["employee"],
                    self.company_id,
                    self.user_ids["employee"],
                ),
            )

        cursor.close()
        self.conn.commit()
        print("   ✅ Expense reports created")

    def seed_quotes(self):
        """Seed sales quotes"""
        print("\n💼 Seeding sales quotes...")
        cursor = self.conn.cursor()

        for i, (client_id, project_id) in enumerate(zip(self.client_ids, self.project_ids)):
            quote_id = str(uuid.uuid4())
            quote_date = datetime.now()
            validity_date = quote_date + timedelta(days=30)

            cursor.execute(
                """
                INSERT INTO sale_order (
                    id, name, code, partner_id, project_id, state,
                    quote_date, validity_date, account_manager_id,
                    total_amount, currency, company_id, active,
                    create_date, create_uid
                ) VALUES (
                    %s, %s, %s, %s, %s, 'draft',
                    %s, %s, %s,
                    2500000.00, 'PHP', %s, TRUE,
                    NOW(), %s
                )
                """,
                (
                    quote_id,
                    f"Campaign Proposal #{i+1}",
                    f"QT-2024-{str(i+1).zfill(3)}",
                    client_id,
                    project_id,
                    quote_date,
                    validity_date,
                    self.user_ids["manager"],
                    self.company_id,
                    self.user_ids["manager"],
                ),
            )

            print(f"   ✅ Quote created: QT-2024-{str(i+1).zfill(3)}")

        cursor.close()
        self.conn.commit()

    def seed_equipment(self):
        """Seed equipment inventory"""
        print("\n📷 Seeding equipment...")
        cursor = self.conn.cursor()

        equipment = [
            ("Canon EOS R5", "camera", "Canon", "EOS-R5-001"),
            ("Sony A7IV", "camera", "Sony", "A7IV-002"),
            ("Godox SL60W", "lighting", "Godox", "SL60W-003"),
            ("Rode NTG3", "audio", "Rode", "NTG3-004"),
        ]

        for name, category, manufacturer, serial in equipment:
            equipment_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO stock_equipment (
                    id, name, code, category, manufacturer, serial_number,
                    state, purchase_price, currency, company_id, active,
                    create_date, create_uid
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    'available', 150000.00, 'PHP', %s, TRUE,
                    NOW(), %s
                )
                """,
                (
                    equipment_id,
                    name,
                    f"GEAR-{serial}",
                    category,
                    manufacturer,
                    serial,
                    self.company_id,
                    self.user_ids["admin"],
                ),
            )

            print(f"   ✅ Equipment created: {name}")

        cursor.close()
        self.conn.commit()

    def run(self, rag_only: bool = False):
        """Run seeding process"""
        print("=" * 80)
        print("TBWA Agency Databank - Demo Data Seeder")
        print("=" * 80)

        self.connect()

        try:
            if not rag_only:
                self.seed_company()
                self.seed_users()
                self.seed_clients()
                self.seed_projects()
                self.seed_tasks()
                self.seed_expenses()
                self.seed_quotes()
                self.seed_equipment()

            # RAG seeding would go here
            if rag_only:
                print("\n🧠 Seeding RAG demo data...")
                print("   ⚠️  RAG seeding not implemented yet")

            print("\n" + "=" * 80)
            print("✅ DEMO DATA SEEDED SUCCESSFULLY")
            print("=" * 80)
            print("\nDemo accounts:")
            print("  Admin:    admin@tbwa.com / admin123")
            print("  Manager:  manager@tbwa.com / manager123")
            print("  Employee: employee@tbwa.com / employee123")
            print("  Finance:  finance@tbwa.com / finance123")

        except Exception as e:
            print(f"\n❌ Seeding failed: {e}")
            self.conn.rollback()
            raise
        finally:
            self.close()


def main():
    parser = argparse.ArgumentParser(description="TBWA Databank Demo Data Seeder")
    parser.add_argument(
        "--url",
        type=str,
        default=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/odoo"),
        help="Database connection URL",
    )
    parser.add_argument(
        "--rag-only",
        action="store_true",
        help="Seed only RAG demo data",
    )

    args = parser.parse_args()

    seeder = DemoDataSeeder(args.url)
    seeder.run(rag_only=args.rag_only)


if __name__ == "__main__":
    main()
