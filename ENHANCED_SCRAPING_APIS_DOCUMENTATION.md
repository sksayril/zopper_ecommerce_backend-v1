# Enhanced Scraping APIs Documentation

## Overview

This document describes the enhanced scraping APIs that have been added to the Zopper E-commerce Backend. These APIs provide comprehensive tracking of product scraping activities with detailed statistics and product counts.

## New Endpoints

### 1. GET /api/scrape-logs

Retrieves scraping logs with enhanced product counts and statistics.

#### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 20 | Number of items per page |
| platform | string | - | Filter by platform (flipkart, amazon, etc.) |
| status | string | - | Filter by status (pending, completed, failed, etc.) |
| category | string | - | Filter by category |
| startDate | string | - | Filter by start date (ISO format) |
| endDate | string | - | Filter by end date (ISO format) |
| search | string | - | Search in product types, categories, titles, and notes |

#### Example Request

```bash
GET /api/scrape-logs?page=1&limit=20&platform=flipkart&category=Electronics
```

#### Response Structure

```json
{
  "success": true,
  "data": [
    {
      "_id": "68e97b04fe55011b2bac21c6",
      "when": "2025-10-10T21:30:44.344Z",
      "platform": "flipkart",
      "type": "product",
      "url": "https://www.flipkart.com/...",
      "category": "Electronics",
      "status": "success",
      "action": "Manual",
      "createdAt": "2025-10-10T21:30:44.694Z",
      "updatedAt": "2025-10-10T21:30:50.517Z",
      "__v": 0,
      "totalProducts": 10,
      "scrapedProducts": 8,
      "failedProducts": 2,
      "duration": 5000,
      "progress": {
        "current": 8,
        "total": 10,
        "percentage": 80
      },
      "errorMessage": null,
      "retryCount": 0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 32,
    "itemsPerPage": 20
  },
  "statistics": {
    "categoryStats": [
      {
        "category": "Electronics",
        "totalSessions": 15,
        "totalProducts": 150,
        "successfulProducts": 120,
        "failedProducts": 30,
        "averageSuccessRate": 80.0
      }
    ],
    "platformStats": [
      {
        "platform": "flipkart",
        "totalSessions": 20,
        "totalProducts": 200,
        "successfulProducts": 160,
        "failedProducts": 40
      }
    ]
  }
}
```

### 2. POST 
https://z7s50012-3333.inc1.devtunnels.ms/api/scrape-logs

Creates a new scraping log entry.

#### Request Body

