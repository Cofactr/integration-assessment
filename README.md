# Integration Engineer Interview Challenge
You can choose to write this solution in any language you wish; however, JS or Python is preferred as your interviewer will have slightly more experience with those languages to help if needed. The goal of this interview is to take data across several GET endpoints, compile and normalize it into a sane format, and "import" them into a target API. A successful integration will be to run a repeatable script that "imports" all viable products from the source into the target without errors. You'll be evaluated on the general quality, efficiency, and readability of your solution.

**NOTE:** Do not try to overly optimize this for a real production integration. Your code should be efficient but this source API is intentionally bad and very well might lead to underoptimized request patterns. Work towards a solution first before getting caught up in suspiciously bad patterns.

## Source API
The only information you have on this is the endpoints themselves. Some exploration of the API might be required to fully understand what kind of data you are working with here.
#### Source Endpoints
`GET https://cofactr.pythonanywhere.com/source_api/products/?format_type=detailed|simple&page=int&limit=int`
`GET https://cofactr.pythonanywhere.com/source_api/products/<str>/?view_type=optional[technical]`
`GET https://cofactr.pythonanywhere.com/source_api/inventory-status/?ids=<str,str,str>`

## Target API
#### Target Endpoints
`POST https://cofactr.pythonanywhere.com/target_api/import/`

##### Authentication
Requires an API key in the header: `Authorization: Bearer {api_key}`
For the interview, use: `test-api-key-12345`

#### Request Format
```javascript
{
  "products": [
    {
      "productId": "string", // unique identifier (required)
      "name": "string", // required, max 100 chars
      "description": "string", // optional, max 500 chars
      "category": "string", // required, must be one of ["electronics", "clothing", "home", "food", "other"]
      "price": {
        "amount": "number", // required, positive decimal
        "currency": "string" // required, 3-letter currency code (e.g., "USD")
      },
      "inventory": {
        "available": "number", // required, non-negative integer
        "reserved": "number" // optional, defaults to 0
      },
      "attributes": {
        "weight": {
          "value": "number", // optional
          "unit": "string" // required if weight value provided ("g", "kg", "lb")
        },
        "dimensions": {
          "length": "number", // optional
          "width": "number", // optional
          "height": "number", // optional
          "unit": "string" // required if any dimension provided ("mm", "cm", "in")
        }
      },
      "status": "string", // required, one of ["active", "discontinued", "out_of_stock"]
      "lastUpdated": "string" // ISO-8601 date format (YYYY-MM-DDTHH:MM:SSZ)
    }
  ]
}
```
#### Response Format
SUCCESS [200 OK]
```javascript
{
  "success": true,
  "importedCount": 5, // number of products successfully imported
  "errors": [] // empty if all products were imported successfully
}
```
ERROR [400 BAD REQUEST]
```javascript
{
  "success": false,
  "importedCount": 0,
  "errors": [
    {
      "index": 2, // index of the failed product in the array
      "field": "price.amount", // field that caused the error
      "message": "Price amount must be a positive number" // description of the error
    }
  ]
}
```
#### Field Requirements
| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| productId | string | Yes | Must be unique |
| name | string | Yes | 1-100 characters |
| description | string | No | 0-500 characters |
| category | string | Yes | Must be one of: "electronics", "clothing", "home", "food", "other" |
| price.amount | number | Yes | Must be positive |
| price.currency | string | Yes | 3-letter currency code (e.g., "USD") |
| inventory.available | number | Yes | Non-negative integer |
| inventory.reserved | number | No | Non-negative integer, defaults to 0 |
| attributes.weight.value | number | No | Positive number |
| attributes.weight.unit | string | Conditional | Required if weight.value is provided; must be one of: "g", "kg", "lb" |
| attributes.dimensions.length | number | No | Positive number |
| attributes.dimensions.width | number | No | Positive number |
| attributes.dimensions.height | number | No | Positive number |
| attributes.dimensions.unit | string | Conditional | Required if any dimension is provided; must be one of: "mm", "cm", "in" |
| status | string | Yes | Must be one of: "active", "discontinued", "out_of_stock" |
| lastUpdated | string | Yes | ISO-8601 date format (YYYY-MM-DDTHH:MM:SSZ) |

#### Additional Requirements
- Request must contain at least 1 product
- Maximum of 5 products per import request
- All dates must be in UTC timezone
- All string fields should be trimmed of leading/trailing whitespace
