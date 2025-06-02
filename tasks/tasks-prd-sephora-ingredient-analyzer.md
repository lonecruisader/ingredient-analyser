## Relevant Files

- `frontend/src/App.tsx` - Main React application component
- `frontend/src/components/SearchBar.tsx` - Product search input component
- `frontend/src/components/IngredientAnalysis.tsx` - Ingredient breakdown display component
- `frontend/src/components/PercentageChart.tsx` - Visual representation of natural vs synthetic percentages
- `frontend/src/types/index.ts` - TypeScript type definitions
- `backend/src/server.ts` - Express server setup
- `backend/src/routes/search.ts` - Product search endpoint
- `backend/src/services/scraper.ts` - Sephora web scraping service
- `backend/src/services/llm.ts` - LLM integration service
- `backend/src/utils/ingredientAnalyzer.ts` - Ingredient classification logic
- `backend/src/utils/environmentalImpact.ts` - Environmental impact assessment logic
- `backend/tests/scraper.test.ts` - Tests for scraping functionality
- `backend/tests/llm.test.ts` - Tests for LLM integration
- `backend/tests/ingredientAnalyzer.test.ts` - Tests for ingredient analysis
- `frontend/tests/SearchBar.test.tsx` - Tests for search component
- `frontend/tests/IngredientAnalysis.test.tsx` - Tests for analysis display
- `.gitignore` - Git ignore rules for Node.js and React project
- `frontend/package.json` - Frontend project configuration and dependencies
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/index.html` - HTML entry point
- `frontend/src/main.tsx` - React application entry point
- `frontend/src/index.css` - Global styles
- `backend/package.json` - Backend project configuration and dependencies
- `backend/tsconfig.json` - TypeScript configuration
- `backend/jest.config.js` - Jest testing configuration
- `backend/src/server.ts` - Express server entry point
- `frontend/.eslintrc.json` - Frontend ESLint configuration
- `frontend/.prettierrc` - Frontend Prettier configuration
- `backend/.eslintrc.json` - Backend ESLint configuration
- `backend/.prettierrc` - Backend Prettier configuration
- `frontend/jest.config.js` - Frontend Jest configuration
- `frontend/src/setupTests.ts` - Frontend test setup
- `frontend/src/App.test.tsx` - App component tests
- `backend/src/server.test.ts` - Server tests
- `README.md` - Project documentation and setup instructions
- `LICENSE` - MIT license file
- `backend/.env.example` - Example environment configuration

### Notes

- Unit tests should be placed alongside their corresponding implementation files
- Use `npx jest [optional/path/to/test/file]` to run tests
- Frontend tests should use React Testing Library
- Backend tests should use Jest with Supertest for API testing
- Use `npm run lint` to check for linting issues
- Use `npm run format` to format code with Prettier
- Use `npm run test:coverage` to generate test coverage reports

## Tasks

- [x] 1.0 Project Setup and Infrastructure
  - [x] 1.1 Initialize project repository with proper .gitignore
  - [x] 1.2 Set up frontend React project with TypeScript
  - [x] 1.3 Set up backend Express project with TypeScript
  - [x] 1.4 Configure development environment (ESLint, Prettier)
  - [x] 1.5 Set up testing framework (Jest, React Testing Library)
  - [x] 1.6 Create basic project documentation (README, setup instructions)

- [ ] 2.0 Sephora Product Search and Scraping
  - [x] 2.1 Implement Sephora product search endpoint
  - [x] 2.2 Create web scraping service for product details
  - [x] 2.3 Implement ingredient list extraction
  - [ ] 2.4 Add error handling for failed searches
  - [ ] 2.5 Implement rate limiting protection
  - [ ] 2.6 Add caching mechanism for frequently searched products

- [ ] 3.0 Ingredient Analysis System
  - [ ] 3.1 Set up LLM integration service
  - [ ] 3.2 Implement ingredient classification logic
  - [ ] 3.3 Create percentage calculation system
  - [ ] 3.4 Develop environmental impact assessment
  - [ ] 3.5 Implement ingredient breakdown formatting
  - [ ] 3.6 Add validation for classification accuracy

- [ ] 4.0 Frontend Development
  - [ ] 4.1 Create responsive layout structure
  - [ ] 4.2 Implement search bar component
  - [ ] 4.3 Develop ingredient analysis display
  - [ ] 4.4 Create percentage visualization component
  - [ ] 4.5 Add loading states and error messages
  - [ ] 4.6 Implement mobile responsiveness
  - [ ] 4.7 Add accessibility features

- [ ] 5.0 Testing and Validation
  - [ ] 5.1 Write unit tests for scraping functionality
  - [ ] 5.2 Create tests for LLM integration
  - [ ] 5.3 Implement frontend component tests
  - [ ] 5.4 Add integration tests for API endpoints
  - [ ] 5.5 Perform end-to-end testing
  - [ ] 5.6 Validate ingredient classification accuracy
  - [ ] 5.7 Test error handling and edge cases 