"""
KhataLens - OCR Extraction Script
Extracts structured data from handwritten khata (udhaar) notebook pages
using Google Gemini 2.5 Pro (best-in-class vision/OCR model) via LangChain.

Usage:
    pip install langchain-google-genai pillow python-dotenv

    Create a .env file in the same directory:
        GOOGLE_API_KEY=your_api_key_here

    Then run:
        python khata_ocr.py --folder images/
"""

import argparse
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from typing import Optional
import json

# Load variables from .env file into environment
load_dotenv()

# Supported image extensions
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


# ── Pydantic schema for structured output ────────────────────────────────────

class KhataEntry(BaseModel):
    name: str = Field(description="Customer name as written in the notebook")
    phone: Optional[str] = Field(
        default=None,
        description=(
            "Pakistani mobile number starting with 03 (e.g. 0312-3456789). "
            "Only present for new customers. None if not written."
        ),
    )
    amount: float = Field(description="Amount owed in Pakistani Rupees (PKR)")


class KhataPage(BaseModel):
    date: Optional[str] = Field(
        default=None,
        description=(
            "Date written at the top of the page in its original format "
            "(e.g. '24/4/26'). None if not visible."
        ),
    )
    entries: list[KhataEntry] = Field(
        description="List of all udhaar entries found on this page"
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

from PIL import Image
import io

def image_to_base64(image_path: Path) -> tuple[str, str]:
    """Compress image and return (base64_string, mime_type) to drastically speed up API calls."""
    ext = image_path.suffix.lower()
    mime_map = {
        ".jpg":  "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png":  "image/png",
        ".webp": "image/webp",
    }
    mime = mime_map.get(ext, "image/jpeg")
    
    # Open image, resize if too large, and compress
    img = Image.open(image_path)
    
    # Convert RGBA to RGB for JPEG
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
        
    # Resize if max dimension is > 1600px to save massive upload time
    max_dim = 1600
    if max(img.size) > max_dim:
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        
    # Save to memory buffer with high compression
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=75)
    mime = "image/jpeg" # We forced it to JPEG
    
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return b64, mime


def get_images_in_folder(folder: Path) -> list[Path]:
    """Return sorted list of supported image files inside the folder."""
    return sorted(
        p for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )


def build_llm(api_key: str) -> ChatGoogleGenerativeAI:
    """
    Initialise Gemini 2.5 Pro — Google's best multimodal model.
    Excellent at reading handwritten text, understanding layout,
    and handling mixed Urdu/English content.
    """
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",   # Best available model for vision/OCR tasks
        google_api_key=api_key,
        temperature=0,            # Deterministic output for data extraction
    )


def extract_khata(image_path: Path, llm: ChatGoogleGenerativeAI) -> KhataPage:
    """Run Gemini on a single khata image and return a structured KhataPage."""

    structured_llm = llm.with_structured_output(KhataPage)

    b64, mime = image_to_base64(image_path)

    prompt = """You are an expert at reading handwritten Pakistani shopkeeper udhaar (credit) notebooks.

Carefully examine this khata (ledger) page image and extract ALL entries.

RULES:
1. The DATE is written at the very top of the page — extract it exactly as written (e.g. "24/4/26").
2. Each entry follows one of two formats:
   a) NEW customer:      Name  -  Phone Number  -  Amount
   b) EXISTING customer: Name  -  Amount   (no phone number)
3. Phone numbers are Pakistani mobile numbers starting with 03 (e.g. 0312-3456789, 0333-4962379).
   If no phone number is present for an entry, set phone to null.
4. Amount is always a number. It may be written as "5000/-" or "4970/" — extract just the numeric value.
5. Extract the customer name EXACTLY as written (e.g. "Nomi Bhai", "Imran Pan Wala").
6. Do NOT skip any entry, even if handwriting is slightly unclear — use your best judgment.
7. A 10-11 digit number starting with 03 is always a phone number, never an amount.

Return all entries in the structured format provided."""

    message = HumanMessage(
        content=[
            {
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{b64}"},
            },
            {"type": "text", "text": prompt},
        ]
    )

    result: KhataPage = structured_llm.invoke([message])
    return result


# ── Display ───────────────────────────────────────────────────────────────────

def display_results(image_name: str, page: KhataPage) -> None:
    """Pretty-print extracted khata data to the terminal."""

    BOLD   = "\033[1m"
    CYAN   = "\033[96m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    DIM    = "\033[2m"
    RESET  = "\033[0m"
    LINE   = "-" * 66

    print()
    print(f"{BOLD}{CYAN}+==================================================================+{RESET}")
    print(f"{BOLD}{CYAN}|               KhataLens -- Extracted Ledger Page                |{RESET}")
    print(f"{BOLD}{CYAN}+==================================================================+{RESET}")
    print()
    print(f"  {BOLD}File   :{RESET}  {DIM}{image_name}{RESET}")

    date_str = page.date if page.date else "N/A"
    print(f"  {BOLD}Date   :{RESET}  {YELLOW}{date_str}{RESET}")
    print(f"  {BOLD}Entries:{RESET}  {len(page.entries)}")
    print()
    print(f"  {LINE}")
    print(f"  {BOLD}{'#':<4} {'Name':<24} {'Phone':<18} {'Amount (PKR)':>12}{RESET}")
    print(f"  {LINE}")

    total = 0.0
    for i, entry in enumerate(page.entries, start=1):
        phone_str = entry.phone if entry.phone else f"{YELLOW}--{RESET}"
        amount_str = f"{GREEN}Rs. {entry.amount:,.0f}{RESET}"
        print(f"  {i:<4} {entry.name:<24} {phone_str:<18} {amount_str:>12}")
        total += entry.amount

    print(f"  {LINE}")
    print(f"  {BOLD}{'':4} {'TOTAL RECOVERABLE':<24} {'':18} {RED}Rs. {total:,.0f}{RESET}")
    print(f"  {LINE}")
    print()

    # Raw JSON for backend integration
    print(f"{BOLD}Raw JSON:{RESET}")
    print(json.dumps(page.model_dump(), indent=2, ensure_ascii=False))
    print()


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="KhataLens -- Extract udhaar entries from khata notebook images."
    )
    parser.add_argument(
        "--folder",
        required=True,
        help="Path to the folder containing khata images (jpg/jpeg/png/webp)",
    )
    args = parser.parse_args()

    # Validate API key
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key:
        print("ERROR: GOOGLE_API_KEY not found. Add it to your .env file:")
        print("  GOOGLE_API_KEY=your_api_key_here")
        sys.exit(1)

    # Validate folder
    folder = Path(args.folder)
    if not folder.exists() or not folder.is_dir():
        print(f"ERROR: Folder not found: {folder}")
        sys.exit(1)

    images = get_images_in_folder(folder)
    if not images:
        print(f"ERROR: No supported images (jpg/png/webp) found in: {folder}")
        sys.exit(1)

    print(f"\nFound {len(images)} image(s) in '{folder}'. Processing with Gemini 2.5 flash...\n")

    # Build LLM once -- reused for all images
    llm = build_llm(api_key)

    for image_path in images:
        print(f"-> Processing: {image_path.name}")
        try:
            page = extract_khata(image_path, llm)
            display_results(image_path.name, page)
        except Exception as e:
            print(f"  ERROR processing {image_path.name}: {e}\n")


if __name__ == "__main__":
    main()
