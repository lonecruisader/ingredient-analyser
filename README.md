# Sephora Ingredient Analyzer

A web application that helps environmentally conscious consumers make informed decisions about beauty products by analyzing their ingredients. The tool searches Sephora.com for products, extracts their ingredient lists, and provides a detailed breakdown of natural vs. synthetic ingredients using LLM-based classification.

## Features

- Search for beauty products on Sephora.com
- View detailed ingredient breakdowns
- See percentage of natural vs. synthetic ingredients
- Understand environmental impact of ingredients
- Mobile-responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Jest and React Testing Library for testing
- ESLint and Prettier for code quality

### Backend
- Express.js with TypeScript
- Jest and Supertest for testing
- Axios for HTTP requests
- Cheerio for web scraping
- LLM integration for ingredient analysis

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sephora-scraper.git
   cd sephora-scraper
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # In the backend directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend server (from frontend directory)
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3001`

## Development

### Frontend

```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Backend

```bash
cd backend

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
sephora-scraper/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/        # TypeScript type definitions
│   │   └── tests/        # Frontend tests
│   └── ...
├── backend/               # Express backend application
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── tests/        # Backend tests
│   └── ...
└── tasks/                # Project documentation
    ├── prd-sephora-ingredient-analyzer.md
    └── tasks-prd-sephora-ingredient-analyzer.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 