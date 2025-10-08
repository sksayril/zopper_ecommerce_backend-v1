# Scraping History API Documentation

## Overview

The Scraping History API provides comprehensive functionality for managing product scraping sessions, tracking scraping performance, and maintaining detailed records of scraped data from various e-commerce platforms.

## Base URL
```
/api/admin/scraping
```

## Authentication
All endpoints require admin authentication. Include the admin JWT token in the Authorization header:
```
Authorization: Bearer <admin_jwt_token>
```

---

## Endpoints

### 1. Start Scraping Session

**POST** `/api/admin/scraping/start`

Creates a new scraping session to track product scraping activities.

#### Request Body
```json
{
  "platform": "flipkart",
  "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
  "productType": "Smartphones",
  "category": "Electronics",
  "notes": "Scraping mobile phones from Flipkart",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "ipAddress": "192.168.1.100"
}
```

#### Required Fields
- `platform`: Platform being scraped (flipkart, amazon, myntra, nykaa, ajio, meesho, snapdeal, paytm, other)
- `scrapedUrl`: URL being scraped (must be valid HTTP/HTTPS URL)
- `productType`: Type of products being scraped
- `category`: Category of products being scraped

#### Optional Fields
- `notes`: Additional notes about the scraping session
- `userAgent`: User agent string used for scraping
- `ipAddress`: IP address of the scraping request

#### Response
```json
{
  "success": true,
  "message": "Scraping session started successfully",
  "data": {
    "scrapingSession": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "platform": "flipkart",
      "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
      "productType": "Smartphones",
      "category": "Electronics",
      "status": "pending",
      "startTime": "2024-01-15T10:30:00.000Z",
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "notes": "Scraping mobile phones from Flipkart"
    }
  }
}
```

---

### 2. Update Scraping Session

**POST** `/api/admin/scraping/:id/update`

Updates an existing scraping session with results, status changes, or additional data.

#### URL Parameters
- `id`: Scraping session ID

#### Request Body
```json
{
  "status": "completed",
  "totalProductsScraped": 150,
  "successfulProducts": 145,
  "failedProducts": 5,
  "scrapedData": {
    "productTitles": ["iPhone 15", "Samsung Galaxy S24", "OnePlus 12"],
    "productUrls": ["https://flipkart.com/iphone-15", "https://flipkart.com/samsung-s24"],
    "productPrices": [79999, 89999, 59999],
    "productImages": ["https://img.flipkart.com/iphone15.jpg"]
  },
  "errorInfo": {
    "hasError": false,
    "errorMessage": "",
    "errorCode": "",
    "errorDetails": null
  },
  "notes": "Scraping completed successfully with 96.7% success rate"
}
```

#### Optional Fields
- `status`: Session status (pending, in_progress, completed, failed, partial)
- `totalProductsScraped`: Total number of products attempted to scrape
- `successfulProducts`: Number of successfully scraped products
- `failedProducts`: Number of failed scraping attempts
- `scrapedData`: Object containing arrays of scraped product data
- `errorInfo`: Error information if scraping failed
- `notes`: Additional notes

#### Response
```json
{
  "success": true,
  "message": "Scraping session updated successfully",
  "data": {
    "scrapingSession": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "platform": "flipkart",
      "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
      "productType": "Smartphones",
      "category": "Electronics",
      "status": "completed",
      "totalProductsScraped": 150,
      "successfulProducts": 145,
      "failedProducts": 5,
      "successRate": "96.67",
      "failureRate": "3.33",
      "startTime": "2024-01-15T10:30:00.000Z",
      "endTime": "2024-01-15T10:45:00.000Z",
      "duration": "15m 0s",
      "scrapedData": {
        "productTitles": ["iPhone 15", "Samsung Galaxy S24", "OnePlus 12"],
        "productUrls": ["https://flipkart.com/iphone-15", "https://flipkart.com/samsung-s24"],
        "productPrices": [79999, 89999, 59999],
        "productImages": ["https://img.flipkart.com/iphone15.jpg"]
      },
      "errorInfo": {
        "hasError": false,
        "errorMessage": "",
        "errorCode": "",
        "errorDetails": null
      },
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "notes": "Scraping completed successfully with 96.7% success rate",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:45:00.000Z"
    }
  }
}
```

