# Code Lookup ingestion scripts

Two-step pipeline that loads a code document (e.g. IPC 2021) into the Code
Lookup vector store — `code_documents` + `code_chunks`. This is BD-1 in the
M0–M4 Fixes Report (D4 §4.3 / D10).

## Prerequisites

- **Node 18+** — `ingest-code-document.js` uses the built-in global `fetch`.
- **Python 3 + `pypdf`** — for PDF text extraction: `pip install pypdf`.
- The **service-role key** — Supabase → Project Settings → API → `service_role`
  secret. The `ingest-code-document` Edge Function is protected by a
  service-role auth gate (CC-3); only this key is accepted.
  **Never commit it or paste it into shared logs.**

## Step 1 — extract text from the PDF

Place the purchased PDF in `scripts/code-documents/` (git-ignored), then:

```bash
python3 scripts/extract-pdf-text.py \
  --file   scripts/code-documents/ipc_2021.pdf \
  --output scripts/code-documents/ipc_2021.txt
```

Open the `.txt` and confirm it is readable English. A full code document is
normally larger than 500 KB. (If the PDF is scanned page images rather than
digital text, `pypdf` cannot read it — an OCR tool is needed instead.)

## Step 2 — ingest the text

```bash
node scripts/ingest-code-document.js \
  --text    scripts/code-documents/ipc_2021.txt \
  --name    'International Plumbing Code' \
  --short   'IPC 2021' \
  --version 2021 \
  --trade   plumber \
  --url     https://<project-ref>.supabase.co/functions/v1/ingest-code-document \
  --key     <SERVICE_ROLE_KEY>
```

`--trade` must be one of: `plumber`, `electrician`, `hvac`, `roofer`, `other`.
Optional flags: `--source-url <url>`, `--ingested-by <label>`.

The function chunks the text, embeds it in batches of 20 (CC-3), and inserts
the rows. It can take a few minutes for a large document — keep the terminal
open until it prints `Ingestion complete`.

## Verify

In Supabase: `code_documents` gains 1 row, `code_chunks` gains the reported
chunk count (all with the matching `trade_type`). Then, in the app: Codes tab →
ask a question → Rex must answer with a specific code section citation and the
AHJ note.
