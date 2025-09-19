# Eclypsium Frontend Challenge

Technical challenge for Senior Software Engineer - Frontend position

## Overview

This project includes a mock backend that simulates an asset and security vulnerability management system. Your task is to create a frontend application that consumes these endpoints and presents the information in an efficient and attractive manner.

## Expected Features

Your frontend application should include:

- **Asset Dashboard**: List all available assets

Additionally you can include as optional views:
  - **Detail View**: Show detailed information for each asset
  - **Component Management**: Display components for each asset
  - **Vulnerability Analysis**: Present vulnerabilities found with different severity levels

## Available API Endpoints

The mock backend provides the following endpoints:

### Assets
- `GET /assets` - List all assets
- `GET /assets/{id}` - Get details of a specific asset
- `GET /assets/{id}/vulnerabilities` - List vulnerabilities for an asset

### Components
- `GET /assets/{assetId}/components/{componentId}` - Details of a specific component

### Response Examples

**GET /assets**
```json
[
  {
    "id": "asset-1",
    "name": "Production Server",
    "description": "Main backend server",
    "createdAt": "2025-01-10T12:00:00Z",
    "lastScan": "2025-02-01T10:00:00Z"
  }
]
```

**GET /assets/{id}/vulnerabilities**
```json
[
  {
    "id": "vuln-1",
    "description": "OpenSSL out-of-bounds read",
    "severity": "HIGH"
  }
]
```


> If you want to modify the API samples feel free to edit `backend-mock/expectations.json`

## Setup Instructions

### Prerequisites
- Docker and Docker Compose

### Starting the Mock Backend

1. Start the mock backend:
```bash
docker compose up -d
```

The backend will be available at `http://localhost:8080`

2. Verify it's working:
```bash
curl http://localhost:8080/assets
```


## Support

If you have any questions about the challenge or encounter issues with the mock backend, please don't hesitate to contact us.
