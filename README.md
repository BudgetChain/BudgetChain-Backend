# BudgetChain Backend

BudgetChain Backend is a NestJS-based project built with TypeScript that serves as the robust foundation for BudgetChain. This project is designed to provide a scalable and maintainable backend infrastructure, integrating essential modules like authentication, treasury, budget management, AI, blockchain interactions, reporting, and user management.

## Project Overview

- **Framework:** NestJS with TypeScript
- **Key Features:**  
  - Modular architecture with dedicated folders for config, modules (auth, treasury, budget, ai, blockchain, reporting, user), and shared utilities.
  - Integration of core dependencies for configuration management, database interaction (TypeORM with PostgreSQL), JWT-based authentication, and API documentation (Swagger).
  - Utility packages for validation, security, logging, and performance enhancements.

## Prerequisites

- Node.js (v14 or above)
- npm or yarn
- NestJS CLI (optional but recommended)

## Setup Instructions

1. **Project Setup:**
   - Clone the repository:
     ```bash
     git clone https://github.com/BudgetChain/BudgetChain-Backend.git
     cd BudgetChain-Backend
     ```
   - Alternatively, initialize a new NestJS project:
     ```bash
     nest new BudgetChain-Backend
     cd BudgetChain-Backend
     ```
   - Configure your TypeScript settings in `tsconfig.json` as needed.
   - Create a comprehensive `.gitignore` to exclude directories like `node_modules` and `dist`.
   - Initialize basic project documentation (this README serves as a starting point).

2. **Dependencies Installation:**
   - **Core Dependencies:**
     ```bash
     npm install @nestjs/config @nestjs/typeorm typeorm pg
     npm install @nestjs/jwt @nestjs/passport passport
     npm install @nestjs/swagger
     ```
   - **Utility Packages:**
     ```bash
     npm install class-validator class-transformer
     npm install helmet
     npm install compression
     npm install winston nest-winston
     ```

3. **Project Structure Setup:**
   - Organize your project as follows:
     ```
     src/
       ├── config/         # Configuration files and services
       ├── modules/        # Application modules
       │   ├── auth/       # Authentication module
       │   ├── treasury/   # Treasury management
       │   ├── budget/     # Budget management
       │   ├── ai/         # AI integrations
       │   ├── blockchain/# Blockchain interactions
       │   ├── reporting/  # Reporting and analytics
       │   └── user/       # User management
       └── shared/         # Shared utilities and helpers
     ```
   - Use the `shared/` folder for common utilities and helper functions.
   - Create module-specific templates within each module directory for consistency.

4. **Running the Application:**
   - Start the development server:
     ```bash
     npm run start:dev
     ```
   - The application will be accessible at `http://localhost:3000`.

## Additional Information

- For more details on NestJS, visit the [NestJS Documentation](https://docs.nestjs.com/).
- Please refer to the issues section for troubleshooting or to report any problems.

## License

This project is licensed under the MIT License.
