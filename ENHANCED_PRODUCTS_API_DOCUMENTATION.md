# Enhanced Products API Documentation

## Overview
The `/api/admin/products` API has been enhanced with comprehensive date-based filtering capabilities for both product creation and update dates.

## Enhanced Endpoint

### GET /api/admin/products

**Description:** Admin gets all products with pagination, search, and date filtering

**Authentication:** Required (JWT Token)

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | Number | No | Page number for pagination (default: 1) | `1` |
| `limit` | Number | No | Number of products per page (default: 10) | `12` |
| `search` | String | No | Search term for product title and keywords | `Samsung Galaxy S24 Ultra` |
| `createdFrom` | Date | No | Filter products created from this date (inclusive) | `2024-01-01` |
| `createdTo` | Date | No | Filter products created until this date (inclusive) | `2024-12-31` |
| `updatedFrom` | Date | No | Filter products updated from this date (inclusive) | `2024-06-01` |
| `updatedTo` | Date | No | Filter products updated until this date (inclusive) | `2024-12-31` |

## Date Format
All date parameters should be in `YYYY-MM-DD` format (ISO 8601 date format).

## API Examples

### 1. Basic Search with Pagination
```http
GET /api/admin/products?page=1&limit=12&search=Samsung+Galaxy+S24+Ultra
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 2. Filter by Creation Date Range
```http
GET /api/admin/products?createdFrom=2024-01-01&createdTo=2024-12-31
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 3. Filter by Update Date Range
```http
GET /api/admin/products?updatedFrom=2024-06-01&updatedTo=2024-12-31
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Combined Search with Date Filters
```http
GET /api/admin/products?search=Samsung&createdFrom=2024-01-01&createdTo=2024-06-30&updatedFrom=2024-06-01&updatedTo=2024-12-31
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 5. Products Created in Last 30 Days
```http
GET /api/admin/products?createdFrom=2024-11-01&createdTo=2024-12-01
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 6. Products Updated Today
```http
GET /api/admin/products?updatedFrom=2024-12-01&updatedTo=2024-12-01
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "title": "Samsung Galaxy S24 Ultra",
        "mrp": 129999,
        "srp": 119999,
        "description": "Latest flagship smartphone",
        "aiDescription": "AI-powered smartphone with advanced features",
        "category": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "Electronics",
          "slug": "electronics",
          "isActive": true
        },
        "subcategory": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Smartphones",
          "slug": "smartphones",
          "isActive": true
        },
        "subcategoryPath": [...],
        "categoryPath": [...],
        "mainImage": "https://example.com/image.jpg",
        "additionalImages": [...],
        "features": [...],
        "specifications": [...],
        "highlights": [...],
        "attributes": [...],
        "keywords": ["samsung", "galaxy", "smartphone"],
        "productUrl": "https://example.com/product",
        "vendorSite": "Samsung",
        "scrapingHistory": {...},
        "scrapingInfo": {...},
        "isActive": true,
        "profitMargin": "7.69",
        "createdBy": {...},
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-12-01T15:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "search": "Samsung Galaxy S24 Ultra",
      "createdFrom": "2024-01-01",
      "createdTo": "2024-12-31",
      "updatedFrom": null,
      "updatedTo": null
    }
  }
}
```

### Error Response (400) - Invalid Date Format
```json
{
  "success": false,
  "message": "Invalid createdFrom date format",
  "error": "createdFrom must be a valid date (YYYY-MM-DD)"
}
```

### Error Response (401) - Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "error": "Token required"
}
```

## Date Filtering Logic

### Creation Date Filtering
- `createdFrom`: Products created on or after this date
- `createdTo`: Products created on or before this date
- Both dates are inclusive
- Time is set to 00:00:00 for `createdFrom` and 23:59:59 for `createdTo`

### Update Date Filtering
- `updatedFrom`: Products updated on or after this date
- `updatedTo`: Products updated on or before this date
- Both dates are inclusive
- Time is set to 00:00:00 for `updatedFrom` and 23:59:59 for `updatedTo`

## Use Cases

### 1. Recent Products
Find products created in the last 30 days:
```http
GET /api/admin/products?createdFrom=2024-11-01&createdTo=2024-12-01
```

### 2. Recently Updated Products
Find products updated in the last week:
```http
GET /api/admin/products?updatedFrom=2024-11-24&updatedTo=2024-12-01
```

### 3. Quarterly Reports
Find products created in Q4 2024:
```http
GET /api/admin/products?createdFrom=2024-10-01&createdTo=2024-12-31
```

### 4. Search with Date Range
Find Samsung products created this year:
```http
GET /api/admin/products?search=Samsung&createdFrom=2024-01-01&createdTo=2024-12-31
```

### 5. Products Updated Today
Find products updated today:
```http
GET /api/admin/products?updatedFrom=2024-12-01&updatedTo=2024-12-01
```

## Performance Considerations

1. **Indexing**: Ensure proper database indexes on `createdAt` and `updatedAt` fields
2. **Date Range**: Large date ranges may impact performance
3. **Combined Filters**: Multiple filters work together efficiently
4. **Pagination**: Always use pagination for large result sets

## Error Handling

The API includes comprehensive error handling for:
- Invalid date formats
- Invalid date ranges
- Authentication errors
- Database errors
- Validation errors

## Testing

You can test the enhanced API using tools like Postman, curl, or any HTTP client:

```bash
# Test with search and date filters
curl -X GET "http://localhost:5000/api/admin/products?search=Samsung&createdFrom=2024-01-01&createdTo=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Migration Notes

This enhancement is backward compatible. Existing API calls without date parameters will continue to work as before. The new date filtering parameters are optional and can be used independently or in combination.
