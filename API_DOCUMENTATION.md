# AutoPrompt API Documentation

This document provides information about the AutoPrompt API endpoints for generating code directly from prompts.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### Health Check

```
GET /health
```

Check if the API is running.

**Response**

```json
{
  "status": "ok",
  "mongodb": "connected",
  "time": "2023-06-01T12:00:00.000Z"
}
```

### Generate Code from Prompt

```
POST /projects/generate-code
```

Generate code based on a prompt and save it to the specified path.

**Request Body**

| Field       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| prompt      | string | Yes      | The prompt describing what to generate |
| name        | string | No       | Project name (default: timestamp-based name) |
| outputPath  | string | No       | Full path where the project should be generated (default: from environment variable) |
| projectType | string | No       | Type of project ('api', 'react', etc.) to help with generation |

**Example Request**

```json
{
  "prompt": "Create a simple Express API with two endpoints: /users and /products. Include proper error handling and documentation.",
  "name": "express-api-demo",
  "outputPath": "C:/Projects/express-api-demo",
  "projectType": "api"
}
```

**Example Response**

```json
{
  "success": true,
  "projectName": "express-api-demo",
  "path": "C:/Projects/express-api-demo",
  "id": "60c72b2b9b1d8f2a3c8e4567",
  "files": [
    "C:/Projects/express-api-demo/package.json",
    "C:/Projects/express-api-demo/index.js",
    "C:/Projects/express-api-demo/README.md",
    "C:/Projects/express-api-demo/.gitignore"
  ],
  "message": "Project generated successfully at C:/Projects/express-api-demo"
}
```

### Get All Applications

```
GET /api/apps
```

Retrieve all generated applications.

**Query Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| page      | number | No       | Page number for pagination (default: 1) |
| limit     | number | No       | Number of items per page (default: 10) |
| sort      | string | No       | JSON string specifying sort field and order |
| search    | string | No       | Search term to filter results |

**Example Response**

```json
{
  "apps": [
    {
      "_id": "60c72b2b9b1d8f2a3c8e4567",
      "title": "express-api-demo",
      "description": "Generated via API from prompt",
      "path": "C:/Projects/express-api-demo",
      "status": "generated",
      "languages": ["JavaScript"],
      "frameworks": ["Express"],
      "createdAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1,
    "isFiltered": false
  }
}
```

## Using the API with Postman

1. Import the Postman collection from the `postman` directory
2. Set the environment variables if needed
3. Use the pre-configured requests to test the API

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- 400: Bad Request - Missing required fields or invalid input
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error
