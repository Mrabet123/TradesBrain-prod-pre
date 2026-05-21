#!/usr/bin/env python3
"""
scripts/extract-pdf-text.py — Extract plain text from a code-document PDF.

Step 1 of the BD-1 Code Lookup ingestion pipeline (D4 Section 4.3). It turns a
purchased code PDF (e.g. IPC 2021) into the .txt file that
scripts/ingest-code-document.js uploads to the ingest-code-document Edge
Function.

Requires the `pypdf` package:
    pip install pypdf

Usage:
    python3 scripts/extract-pdf-text.py \
        --file   scripts/code-documents/ipc_2021.pdf \
        --output scripts/code-documents/ipc_2021.txt

Notes:
    • pypdf reads *digital* text. If the PDF is scanned page images, pypdf
      returns little or nothing — that PDF would need an OCR step instead.
    • Always open the resulting .txt and confirm it is readable English before
      running the ingestion step.
"""

import argparse
import os
import re
import sys


def main():
    parser = argparse.ArgumentParser(description="Extract text from a PDF.")
    parser.add_argument("--file", required=True, help="Path to the source PDF")
    parser.add_argument("--output", required=True, help="Path for the .txt output")
    args = parser.parse_args()

    if not os.path.isfile(args.file):
        sys.exit(f"  x  PDF not found: {args.file}")

    try:
        from pypdf import PdfReader
    except ImportError:
        sys.exit(
            "  x  The 'pypdf' package is not installed.\n"
            "     Install it with:  pip install pypdf"
        )

    print(f"\n  Reading {args.file} ...")
    reader = PdfReader(args.file)
    total = len(reader.pages)
    print(f"  {total} pages found. Extracting text...")

    parts = []
    for i, page in enumerate(reader.pages):
        try:
            text = page.extract_text() or ""
        except Exception as e:  # noqa: BLE001 — a bad page must not abort the run
            print(f"  !  page {i + 1}: extraction failed ({e}) — skipped")
            text = ""
        parts.append(text)
        if (i + 1) % 50 == 0 or i + 1 == total:
            print(f"     ... {i + 1}/{total} pages")

    # Join pages, then collapse repeated whitespace / blank lines so the chunker
    # in the Edge Function gets clean input.
    raw = "\n\n".join(parts)
    cleaned = re.sub(r"[ \t]+", " ", raw)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()

    out_dir = os.path.dirname(os.path.abspath(args.output))
    os.makedirs(out_dir, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(cleaned)

    size_kb = round(os.path.getsize(args.output) / 1024)
    words = len(cleaned.split())
    print(f"\n  OK  Wrote {args.output}")
    print(f"      {size_kb} KB - approx {words:,} words")

    if not cleaned:
        sys.exit(
            "\n  x  No text was extracted. The PDF is likely scanned images,\n"
            "     not digital text — pypdf cannot read it. Use an OCR tool."
        )
    if size_kb < 500:
        print(
            f"\n  !  Output is only {size_kb} KB. A full code document is usually\n"
            f"     larger than 500 KB. Open the .txt and confirm it is complete\n"
            f"     before running the ingestion step."
        )
    print("")


if __name__ == "__main__":
    main()
