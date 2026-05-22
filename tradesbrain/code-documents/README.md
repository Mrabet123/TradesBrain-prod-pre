# code-documents/

Admin/tooling directory (D4 v1.2 amendment) for source trade-code documents
awaiting RAG ingestion.

Drop the plain-text export of a code document here, then ingest it with
`scripts/ingest-code-document.js`, which POSTs to the `ingest-code-document`
Edge Function (chunk → embed → `code_chunks`).

The actual code documents are **not** committed — see `.gitignore`. Only this
README is tracked so the directory exists in the repo.

Use `scripts/extract-pdf-text.py` to convert a source PDF into the plain text
the ingestion script expects.
