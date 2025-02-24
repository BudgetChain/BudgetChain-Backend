# Contributing to BudgetChain Backend

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Code Style Guidelines](#code-style-guidelines)
4. [Git Workflow](#git-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Code Review Process](#code-review-process)
8. [Security Guidelines](#security-guidelines)


## Getting Started
#### Project Overview:
BudgetChain Backend is a NestJS-based TypeScript project providing scalable infrastructure for BudgetChain’s core services, including authentication, treasury, budget management, AI, blockchain interactions, reporting, and user management.
#### Prerequisites:
- Node.js (v14 or above)
- npm or yarn
- NestJS CLI (optional but recommended)

#### Setup Instructins:
1. Clone the repository:
```
git clone https://github.com/BudgetChain/BudgetChain-Backend.git
cd BudgetChain-Backend
```
2. Install dependencies:
```
npm install
```
3. Configure environment variables by creating a `.env ` file based on `.env.example`

4. Start the development server:
```
npm run start:dev
```
5. The application runs at http://localhost:3000.

## Development Environment
```
src/
  ├── config/         # Configuration files and services
  ├── modules/        # Application modules
  │   ├── auth/       # Authentication module
  │   ├── treasury/   # Treasury management
  │   ├── budget/     # Budget management
  │   ├── ai/         # AI integrations
  │   ├── blockchain/ # Blockchain interactions
  │   ├── reporting/  # Reporting and analytics
  │   └── user/       # User management
  └── shared/         # Shared utilities and helpers
```
## Running Services:
- PostgreSQL Database
- Swagger for API Documentation


## Code Style Guidelines
- Use TypeScript features extensively.
- Follow NestJS’s modular architecture.
- Use Prettier and ESLint for code formatting.
- Maintain consistency in naming conventions and folder structure.

## Git Workflow
Branching Strategy:
1. `main`: Production-ready code.
2. `develop`: Staging branch for testing new features.
3. `feature/*`: New feature development.
4. `bugfix/*`: Bug fixes.

Commit Messages: Use conventional commits:
```
feat: Add new treasury management feature
fix: Resolve budget calculation bug
chore: Update dependencies
```
Pull Requests:
- Ensure code builds without errors.
- Add unit tests for new features.
- Link related issues in the PR description.

## Testing Guidelines
Testing Framework: Jest
Test Types:

- Unit Tests: Test individual functions.

- Integration Tests: Test interactions between modules.

Running Tests:
```
npm run test
```

## Documentation
- Use Swagger for API documentation.
- Add module-level documentation in src/modules/{module}/README.md.
- Keep the README up-to-date.

## Code Review Proces
- Ensure code adheres to style guidelines.
- Check for security vulnerabilities.
- Review performance and optimization.

## Security Guidelines
- Use environment variables for sensitive data.
- Implement JWT-based authentication.
- Validate input using `class-validator`.
- Use `helmet` and `compression` for security and performance.
