# Self-Hosted OCR Integration

## Overview
Self-hosted OCR microservice for receipt and document processing across T&E and Gearroom applications.

---

## Architecture

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   T&E App   │──────▶│ OCR Service │──────▶│ PaddleOCR    │
│  (Receipt)  │       │  (FastAPI)  │       │ + Layout LLM │
└─────────────┘       └─────────────┘       └──────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │  Supabase   │
                      │  Storage +  │
                      │  Postgres   │
                      └─────────────┘
                             ▲
                             │
┌─────────────┐              │
│  Gearroom   │──────────────┘
│   (Docs)    │
└─────────────┘
```

---

## OCR Microservice

### Tech Stack
- **Framework:** FastAPI (Python)
- **OCR Engine:** PaddleOCR (or Tesseract as fallback)
- **Layout Model:** PaddleOCR-VL or LayoutLM
- **Field Extraction:** LLM (Claude/GPT-4 mini) for structured output
- **Storage:** Supabase Storage for files
- **Database:** Postgres (`ocr.*` schema)

### Service Structure

```
ocr-service/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── ocr_engine.py
│   ├── llm_extractor.py
│   └── storage.py
├── Dockerfile
├── requirements.txt
└── docker-compose.yml
```

---

## Database Schema

Already defined in `/docs/te-database-schema.md`:

```sql
CREATE SCHEMA IF NOT EXISTS ocr;

CREATE TABLE ocr.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type   text NOT NULL CHECK (source_type IN ('te_receipt','gear_doc','srm_invoice')),
  source_id     uuid NOT NULL,
  storage_url   text NOT NULL,
  status        text NOT NULL CHECK (status IN ('pending','processing','completed','failed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  error_message text
);

CREATE TABLE ocr.extractions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES ocr.documents(id) ON DELETE CASCADE,
  raw_text      text,
  total_amount  numeric(12,2),
  currency      text,
  merchant      text,
  tx_date       date,
  tax_amount    numeric(12,2),
  json_payload  jsonb,
  confidence    numeric(3,2),
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

---

## API Specification

### `POST /ocr/process`

**Request:**
```json
{
  "source_type": "te_receipt",
  "source_id": "uuid-of-expense-line",
  "file_url": "https://storage.supabase.co/.../receipt.jpg",
  "hint": "taxi_receipt"  // optional category hint
}
```

**Response (Sync):**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "raw_text": "GRAB PHILIPPINES\nTrip from BGC to NAIA\nTotal: PHP 450.00\nDate: 2025-11-15",
  "fields": {
    "merchant": "Grab Philippines",
    "total_amount": 450.00,
    "currency": "PHP",
    "tx_date": "2025-11-15",
    "tax_amount": 0.00,
    "category": "Transportation",
    "line_items": [
      { "description": "Trip from BGC to NAIA", "amount": 450.00 }
    ]
  },
  "confidence": 0.92
}
```

**Response (Async):**
```json
{
  "job_id": "uuid",
  "status": "processing"
}
```

Then poll `GET /ocr/status/{job_id}` or use webhooks.

---

## Implementation: FastAPI Service

### `app/main.py`

```python
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from supabase import create_client
import uuid
from .ocr_engine import process_image
from .llm_extractor import extract_fields
from .storage import download_from_url

app = FastAPI(title="OCR Microservice")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class OCRRequest(BaseModel):
    source_type: str
    source_id: str
    file_url: str
    hint: str | None = None

class OCRResponse(BaseModel):
    job_id: str
    status: str
    raw_text: str | None = None
    fields: dict | None = None
    confidence: float | None = None

