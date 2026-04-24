from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path
import tempfile
import os
import uuid
from khata_ocr import build_llm, extract_khata
from dotenv import load_dotenv

load_dotenv(".env.local")

app = FastAPI(title="KhataLens API")

# CORS configuration - must be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize the LLM once
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY is not set in the environment.")
llm = build_llm(api_key)

@app.get("/")
async def root():
    return {"message": "KhataLens API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/extract")
def extract_api(file: UploadFile = File(...)):
    print(f"[API] Received file: {file.filename}")
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Save the uploaded file temporarily
    temp_dir = Path(tempfile.gettempdir()) / "khatalens"
    temp_dir.mkdir(exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    temp_path = temp_dir / unique_filename
    
    try:
        print(f"[API] Saving file to: {temp_path}")
        content = file.file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        print(f"[API] Starting OCR extraction...")
        # Run OCR
        page = extract_khata(temp_path, llm)
        print(f"[API] Extraction complete! Found {len(page.entries)} entries")
        return page.model_dump()
        
    except Exception as e:
        print(f"[API] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up
        if temp_path.exists():
            try:
                temp_path.unlink()
                print(f"[API] Cleaned up temp file")
            except Exception as e:
                print(f"[API] Could not clean up temp file: {e}")

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
