# Vulnerability Scanner API Backend

A FastAPI backend for the vulnerability scanner application.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## API Endpoints

### GET /api/v1/scan
Receives JSON data for vulnerability scanning. Can accept:
- JSON data in request body
- Query parameters
- Returns a success response with the received data

### POST /api/v1/scan
Receives scan data via POST method for compatibility.

### GET /
Root endpoint to check if the API is running.

### GET /health
Health check endpoint.

## CORS Configuration
The API is configured to accept requests from:
- http://localhost:3000
- http://127.0.0.1:3000

## Example Usage

```bash
# Test the GET endpoint
curl -X GET http://127.0.0.1:8000/api/v1/scan

# Test with JSON data
curl -X GET http://127.0.0.1:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test with query parameters
curl -X GET "http://127.0.0.1:8000/api/v1/scan?param1=value1&param2=value2"
``` 