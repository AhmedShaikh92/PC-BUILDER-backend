# PC Builder Backend

A comprehensive REST API for PC component recommendations and pricing. Built with Node.js, Express, and MongoDB.

## Features

- **Component Management**: Add, update, delete PC components across 9 categories
- **Price Tracking**: Manage component prices from multiple vendors
- **Smart Recommendations**: AI-powered build recommendations based on budget, use case, and preferences
- **Admin Authentication**: JWT-based authentication for admin operations
- **Compatibility Checking**: Validates component compatibility (socket, form factor, physical fit)
- **Power Calculations**: Automatic PSU requirement calculation with safety margins
- **Budget-Aware Selection**: Selects components with best performance-to-price ratio

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or pnpm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and keys
   ```

3. **Seed database**
   ```bash
   npm run seed
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── config/           # Database configuration
├── controllers/      # Route logic (auth, components, prices, recommendations)
├── middleware/       # Authentication middleware
├── models/          # Mongoose schemas (Admin, Component, Price)
├── routes/          # Express routes
├── seed/            # Database seed data
├── utils/           # Helper functions (compatibility, power calculations)
├── server.js        # Express app setup
└── package.json
```

## API Overview

### Public Routes
- `GET /api/components` - List all components (with filters)
- `GET /api/components/:id` - Get component details
- `GET /api/prices/component/:componentId` - Get prices for component
- `POST /api/recommend/build` - Get build recommendation

### Admin Routes (JWT Protected)
- `POST /api/components` - Create component
- `PUT /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component
- `POST /api/prices` - Create/update price
- `DELETE /api/prices/:priceId` - Delete price

### Seeding Routes (Admin Key Protected)
- `POST /api/components/seed` - Bulk insert components
- `POST /api/prices/seed` - Bulk insert prices

### Auth Routes
- `POST /api/auth/register` - Register admin (requires admin key)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current admin (requires JWT)

## Component Categories

1. **CPU** (Processor)
2. **Motherboard**
3. **RAM** (Memory)
4. **Storage** (SSD/HDD)
5. **PSU** (Power Supply)
6. **Case** (Cabinet)
7. **GPU** (Graphics Card) - Optional
8. **CPU_Cooler**
9. **Case_Fan**

## Recommendation Engine

The engine builds optimal PC configurations based on:

- **Budget Tier**: Categorizes budget into Entry/Mid/High tiers
- **Use Case**: Gaming, Productivity, or Office
- **Component Preference**: AMD, Intel, or Any
- **Compatibility Checks**: Socket, form factor, physical dimensions
- **Power Requirements**: Calculates system power with 1.25× safety margin
- **Performance-to-Price**: Selects components with best value

## Database Models

### Component
```javascript
{
  name: String,
  category: String (enum),
  brand: String,
  specs: Object (flexible, varies by category),
  benchmarkScore: Number,
  createdAt: Date
}
```

### Price
```javascript
{
  componentId: ObjectId,
  vendor: String,
  price: Number,
  productUrl: String,
  lastUpdated: Date
}
```

### Admin
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

## Example Requests

### Get Build Recommendation
```bash
curl -X POST http://localhost:5000/api/recommend/build \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 70000,
    "useCase": "Gaming",
    "preference": "AMD"
  }'
```

### Create Component (Admin)
```bash
curl -X POST http://localhost:5000/api/components \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ryzen 5 5600",
    "category": "CPU",
    "brand": "AMD",
    "specs": {
      "socket": "AM4",
      "cores": 6,
      "tdp": 65
    },
    "benchmarkScore": 16000
  }'
```

### Seed Components (Admin)
```bash
curl -X POST http://localhost:5000/api/components/seed \
  -H "X-Admin-Key: your_admin_key" \
  -H "Content-Type: application/json" \
  -d '[...]'
```

## Security

- **Passwords**: Hashed with bcryptjs before storing
- **Authentication**: JWT tokens with 7-day expiration
- **Admin Key**: Protects seeding and registration endpoints
- **Input Validation**: All inputs validated before processing
- **SQL Injection**: MongoDB prevents injection attacks
- **CORS**: Configured for safe cross-origin requests

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/pc-builder
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_in_production
ADMIN_KEY=your_admin_key_change_in_production
NODE_ENV=development
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Seed
The `seedAll.js` script populates the database with:
- 43 components across all categories
- 100+ price entries from multiple vendors

```bash
npm run seed
```

## API Documentation

See `API_DOCS.md` for comprehensive endpoint documentation with examples.

## Future Enhancements

- [ ] Redis caching for price lookups
- [ ] Cron jobs for automatic price updates (affiliate APIs)
- [ ] User build history and favorites
- [ ] Build sharing and comparison
- [ ] Advanced filtering and sorting
- [ ] Component availability checking
- [ ] Performance benchmarking integration
- [ ] Admin dashboard

## License

MIT

## Support

For issues or questions, check API_DOCS.md or open an issue in the repository.