@app.post("/ocr/process", response_model=OCRResponse)
async def process_ocr(req: OCRRequest):
    # 1. Create OCR document record
    doc_id = str(uuid.uuid4())
    supabase.table('ocr.documents').insert({
        'id': doc_id,
        'source_type': req.source_type,
        'source_id': req.source_id,
        'storage_url': req.file_url,
        'status': 'processing'
    }).execute()
    
    try:
        # 2. Download image
        image_bytes = download_from_url(req.file_url)
        
        # 3. Run OCR
        raw_text, confidence = process_image(image_bytes)
        
        # 4. Extract structured fields with LLM
        fields = extract_fields(raw_text, hint=req.hint)
        
        # 5. Store extraction
        supabase.table('ocr.extractions').insert({
            'document_id': doc_id,
            'raw_text': raw_text,
            'total_amount': fields.get('total_amount'),
            'currency': fields.get('currency', 'PHP'),
            'merchant': fields.get('merchant'),
            'tx_date': fields.get('tx_date'),
            'tax_amount': fields.get('tax_amount'),
            'json_payload': fields,
            'confidence': confidence
        }).execute()
        
        # 6. Update document status
        supabase.table('ocr.documents').update({
            'status': 'completed',
            'completed_at': 'now()'
        }).eq('id', doc_id).execute()
        
        return OCRResponse(
            job_id=doc_id,
            status='completed',
            raw_text=raw_text,
            fields=fields,
            confidence=confidence
        )
        
    except Exception as e:
        supabase.table('ocr.documents').update({
            'status': 'failed',
            'error_message': str(e)
        }).eq('id', doc_id).execute()
        
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ocr/status/{job_id}")
async def get_status(job_id: str):
    doc = supabase.table('ocr.documents').select('*').eq('id', job_id).single().execute()
    
    if doc.data['status'] == 'completed':
        extraction = supabase.table('ocr.extractions').select('*').eq('document_id', job_id).single().execute()
        return {
            'job_id': job_id,
            'status': 'completed',
            'raw_text': extraction.data['raw_text'],
            'fields': extraction.data['json_payload'],
            'confidence': extraction.data['confidence']
        }
    else:
        return {
            'job_id': job_id,
            'status': doc.data['status'],
            'error': doc.data.get('error_message')
        }
```

### `app/ocr_engine.py`

```python
from paddleocr import PaddleOCR
import cv2
import numpy as np

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=True)

def process_image(image_bytes: bytes) -> tuple[str, float]:
    """
    Run OCR on image bytes, return (text, confidence)
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run OCR
    result = ocr.ocr(img, cls=True)
    
    # Extract text and confidence
    lines = []
    total_confidence = 0
    count = 0
    
    for line in result[0]:
        text = line[1][0]
        confidence = line[1][1]
        lines.append(text)
        total_confidence += confidence
        count += 1
    
    raw_text = '\n'.join(lines)
    avg_confidence = total_confidence / count if count > 0 else 0
    
    return raw_text, round(avg_confidence, 2)
```

### `app/llm_extractor.py`

```python
from openai import OpenAI
import json

client = OpenAI(api_key=OPENAI_API_KEY)

EXTRACTION_PROMPT = """
Extract structured information from this receipt OCR text.
Return a JSON object with these fields:
- merchant: Business name
- total_amount: Total amount (numeric)
- currency: Currency code (default PHP)
- tx_date: Transaction date (YYYY-MM-DD)
- tax_amount: Tax/VAT amount if present
- category: Best guess category (Transportation/Meals/Accommodation/Supplies/Other)
- line_items: Array of {description, amount} for itemized receipts

OCR Text:
{raw_text}

Category hint: {hint}

Return ONLY valid JSON, no markdown formatting.
"""

def extract_fields(raw_text: str, hint: str = None) -> dict:
    """
    Use LLM to extract structured fields from OCR text
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a receipt data extraction expert."},
            {"role": "user", "content": EXTRACTION_PROMPT.format(raw_text=raw_text, hint=hint or 'unknown')}
        ],
        temperature=0.1
    )
    
    try:
        fields = json.loads(response.choices[0].message.content)
        return fields
    except json.JSONDecodeError:
        # Fallback parsing
        return {
            "merchant": "Unknown",
            "total_amount": 0.0,
            "currency": "PHP",
            "category": "Other"
        }
```

---

## Integration: T&E App

### Upload Flow

```tsx
// components/te/ReceiptUpload.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { supabase } from '@/lib/supabase';

interface ReceiptUploadProps {
  expenseLineId: string;
  onExtracted: (fields: any) => void;
}

export function ReceiptUpload({ expenseLineId, onExtracted }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(`${expenseLineId}/${file.name}`, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(uploadData.path);

      setUploading(false);
      setProcessing(true);

      // 3. Call OCR service
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'te_receipt',
          source_id: expenseLineId,
          file_url: urlData.publicUrl,
        }),
      });

      const ocrResult = await response.json();

      // 4. Update expense line with extracted data
      onExtracted(ocrResult.fields);

      setProcessing(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        disabled={uploading || processing}
        className="hidden"
        id="receipt-upload"
      />
      <label htmlFor="receipt-upload">
        <Button asChild disabled={uploading || processing}>
          <span>
            {uploading && '📤 Uploading...'}
            {processing && '🔄 Processing OCR...'}
            {!uploading && !processing && '📷 Add Receipt'}
          </span>
        </Button>
      </label>
    </div>
  );
}
```

### Usage in Expense Form

```tsx
// In ExpenseReportForm.tsx
import { ReceiptUpload } from './ReceiptUpload';

