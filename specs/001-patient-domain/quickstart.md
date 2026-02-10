# QuickStart: Patient Domain Service

## Prerequisites

- Node.js v20+
- Docker & Docker Compose
- PostgreSQL Client

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Database Migration**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Running the Service

- **Development Mode**:
  ```bash
  npm run dev
  ```
  Service will be available at `http://localhost:3000`.

- **API Documentation**:
  Access Swagger UI at `http://localhost:3000/docs`.

## Testing

- **Run Unit Tests**:
  ```bash
  npm test
  ```
- **Run Integration Tests** (requires DB):
  ```bash
  npm run test:integration
  ```
