"""FastAPI backend for Rate Card Pro."""
from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

from database import get_connection, init_db
from auth import issue_jwt, verify_pw, hash_pw
from security import require

app = FastAPI(title="Rate Card Pro API")

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class RequestItem(BaseModel):
    description: str
    qty: float = 1
    rate: float = 0

class RequestCreate(BaseModel):
    name: str
    project_code: Optional[str] = None
    client_name: Optional[str] = None
    items: List[RequestItem] = []
    notes: Optional[str] = None

class ApprovalAction(BaseModel):
    note: Optional[str] = None
    totals_delta: Optional[dict] = None

# Startup
@app.on_event("startup")
async def startup():
    init_db()

# Health check
@app.get("/healthz")
def health():
    return {"status": "ok"}

# Auth endpoints
@app.post("/auth/login")
def login(req: LoginRequest):
    """Authenticate user and return JWT token."""
    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email=? AND active=1", 
        (req.email,)
    ).fetchone()
    conn.close()
    
    if not user or not verify_pw(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = issue_jwt(user["email"], user["role"])
    return {
        "token": token,
        "role": user["role"],
        "email": user["email"],
        "name": user["name"]
    }

@app.post("/seed_admin")
def seed_admin():
    """One-time helper to seed admin users."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create FD user
    cursor.execute("""
        INSERT OR IGNORE INTO users(email, name, role, password_hash, active) 
        VALUES(?, ?, ?, ?, 1)
    """, ("fd@example.com", "Finance Director", "FD", hash_pw("admin123")))
    
    # Create AM user
    cursor.execute("""
        INSERT OR IGNORE INTO users(email, name, role, password_hash, active) 
        VALUES(?, ?, ?, ?, 1)
    """, ("am@example.com", "Account Manager", "AM", hash_pw("am123")))
    
    # Seed role tiers
    tiers = [
        ("Junior Developer", 3500),
        ("Senior Developer", 6500),
        ("Tech Lead", 8500),
        ("Project Manager", 7500),
        ("UX Designer", 5500),
        ("QA Engineer", 4500),
    ]
    for name, rate in tiers:
        cursor.execute("""
            INSERT OR IGNORE INTO role_tiers(name, hourly_rate, active) 
            VALUES(?, ?, 1)
        """, (name, rate))
    
    conn.commit()
    conn.close()
    return {"ok": True, "message": "Admin users and role tiers seeded"}

# Role tiers
@app.get("/roles")
def get_roles(q: str = ""):
    """Get role tiers, optionally filtered by query."""
    conn = get_connection()
    if q:
        roles = conn.execute(
            "SELECT * FROM role_tiers WHERE active=1 AND name LIKE ? ORDER BY name",
            (f"%{q}%",)
        ).fetchall()
    else:
        roles = conn.execute(
            "SELECT * FROM role_tiers WHERE active=1 ORDER BY name"
        ).fetchall()
    conn.close()
    return [dict(r) for r in roles]

# Requests endpoints
@app.post("/requests")
def create_request(payload: RequestCreate, claims=Depends(require("AM"))):
    """Create a new request (AM only)."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Calculate totals
    subtotal = sum(item.qty * item.rate for item in payload.items)
    totals = {
        "subtotal": subtotal,
        "tax": subtotal * 0.12,  # 12% VAT
        "grand_total": subtotal * 1.12
    }
    
    # Insert request
    cursor.execute("""
        INSERT INTO requests(name, project_code, client_name, am_email, state, totals_json, notes)
        VALUES(?, ?, ?, ?, 'draft', ?, ?)
    """, (payload.name, payload.project_code, payload.client_name, 
          claims["sub"], json.dumps(totals), payload.notes))
    
    request_id = cursor.lastrowid
    
    # Insert items
    for idx, item in enumerate(payload.items):
        cursor.execute("""
            INSERT INTO request_items(request_id, description, qty, rate, subtotal, position)
            VALUES(?, ?, ?, ?, ?, ?)
        """, (request_id, item.description, item.qty, item.rate, 
              item.qty * item.rate, idx))
    
    # Log event
    cursor.execute("""
        INSERT INTO approval_events(request_id, actor_email, action)
        VALUES(?, ?, 'create')
    """, (request_id, claims["sub"]))
    
    conn.commit()
    conn.close()
    
    return {"id": request_id, "state": "draft", "totals": totals}

@app.get("/requests")
def list_requests(claims=Depends(require())):
    """List requests based on user role."""
    conn = get_connection()
    
    if claims["role"] == "AM":
        # AM sees only their own requests
        requests = conn.execute("""
            SELECT * FROM requests WHERE am_email=? ORDER BY created_at DESC
        """, (claims["sub"],)).fetchall()
    else:
        # FD sees submitted/reviewed/approved requests
        requests = conn.execute("""
            SELECT * FROM requests 
            WHERE state IN ('submitted', 'fd_review', 'approved', 'rejected')
            ORDER BY created_at DESC
        """).fetchall()
    
    conn.close()
    return [dict(r) for r in requests]

@app.get("/requests/{rid}")
def get_request(rid: int, claims=Depends(require())):
    """Get request details with items."""
    conn = get_connection()
    
    request = conn.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    if not request:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check authorization
    if claims["role"] == "AM" and request["am_email"] != claims["sub"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Not authorized")
    
    items = conn.execute("""
        SELECT * FROM request_items WHERE request_id=? ORDER BY position
    """, (rid,)).fetchall()
    
    events = conn.execute("""
        SELECT * FROM approval_events WHERE request_id=? ORDER BY at DESC
    """, (rid,)).fetchall()
    
    conn.close()
    
    return {
        "request": dict(request),
        "items": [dict(i) for i in items],
        "events": [dict(e) for e in events]
    }

@app.post("/requests/{rid}/submit")
def submit_request(rid: int, claims=Depends(require("AM"))):
    """Submit request for FD approval (AM only)."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Verify ownership and state
    cursor.execute("""
        UPDATE requests SET state='submitted', updated_at=CURRENT_TIMESTAMP
        WHERE id=? AND am_email=? AND state='draft'
    """, (rid, claims["sub"]))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot submit this request")
    
    # Log event
    cursor.execute("""
        INSERT INTO approval_events(request_id, actor_email, action)
        VALUES(?, ?, 'submit')
    """, (rid, claims["sub"]))
    
    conn.commit()
    conn.close()
    
    return {"id": rid, "state": "submitted"}

@app.post("/approvals/{rid}/review")
def review_request(rid: int, action: ApprovalAction, claims=Depends(require("FD"))):
    """FD reviews and optionally edits totals."""
    conn = get_connection()
    cursor = conn.cursor()
    
    request = cursor.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    if not request:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Update totals if provided
    if action.totals_delta:
        current_totals = json.loads(request["totals_json"] or "{}")
        new_totals = {**current_totals, **action.totals_delta}
        cursor.execute("""
            UPDATE requests SET totals_json=?, state='fd_review', updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        """, (json.dumps(new_totals), rid))
    else:
        cursor.execute("""
            UPDATE requests SET state='fd_review', updated_at=CURRENT_TIMESTAMP WHERE id=?
        """, (rid,))
    
    # Log event
    cursor.execute("""
        INSERT INTO approval_events(request_id, actor_email, action, note)
        VALUES(?, ?, 'review', ?)
    """, (rid, claims["sub"], action.note))
    
    conn.commit()
    conn.close()
    
    return {"id": rid, "state": "fd_review"}

@app.post("/approvals/{rid}/approve")
def approve_request(rid: int, action: ApprovalAction, claims=Depends(require("FD"))):
    """FD approves request and creates snapshot."""
    conn = get_connection()
    cursor = conn.cursor()
    
    request = cursor.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    if not request:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Update state
    cursor.execute("""
        UPDATE requests SET state='approved', updated_at=CURRENT_TIMESTAMP WHERE id=?
    """, (rid,))
    
    # Create approval snapshot
    version = cursor.execute("""
        SELECT COALESCE(MAX(version_no), 0) + 1 
        FROM approval_snapshot WHERE request_id=?
    """, (rid,)).fetchone()[0]
    
    cursor.execute("""
        INSERT INTO approval_snapshot(request_id, version_no, locked_totals_json)
        VALUES(?, ?, ?)
    """, (rid, version, request["totals_json"]))
    
    # Log event
    cursor.execute("""
        INSERT INTO approval_events(request_id, actor_email, action, note)
        VALUES(?, ?, 'approve', ?)
    """, (rid, claims["sub"], action.note))
    
    conn.commit()
    conn.close()
    
    return {"id": rid, "state": "approved", "version": version}

@app.post("/approvals/{rid}/reject")
def reject_request(rid: int, action: ApprovalAction, claims=Depends(require("FD"))):
    """FD rejects request."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE requests SET state='rejected', updated_at=CURRENT_TIMESTAMP WHERE id=?
    """, (rid,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Log event
    cursor.execute("""
        INSERT INTO approval_events(request_id, actor_email, action, note)
        VALUES(?, ?, 'reject', ?)
    """, (rid, claims["sub"], action.note))
    
    conn.commit()
    conn.close()
    
    return {"id": rid, "state": "rejected"}

@app.get("/pdf/{rid}")
def generate_pdf(rid: int):
    """Generate PDF for approved request."""
    conn = get_connection()
    
    request = conn.execute("""
        SELECT * FROM requests WHERE id=? AND state='approved'
    """, (rid,)).fetchone()
    
    if not request:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found or not approved")
    
    items = conn.execute("""
        SELECT description, qty, rate, subtotal 
        FROM request_items WHERE request_id=? ORDER BY position
    """, (rid,)).fetchall()
    
    conn.close()
    
    totals = json.loads(request["totals_json"] or "{}")
    
    # Generate PDF HTML
    html = f"""
    <html>
    <head>
        <style>
            body {{ 
                font-family: 'Inter', -apple-system, sans-serif; 
                background: #F2F7F2; 
                color: #111; 
                padding: 40px;
            }}
            h1 {{ color: #386641; margin-bottom: 10px; }}
            .accent {{ color: #D4AC0D; }}
            .meta {{ margin-bottom: 30px; color: #666; }}
            table {{ 
                width: 100%; 
                border-collapse: collapse; 
                background: white;
                margin: 20px 0;
            }}
            th, td {{ 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left;
            }}
            th {{ 
                background: #386641; 
                color: white; 
            }}
            .total-row {{ 
                background: #F2F7F2; 
                font-weight: bold;
            }}
            .grand-total {{ 
                font-size: 24px; 
                color: #D4AC0D; 
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <h1>Rate Card Pro — Approved Quote</h1>
        <div class="meta">
            <p><strong>Quote:</strong> {request['name']}</p>
            <p><strong>Project Code:</strong> {request['project_code'] or 'N/A'}</p>
            <p><strong>Client:</strong> {request['client_name'] or 'N/A'}</p>
            <p><strong>Account Manager:</strong> {request['am_email']}</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Qty</th>
                    <th style="text-align: right;">Rate (₱)</th>
                    <th style="text-align: right;">Subtotal (₱)</th>
                </tr>
            </thead>
            <tbody>
                {''.join(f'''
                <tr>
                    <td>{item['description']}</td>
                    <td style="text-align: right;">{item['qty']}</td>
                    <td style="text-align: right;">{item['rate']:,.2f}</td>
                    <td style="text-align: right;">{item['subtotal']:,.2f}</td>
                </tr>
                ''' for item in items)}
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Subtotal:</td>
                    <td style="text-align: right;">₱{totals.get('subtotal', 0):,.2f}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Tax (12%):</td>
                    <td style="text-align: right;">₱{totals.get('tax', 0):,.2f}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="grand-total">
            <strong>Grand Total: ₱{totals.get('grand_total', 0):,.2f}</strong>
        </div>
    </body>
    </html>
    """
    
    # Generate PDF using WeasyPrint
    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html).write_pdf()
        return Response(content=pdf_bytes, media_type="application/pdf")
    except ImportError:
        # Fallback: return HTML if WeasyPrint not available
        return Response(content=html, media_type="text/html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
