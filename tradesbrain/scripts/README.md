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

## M9 — the four trade code documents

All four Rex trade profiles (Plumber/Electrician/HVAC/Roofer) are live in
`supabase/functions/claude-proxy/prompts.ts`, and RAG search filters by
`trade_type` (electrician queries only ever return NEC chunks, never IPC). The
code/profile work for M9 is complete — the remaining step is ingesting each
purchased document with the correct `--trade` tag so the vector store has real
chunks to cite. Rex already cites these codes from its in-prompt knowledge when
a document is not yet ingested; ingestion adds verbatim-section citations.

Run Step 1 (extract) then Step 2 (ingest) once per document. Endpoint/key are
the same every time (`--url <project>/functions/v1/ingest-code-document`,
`--key <SERVICE_ROLE_KEY>`).

```bash
# Plumber — IPC 2021 (M4)
node scripts/ingest-code-document.js --text scripts/code-documents/ipc_2021.txt \
  --name 'International Plumbing Code' --short 'IPC 2021' --version 2021 --trade plumber --url … --key …

# Electrician — NEC 2023
node scripts/ingest-code-document.js --text scripts/code-documents/nec_2023.txt \
  --name 'National Electrical Code' --short 'NEC 2023' --version 2023 --trade electrician --url … --key …

# HVAC — IMC 2021
node scripts/ingest-code-document.js --text scripts/code-documents/imc_2021.txt \
  --name 'International Mechanical Code' --short 'IMC 2021' --version 2021 --trade hvac --url … --key …

# HVAC — ASHRAE (run as a second hvac document; chunks merge under trade_type=hvac)
node scripts/ingest-code-document.js --text scripts/code-documents/ashrae.txt \
  --name 'ASHRAE Standards' --short 'ASHRAE' --version 2022 --trade hvac --url … --key …

# Roofer — IBC 2021 (roofing chapters: Ch.15 Roof Assemblies; pair with IRC Ch.9)
node scripts/ingest-code-document.js --text scripts/code-documents/ibc_2021_roofing.txt \
  --name 'International Building Code — Roofing' --short 'IBC 2021' --version 2021 --trade roofer --url … --key …
```

After each run, confirm in Supabase that `code_chunks` gained rows with the
matching `trade_type`, then test in the app: set that trade in Settings → open
Codes → ask a trade-specific question → Rex cites the correct document. A second
document for the same trade (e.g. ASHRAE after IMC) simply adds more chunks under
that `trade_type`; search returns the best matches across all of them.