// Inside the expense line card:
<ReceiptUpload
  expenseLineId={line.id}
  onExtracted={(fields) => {
    // Auto-fill expense line fields
    updateLine(idx, 'merchant', fields.merchant);
    updateLine(idx, 'amount', fields.total_amount);
    updateLine(idx, 'category', fields.category);
    updateLine(idx, 'date', fields.tx_date);
    updateLine(idx, 'ocrStatus', 'completed');
  }}
/>
```

---

## Integration: Gearroom App

For maintenance documents, service invoices:

```tsx
// Similar flow but source_type='gear_doc'
const handleMaintenanceDoc = async (file: File, itemId: string) => {
  // Upload to storage
  const { data } = await supabase.storage
    .from('maintenance-docs')
    .upload(`${itemId}/${file.name}`, file);

  // Process OCR
  const response = await fetch('/api/ocr/process', {
    method: 'POST',
    body: JSON.stringify({
      source_type: 'gear_doc',
      source_id: itemId,
      file_url: publicUrl,
      hint: 'maintenance_invoice'
    })
  });

  const { fields } = await response.json();

  // Update maintenance job with vendor, cost, date
  await supabase.table('gear.maintenance_jobs').update({
    vendor: fields.merchant,
    cost: fields.total_amount,
    service_date: fields.tx_date
  }).eq('id', jobId);
};
```

---

## Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  ocr-service:
    build: ./ocr-service
    ports:
      - "8001:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./models:/app/models  # Cache OCR models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]  # Optional GPU acceleration
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app/ ./app/

# Download PaddleOCR models on build
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='en')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `requirements.txt`

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
paddleocr==2.7.0
paddlepaddle==2.5.2
opencv-python-headless==4.8.1.78
pillow==10.1.0
supabase==2.0.3
openai==1.3.7
python-multipart==0.0.6
```

---

## Performance Optimization

### 1. Batch Processing
For bulk receipt uploads:
```python
@app.post("/ocr/batch")
async def process_batch(file_urls: list[str]):
    tasks = [process_ocr_task(url) for url in file_urls]
    results = await asyncio.gather(*tasks)
    return results
```

### 2. Model Caching
- Pre-load PaddleOCR models at startup
- Cache models in Docker volume

### 3. Queue System (Production)
For async processing at scale:
```
Client → API → RabbitMQ/Redis Queue → Worker Pool → OCR Engine
                       ↓
                  Supabase (status updates)
```

---

## Testing

### Unit Tests

```python
import pytest
from app.llm_extractor import extract_fields

def test_extract_taxi_receipt():
    raw_text = """
    GRAB PHILIPPINES
    Trip from BGC to NAIA
    Total: PHP 450.00
    Date: 15 Nov 2025
    """
    
    fields = extract_fields(raw_text, hint='taxi_receipt')
    
    assert fields['merchant'] == 'Grab Philippines'
    assert fields['total_amount'] == 450.00
    assert fields['currency'] == 'PHP'
    assert fields['category'] in ['Transportation', 'Taxi']
```

### Integration Test

```bash
# Upload test receipt
curl -X POST http://localhost:8001/ocr/process \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "te_receipt",
    "source_id": "test-123",
    "file_url": "https://example.com/test-receipt.jpg"
  }'
```

---

## Error Handling

### Common Issues

1. **Low Image Quality**
   - Pre-process with contrast enhancement
   - Upscale if resolution < 300 DPI

2. **Multi-language Receipts**
   - Use PaddleOCR multilang model
   - LLM can handle mixed languages

3. **Hand-written Receipts**
   - Lower confidence threshold
   - Flag for manual review

4. **No Total Amount Found**
   - Extract line items, sum manually
   - Ask user to confirm

### Fallback Flow

```python
if ocr_confidence < 0.7:
    # Flag for manual review
    return {
        'status': 'review_needed',
        'raw_text': raw_text,
        'confidence': confidence,
        'suggested_fields': fields  # LLM best guess
    }
```

---

## Future Enhancements

1. **Mobile Camera Integration**
   - Real-time OCR on mobile (iOS/Android)
   - Guide users to capture better photos

2. **Receipt De-duplication**
   - Image hash comparison
   - Prevent duplicate expense claims

3. **Multi-page PDFs**
   - Handle multi-page invoices
   - Extract tables from PDF documents

4. **Vendor Database**
   - Auto-complete merchant names
   - Link to vendor master data (SRM)

5. **Audit Trail**
   - Store original image + OCR results
   - Compliance/audit retrieval