```json
{
  "platform": "flipkart",
  "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
  "productType": "Smartphones",
  "category": "Electronics",
  "notes": "Scraping mobile phones from Flipkart",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.100",
  "totalProducts": 10,
  "scrapedProducts": 8,
  "failedProducts": 2
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
- `totalProducts`: Total number of products (default: 0)
- `scrapedProducts`: Number of successfully scraped products (default: 0)
- `failedProducts`: Number of failed products (default: 0)

#### Response

```json
{
  "success": true,
  "message": "Scraping log created successfully",
  "data": {
    "scrapingLog": {
      "id": "68e97b04fe55011b2bac21c6",
      "platform": "flipkart",
      "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
      "productType": "Smartphones",
      "category": "Electronics",
      "status": "completed",
      "totalProducts": 10,
      "scrapedProducts": 8,
      "failedProducts": 2,
      "createdAt": "2025-10-10T21:30:44.694Z"
    }
  }
}
```

### 3. POST /api/flipkart/scrape-product

Scrapes a single product from Flipkart and tracks it.

#### Request Body

```json
{
  "productUrl": "https://www.flipkart.com/samsung-galaxy-s21/p/itm123456",
  "category": "Electronics",
  "productType": "product",
  "notes": "Single product scraping test"
}
```

#### Required Fields

- `productUrl`: URL of the product to scrape (must be valid HTTP/HTTPS URL)
- `category`: Category of the product

#### Optional Fields

- `productType`: Type of product (default: "product")
- `notes`: Additional notes about the scraping

#### Response

```json
{
  "success": true,
  "message": "Product scraped successfully from Flipkart",
  "data": {
    "scrapingSession": {
      "id": "68e97b04fe55011b2bac21c6",
      "platform": "flipkart",
      "productUrl": "https://www.flipkart.com/samsung-galaxy-s21/p/itm123456",
      "category": "Electronics",
      "status": "completed",
      "totalProducts": 1,
      "scrapedProducts": 1,
      "failedProducts": 0,
      "duration": "2s",
      "scrapedData": {
        "productTitles": ["Sample Product from Flipkart"],
        "productUrls": ["https://www.flipkart.com/samsung-galaxy-s21/p/itm123456"],
        "productPrices": [999],
        "productImages": ["https://example.com/product-image.jpg"]
      }
    },
    "productData": {
      "title": "Sample Product from Flipkart",
      "price": 999,
      "image": "https://example.com/product-image.jpg"
    }
  }
}
```

## Key Features

### 1. Enhanced Product Tracking

- **Total Products**: Tracks the total number of products in a scraping session
- **Successful Products**: Counts successfully scraped products
- **Failed Products**: Counts products that failed to scrape
- **Progress Tracking**: Shows current progress with percentage completion

### 2. Category-Based Statistics

- **Category Stats**: Aggregated statistics by category
- **Success Rates**: Average success rates per category
- **Product Counts**: Total products scraped per category

### 3. Platform-Based Statistics

- **Platform Stats**: Aggregated statistics by platform
- **Performance Metrics**: Success and failure rates per platform
- **Session Counts**: Number of scraping sessions per platform

### 4. Advanced Filtering

- **Date Range Filtering**: Filter by start and end dates
- **Platform Filtering**: Filter by specific platforms
- **Category Filtering**: Filter by product categories
- **Status Filtering**: Filter by scraping status
- **Search Functionality**: Search across multiple fields

### 5. Pagination Support

- **Page-based Pagination**: Navigate through large datasets
- **Configurable Limits**: Set custom page sizes
- **Total Counts**: Get total item counts for pagination

## Error Handling

All endpoints include comprehensive error handling:

### Common Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Validation Errors

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

## Usage Examples

### 1. Get All Scraping Logs

```bash
curl -X GET "http://localhost:3000/api/scrape-logs"
```

### 2. Get Filtered Scraping Logs

```bash
curl -X GET "http://localhost:3000/api/scrape-logs?platform=flipkart&category=Electronics&limit=10"
```

### 3. Create a New Scraping Log

```bash
curl -X POST "http://localhost:3000/api/scrape-logs" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "flipkart",
    "scrapedUrl": "https://www.flipkart.com/electronics/mobiles",
    "productType": "Smartphones",
    "category": "Electronics",
    "totalProducts": 10,
    "scrapedProducts": 8,
    "failedProducts": 2
  }'
```

### 4. Scrape a Single Product

```bash
curl -X POST "http://localhost:3000/api/flipkart/scrape-product" \
  -H "Content-Type: application/json" \
  -d '{
    "productUrl": "https://www.flipkart.com/samsung-galaxy-s21/p/itm123456",
    "category": "Electronics"
  }'
```

## Database Schema

The enhanced APIs use the existing `ScrapingHistory` model with the following key fields:

- `platform`: Platform being scraped
- `scrapedUrl`: URL being scraped
- `productType`: Type of products
- `category`: Product category
- `status`: Scraping status
- `totalProductsScraped`: Total products in session
- `successfulProducts`: Successfully scraped products
- `failedProducts`: Failed products
- `scrapingMetadata`: Timing and technical details
- `scrapedData`: Actual scraped product data
- `errorInfo`: Error information if any

## Testing

A comprehensive test file `test-enhanced-scraping-apis.js` is provided to test all the new endpoints. To run the tests:

```bash
node test-enhanced-scraping-apis.js
```

## Integration Notes

1. **Route Configuration**: The new routes are mounted at `/api` level to avoid conflicts with existing admin routes
2. **Authentication**: Currently set to public access, but can be easily modified to require authentication
3. **Data Validation**: Comprehensive input validation for all endpoints
4. **Error Handling**: Consistent error response format across all endpoints
5. **Performance**: Optimized database queries with proper indexing

## Future Enhancements

1. **Real-time Scraping**: Implement actual web scraping logic
2. **Authentication**: Add proper authentication and authorization
3. **Rate Limiting**: Implement rate limiting for scraping endpoints
4. **Caching**: Add caching for frequently accessed data
5. **Webhooks**: Add webhook support for real-time notifications
6. **Analytics**: Enhanced analytics and reporting features
