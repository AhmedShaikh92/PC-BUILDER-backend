# PC Builder API Documentation

## Overview
PC Builder API provides endpoints for component management, pricing, and build recommendations with admin authentication.

## Base URL
```
http://localhost:5000/api
```

## Authentication
- **JWT Token**: Required for admin endpoints. Pass as `Authorization: Bearer <token>`
- **Admin Key**: Required for seeding endpoints. Pass as `X-Admin-Key: <key>`

## Endpoints

### Health Check
```
GET /health
```

---

## Authentication Routes (`/auth`)

### Register Admin
```
POST /auth/register
Headers: X-Admin-Key: <admin_key>
Body: {
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name"
}
Response: {
  "message": "Admin registered successfully",
  "admin": { "id", "email", "name" },
  "token": "<jwt_token>"
}
```

### Login Admin
```
POST /auth/login
Body: {
  "email": "admin@example.com",
  "password": "password123"
}
Response: {
  "message": "Login successful",
  "admin": { "id", "email", "name" },
  "token": "<jwt_token>"
}
```

### Get Current Admin
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: {
  "id": "...",
  "email": "admin@example.com",
  "name": "Admin Name"
}
```

---

## Component Routes (`/components`)

### Get All Components
```
GET /components
Query Params:
  - category: CPU, Motherboard, RAM, Storage, PSU, Case, GPU, CPU_Cooler, Case_Fan
  - brand: Brand name (e.g., AMD, Intel)
  - minScore: Minimum benchmark score
  - maxScore: Maximum benchmark score
  - page: Page number (default: 1)
  - limit: Results per page (default: 20)

Response: {
  "components": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Get Component by ID
```
GET /components/:id
Response: {
  "name": "Ryzen 5 5600",
  "category": "CPU",
  "brand": "AMD",
  "specs": { ... },
  "benchmarkScore": 16000,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Seed Components (Admin Only)
```
POST /components/seed
Headers: X-Admin-Key: <admin_key>
Body: [
  {
    "name": "Component Name",
    "category": "CPU",
    "brand": "AMD",
    "specs": { ... },
    "benchmarkScore": 16000
  },
  ...
]
Response: {
  "message": "X components seeded",
  "components": [...]
}
```

### Create Component (Admin Only)
```
POST /components
Headers: Authorization: Bearer <token>
Body: {
  "name": "Component Name",
  "category": "CPU",
  "brand": "AMD",
  "specs": { ... },
  "benchmarkScore": 16000
}
Response: { component object }
```

### Update Component (Admin Only)
```
PUT /components/:id
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Name",
  "specs": { ... }
}
Response: { updated component }
```

### Delete Component (Admin Only)
```
DELETE /components/:id
Headers: Authorization: Bearer <token>
Response: {
  "message": "Component deleted",
  "component": { ... }
}
```

---

## Price Routes (`/prices`)

### Get Prices for Component
```
GET /prices/component/:componentId
Response: [
  {
    "_id": "...",
    "componentId": "...",
    "vendor": "Amazon",
    "price": 8999,
    "productUrl": "...",
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Get Price by Component and Vendor
```
GET /prices/:componentId/:vendor
Response: { price object }
```

### Seed Prices (Admin Only)
```
POST /prices/seed
Headers: X-Admin-Key: <admin_key>
Body: [
  {
    "componentId": "...",
    "vendor": "Amazon",
    "price": 8999,
    "productUrl": "..."
  },
  ...
]
Response: {
  "message": "X prices seeded",
  "prices": [...]
}
```

### Create/Update Price (Admin Only)
```
POST /prices
Headers: Authorization: Bearer <token>
Body: {
  "componentId": "...",
  "vendor": "Amazon",
  "price": 8999,
  "productUrl": "..."
}
Response: { price object }
```

### Delete Price (Admin Only)
```
DELETE /prices/:priceId
Headers: Authorization: Bearer <token>
Response: {
  "message": "Price deleted",
  "price": { ... }
}
```

---

## Recommendation Routes (`/recommend`)

### Get Build Recommendation
```
POST /recommend/build
Body: {
  "budget": 70000,
  "useCase": "Gaming", // Gaming | Productivity | Office
  "preference": "AMD", // AMD | Intel | Any
  "includeGPU": true // Optional, default true
}

Response: {
  "budgetTier": "Mid",
  "requiredWattage": 437,
  "components": [
    {
      "category": "CPU",
      "component": { ... }
    },
    ...
  ],
  "totalEstimatedPrice": 65000,
  "withinBudget": true,
  "compatibilityErrors": []
}
```

### Get Build Price (Calculate Total)
```
POST /recommend/price
Body: {
  "componentIds": ["id1", "id2", "id3", ...]
}

Response: {
  "components": [
    {
      "componentId": "...",
      "name": "Component Name",
      "category": "CPU",
      "lowest": {
        "vendor": "Vedant",
        "price": 8799,
        "productUrl": "..."
      }
    },
    ...
  ],
  "totalLowestPrice": 65200
}
```

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/pc-builder
PORT=5000
JWT_SECRET=your_secret_key
ADMIN_KEY=your_admin_key
NODE_ENV=development
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

---

## Component Specs Examples

### CPU
```json
{
  "socket": "AM4",
  "cores": 6,
  "threads": 12,
  "tdp": 65,
  "integratedGraphics": false
}
```

### Motherboard
```json
{
  "socket": "AM4",
  "formFactor": "ATX",
  "chipset": "B550",
  "cpuCoolerMaxHeight": 190
}
```

### RAM
```json
{
  "sizeGB": 16,
  "speedMHz": 3200,
  "type": "DDR4"
}
```

### Storage
```json
{
  "type": "SSD",
  "capacityGB": 1000,
  "interface": "NVMe"
}
```

### PSU
```json
{
  "wattage": 650,
  "rating": "80+ Bronze"
}
```

### Case
```json
{
  "formFactorsSupported": ["ATX", "mATX"],
  "maxGPULengthMM": 381,
  "cpuCoolerMaxHeight": 190
}
```

### GPU
```json
{
  "tdp": 170,
  "lengthMM": 242
}
```

### CPU Cooler
```json
{
  "type": "Air",
  "tdpRating": 150,
  "heightMM": 159
}
```

### Case Fan
```json
{
  "sizeMM": 120,
  "airflowCFM": 55
}
```

---

## Error Handling

All errors return appropriate HTTP status codes with JSON response:
```json
{
  "message": "Error description"
}
```

Common status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

---

## Recommendation Engine Logic

1. **Budget Tiers**: Entry < ₹40k, Mid ₹40k-₹90k, High > ₹90k
2. **Use Case Weighting**:
   - Gaming: 40% GPU, 25% CPU, 8% RAM, 10% PSU
   - Productivity: 35% CPU, 8% RAM, 10% PSU
   - Office: 15% CPU, 8% RAM, 10% PSU
3. **Compatibility**: Checks socket, form factor, GPU length, cooler height
4. **Power Calculation**: Sum TDP × 1.25 safety margin
5. **Price Awareness**: Selects components with best benchmark-to-price ratio
