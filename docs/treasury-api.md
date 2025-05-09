# Treasury API Documentation

## Overview
The Treasury module provides several endpoints for managing financial operations within BudgetChain.

### Endpoints

**GET /treasury**
- Description: Retrieve all treasury entities
- Response: An array of treasury details

**GET /treasury/:id**
- Description: Retrieve treasury by ID
- Parameters: 
  - id (string): Treasury ID
- Response: Treasury entity details

**POST /treasury**
- Description: Create a new treasury entity
- Parameters: 
  - name (string): Name of the treasury
  - initialFund (number): Initial funding amount
- Response: The created treasury entity

**PUT /treasury/:id**
- Description: Update a treasury entity
- Parameters: 
  - id (string): Treasury ID
- Response: Updated treasury entity

**DELETE /treasury/:id**
- Description: Remove a treasury entity
- Parameters: 
  - id (string): Treasury ID
- Response: Confirmation of deletion