from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/scan")
async def get_scan(request: Request):
    try:
        # Try to read JSON from the body (not standard for GET, but possible)
        body = await request.body()
        if body:
            try:
                data = await request.json()
                return {"status": "success", "received": data}
            except Exception:
                return {"status": "error", "message": "Invalid JSON in body"}
        # Or accept query params
        if request.query_params:
            return {"status": "success", "received": dict(request.query_params)}
        return {"status": "success", "message": "No data received"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/scan")
async def post_scan(request: Request):
    try:
        data = await request.json()
        return {"status": "success", "received": data}
    except Exception:
        return {"status": "error", "message": "Invalid JSON in body"}

@app.get("/")
async def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True) 