---

### 3. Add Product to Scraping Session

**POST** `/api/admin/scraping/:id/add-product`

Adds a scraped product to an existing scraping session.

#### URL Parameters
- `id`: Scraping session ID

#### Request Body
```json
{
  "productId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "productTitle": "iPhone 15 Pro Max",
  "productUrl": "https://www.flipkart.com/iphone-15-pro-max",
  "productPrice": 119999,
  "productImage": "https://img.flipkart.com/iphone15promax.jpg",
  "isSuccessful": true
}
```

#### Required Fields
- `productTitle`: Title of the scraped product
- `productUrl`: URL of the scraped product

#### Optional Fields
- `productId`: ID of the product in the database (if already created)
- `productPrice`: Price of the product
- `productImage`: Image URL of the product
- `isSuccessful`: Whether the scraping was successful (default: true)

#### Response
```json
{
  "success": true,
  "message": "Product added to scraping session successfully",
  "data": {
    "scrapingSession": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "totalProductsScraped": 151,
      "successfulProducts": 146,
      "failedProducts": 5,
      "successRate": "96.69",
      "failureRate": "3.31"
    },
    "addedProduct": {
      "title": "iPhone 15 Pro Max",
      "url": "https://www.flipkart.com/iphone-15-pro-max",
      "price": 119999,
      "image": "https://img.flipkart.com/iphone15promax.jpg",
      "isSuccessful": true
    }
  }
}
```

---

### 4. Get All Scraping Sessions

**GET** `/api/admin/scraping`

Retrieves all scraping sessions with pagination and filtering options.

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `platform`: Filter by platform (flipkart, amazon, myntra, etc.)
- `status`: Filter by status (pending, in_progress, completed, failed, partial)
- `productType`: Filter by product type
- `category`: Filter by category
- `startDate`: Filter sessions started after this date (ISO format)
- `endDate`: Filter sessions started before this date (ISO format)
- `search`: Search in product types, categories, titles, and notes

#### Example Request
```
GET /api/admin/scraping?page=1&limit=10&platform=flipkart&status=completed&startDate=2024-01-01&endDate=2024-01-31
```

