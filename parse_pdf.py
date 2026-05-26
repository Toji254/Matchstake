import sys
import json

def try_pypdf(pdf_path):
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except ImportError:
        return None

def try_pypdf2(pdf_path):
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except ImportError:
        return None

def try_fitz(pdf_path):
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() or ""
        return text
    except ImportError:
        return None

def try_pdfminer(pdf_path):
    try:
        from pdfminer.high_level import extract_text
        return extract_text(pdf_path)
    except ImportError:
        return None

def main():
    pdf_path = "/home/lowkey/Desktop/FWC26 Match Schedule_v17_10042026_EN.pdf"
    
    # Try different engines
    text = try_pypdf(pdf_path)
    if not text:
        text = try_pypdf2(pdf_path)
    if not text:
        text = try_fitz(pdf_path)
    if not text:
        text = try_pdfminer(pdf_path)
        
    if not text:
        print("ERROR: No PDF library installed (pypdf, PyPDF2, fitz, or pdfminer). Please install one (e.g. pip install pypdf).", file=sys.stderr)
        sys.exit(1)
        
    print(f"Extracted {len(text)} characters from PDF.")
    
    # Write full raw text
    with open("extracted_pdf_raw.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Saved raw text to extracted_pdf_raw.txt.")

if __name__ == "__main__":
    main()