#### Response
```json
{
  "success": true,
  "message": "Scraping sessions retrieved successfully",
  "data": {
    "scrapingSessions": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "platform": "flipkart",
        "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
        "productType": "Smartphones",
        "category": "Electronics",
        "status": "completed",
        "totalProductsScraped": 150,
        "successfulProducts": 145,
        "failedProducts": 5,
        "successRate": "96.67",
        "failureRate": "3.33",
        "startTime": "2024-01-15T10:30:00.000Z",
        "endTime": "2024-01-15T10:45:00.000Z",
        "duration": "15m 0s",
        "errorInfo": {
          "hasError": false,
          "errorMessage": "",
          "errorCode": "",
          "errorDetails": null
        },
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "notes": "Scraping completed successfully",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSessions": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 5. Get Single Scraping Session

**GET** `/api/admin/scraping/:id`

Retrieves detailed information about a specific scraping session.

#### URL Parameters
- `id`: Scraping session ID

#### Response
```json
{
  "success": true,
  "message": "Scraping session retrieved successfully",
  "data": {
    "scrapingSession": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "platform": "flipkart",
      "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
      "productType": "Smartphones",
      "category": "Electronics",
      "status": "completed",
      "totalProductsScraped": 150,
      "successfulProducts": 145,
      "failedProducts": 5,
      "successRate": "96.67",
      "failureRate": "3.33",
      "startTime": "2024-01-15T10:30:00.000Z",
      "endTime": "2024-01-15T10:45:00.000Z",
      "duration": "15m 0s",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "ipAddress": "192.168.1.100",
      "scrapedData": {
        "productTitles": ["iPhone 15", "Samsung Galaxy S24", "OnePlus 12"],
        "productUrls": ["https://flipkart.com/iphone-15", "https://flipkart.com/samsung-s24"],
        "productPrices": [79999, 89999, 59999],
        "productImages": ["https://img.flipkart.com/iphone15.jpg"]
      },
      "errorInfo": {
        "hasError": false,
        "errorMessage": "",
        "errorCode": "",
        "errorDetails": null
      },
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "notes": "Scraping completed successfully",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:45:00.000Z"
    }
  }
}
```

---

### 6. Get Scraping Statistics

**GET** `/api/admin/scraping/stats/overview`

Retrieves comprehensive statistics about scraping activities.

#### Query Parameters
- `platform`: Filter statistics by platform
- `startDate`: Filter statistics from this date (ISO format)
- `endDate`: Filter statistics to this date (ISO format)

#### Example Request
```
GET /api/admin/scraping/stats/overview?platform=flipkart&startDate=2024-01-01&endDate=2024-01-31
```

#### Response
```json
{
  "success": true,
  "message": "Scraping statistics retrieved successfully",
  "data": {
    "overview": {
      "totalScrapingSessions": 25,
      "totalProductsScraped": 3750,
      "totalSuccessfulProducts": 3625,
      "totalFailedProducts": 125,
      "averageSuccessRate": 96.67,
      "averageDuration": 1800000
    },
    "platformStats": [
      {
        "platform": "flipkart",
        "totalSessions": 15,
        "totalProductsScraped": 2250,
        "totalSuccessfulProducts": 2175,
        "totalFailedProducts": 75,
        "averageSuccessRate": 96.67
      },
      {
        "platform": "amazon",
        "totalSessions": 10,
        "totalProductsScraped": 1500,
        "totalSuccessfulProducts": 1450,
        "totalFailedProducts": 50,
        "averageSuccessRate": 96.67
      }
    ],
    "statusStats": [
      {
        "status": "completed",
        "count": 20
      },
      {
        "status": "failed",
        "count": 3
      },
      {
        "status": "in_progress",
        "count": 2
      }
    ],
    "recentSessions": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "platform": "flipkart",
        "productType": "Smartphones",
        "category": "Electronics",
        "status": "completed",
        "totalProductsScraped": 150,
        "successfulProducts": 145,
        "startTime": "2024-01-15T10:30:00.000Z",
        "createdBy": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Admin User"
        }
      }
    ]
  }
}
```

---

### 7. Delete Scraping Session

**DELETE** `/api/admin/scraping/:id`

Deletes a scraping session and removes its references from associated products.

#### URL Parameters
- `id`: Scraping session ID

#### Response
```json
{
  "success": true,
  "message": "Scraping session deleted successfully",
  "data": {
    "deletedSession": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "platform": "flipkart",
      "productType": "Smartphones",
      "category": "Electronics",
      "totalProductsScraped": 150
    }
  }
}
```

---

## Product API Integration

### Updated Product Creation

When creating products, you can now include scraping history information:

#### Request Body (Product Creation)
```json
{
  "title": "iPhone 15 Pro Max",
  "mrp": 119999,
  "srp": 109999,
  "description": "Latest iPhone with advanced features",
  "mainImage": "https://img.flipkart.com/iphone15promax.jpg",
  "categoryId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "subcategoryId": "64f8a1b2c3d4e5f6a7b8c9d4",
  "productUrl": "https://www.flipkart.com/iphone-15-pro-max",
  "vendorSite": "flipkart",
  "scrapingHistoryId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "scrapingInfo": {
    "wasScraped": true,
    "scrapedFrom": {
      "platform": "flipkart",
      "url": "https://www.flipkart.com/iphone-15-pro-max",
      "scrapedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### Updated Product Response

Product responses now include scraping information:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "title": "iPhone 15 Pro Max",
      "mrp": 119999,
      "srp": 109999,
      "productUrl": "https://www.flipkart.com/iphone-15-pro-max",
      "vendorSite": "flipkart",
      "scrapingHistory": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "platform": "flipkart",
        "productType": "Smartphones",
        "category": "Electronics",
        "status": "completed",
        "totalProductsScraped": 150,
        "successfulProducts": 145
      },
      "scrapingInfo": {
        "wasScraped": true,
        "scrapedFrom": {
          "platform": "flipkart",
          "url": "https://www.flipkart.com/iphone-15-pro-max",
          "scrapedAt": "2024-01-15T10:35:00.000Z"
        }
      },
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

---

## Error Responses

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid platform",
  "error": "Platform must be one of: flipkart, amazon, myntra, nykaa, ajio, meesho, snapdeal, paytm, other"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Scraping session not found",
  "error": "Scraping session does not exist"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while starting scraping session",
  "error": "Scraping session creation failed"
}
```

---

## Data Models

### ScrapingHistory Model

```javascript
{
  _id: ObjectId,
  productId: ObjectId, // Reference to Product
  platform: String, // flipkart, amazon, myntra, etc.
  scrapedUrl: String, // URL that was scraped
  productType: String, // Type of products scraped
  category: String, // Category of products scraped
  status: String, // pending, in_progress, completed, failed, partial
  totalProductsScraped: Number,
  successfulProducts: Number,
  failedProducts: Number,
  scrapingMetadata: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in milliseconds
    userAgent: String,
    ipAddress: String
  },
  errorInfo: {
    hasError: Boolean,
    errorMessage: String,
    errorCode: String,
    errorDetails: Mixed
  },
  scrapedData: {
    productTitles: [String],
    productUrls: [String],
    productPrices: [Number],
    productImages: [String]
  },
  createdBy: {
    id: ObjectId, // Reference to Admin
    name: String,
    email: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model Updates

```javascript
{
  // ... existing fields ...
  scrapingHistoryId: ObjectId, // Reference to ScrapingHistory
  scrapingInfo: {
    wasScraped: Boolean,
    scrapedFrom: {
      platform: String,
      url: String,
      scrapedAt: Date
    }
  }
}
```

---

## Usage Examples

### Complete Scraping Workflow

1. **Start Scraping Session**
```bash
curl -X POST http://localhost:3000/api/admin/scraping/start \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "flipkart",
    "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
    "productType": "Smartphones",
    "category": "Electronics",
    "notes": "Scraping mobile phones from Flipkart"
  }'
```

2. **Add Products to Session**
```bash
curl -X POST http://localhost:3000/api/admin/scraping/64f8a1b2c3d4e5f6a7b8c9d0/add-product \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "iPhone 15 Pro Max",
    "productUrl": "https://www.flipkart.com/iphone-15-pro-max",
    "productPrice": 119999,
    "productImage": "https://img.flipkart.com/iphone15promax.jpg",
    "isSuccessful": true
  }'
```

3. **Update Session Status**
```bash
curl -X POST http://localhost:3000/api/admin/scraping/64f8a1b2c3d4e5f6a7b8c9d0/update \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "totalProductsScraped": 150,
    "successfulProducts": 145,
    "failedProducts": 5,
    "notes": "Scraping completed successfully"
  }'
```

4. **Create Product with Scraping History**
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 15 Pro Max",
    "mrp": 119999,
    "srp": 109999,
    "mainImage": "https://img.flipkart.com/iphone15promax.jpg",
    "categoryId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "subcategoryId": "64f8a1b2c3d4e5f6a7b8c9d4",
    "productUrl": "https://www.flipkart.com/iphone-15-pro-max",
    "vendorSite": "flipkart",
    "scrapingHistoryId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "scrapingInfo": {
      "wasScraped": true,
      "scrapedFrom": {
        "platform": "flipkart",
        "url": "https://www.flipkart.com/iphone-15-pro-max",
        "scrapedAt": "2024-01-15T10:35:00.000Z"
      }
    }
  }'
```

---

## Best Practices

1. **Session Management**: Always start a scraping session before beginning scraping activities
2. **Error Handling**: Update sessions with error information when scraping fails
3. **Data Validation**: Validate all scraped data before adding to sessions
4. **Performance**: Use pagination when retrieving large numbers of scraping sessions
5. **Security**: Always use HTTPS for scraping URLs and validate input data
6. **Monitoring**: Regularly check scraping statistics to monitor performance
7. **Cleanup**: Delete old or failed scraping sessions to maintain database performance

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per admin user
- 1000 requests per hour per admin user

---

## Support

For technical support or questions about the Scraping History API, please contact the development team or refer to the main API documentation.
