const https = require('https');
const querystring = require('querystring');

// === CONSTANTS === #
// No need to change these during the assessment!
const TARGET_API_KEY = "Bearer test-api-key-12345";
const BASE_URL = "https://cofactr.pythonanywhere.com";
const PRODUCTS_ENDPOINT = `${BASE_URL}/source_api/products/`;
const PRODUCT_DETAIL_ENDPOINT = `${BASE_URL}/source_api/products/`;  // + product_id
const INVENTORY_ENDPOINT = `${BASE_URL}/source_api/inventory-status/`;
const TARGET_IMPORT_ENDPOINT = `${BASE_URL}/target_api/import/`;
// === END CONSTANTS === #


/// === REQUEST FUNCTIONS === ###
// No need to edit these during the assessment!
// They should be equipped with whatever is required for successful completion

function makeGetRequest(url, params = null) {
    /**
     * Make a GET request to the given URL with optional parameters.
     */
    return new Promise((resolve, reject) => {
        if (params) {
            const queryString = querystring.stringify(params);
            url = `${url}?${queryString}`;
        }
        
        const options = {
            method: 'GET',
            rejectUnauthorized: false // Equivalent to SSL context in Python
        };
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        console.log(`Error parsing JSON: ${e.message}`);
                        reject(e);
                    }
                } else {
                    console.log(`HTTP Error: ${res.statusCode} - ${res.statusMessage}`);
                    reject(new Error(`HTTP Error: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', (e) => {
            console.log(`make_get_request: Error making request: ${e.message}`);
            reject(e);
        });
        
        req.end();
    });
}

function makePostRequest(url, data, headers = null) {
    /**
     * Make a POST request to the given URL with JSON data and optional headers.
     */
    return new Promise((resolve, reject) => {
        // Convert data to JSON
        const jsonData = JSON.stringify(data);
        
        // Create request options
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(jsonData)
            },
            rejectUnauthorized: false
        };
        
        // Add headers if provided
        if (headers) {
            for (const [key, value] of Object.entries(headers)) {
                options.headers[key] = value;
            }
        }
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsedData);
                    } else if (res.statusCode === 400) {
                        resolve(parsedData); // Return error data for 400 responses
                    } else {
                        console.log(`HTTP Error: ${res.statusCode} - ${res.statusMessage}`);
                        reject(new Error(`HTTP Error: ${res.statusCode}`));
                    }
                } catch (e) {
                    console.log(`Error parsing JSON: ${e.message}`);
                    reject(e);
                }
            });
        });
        
        req.on('error', (e) => {
            console.log(`make_post_request: Error making request: ${e.message}`);
            reject(e);
        });
        
        // Write data to request body
        req.write(jsonData);
        req.end();
    });
}
// === END REQUEST FUNCTIONS === #

// === API ENDPOINT FUNCTIONS === #
// Some of these might need edits to complete the assessment
// you can feel free to improve them however you like.

async function fetchProducts() {
    /**
     * Fetch multiple products from the products endpoint.
     */
    const params = {}; // TODO: Add params
    try {
        const response = await makeGetRequest(PRODUCTS_ENDPOINT, params);
        console.log(`fetch_products: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        console.log(`fetchProducts error: ${error.message}`);
        return null;
    }
}

async function fetchProductDetails(product_id) {
    /**
     * Fetch detailed information for a specific product.
     */
    const params = {}; // TODO: Add params
    try {
        const response = await makeGetRequest(`${PRODUCT_DETAIL_ENDPOINT}${product_id}/`, params);
        console.log(`fetch_product_details: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        console.log(`fetchProductDetails error: ${error.message}`);
        return null;
    }
}

async function fetchInventoryData(product_ids = []) {
    /**
     * Fetch inventory information for multiple products.
     */
    const params = {}; // TODO: Add product ids
    try {
        const response = await makeGetRequest(INVENTORY_ENDPOINT, params);
        console.log(`fetch_inventory_data: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        console.log(`fetchInventoryData error: ${error.message}`);
        return null;
    }
}

async function submitProductsToTarget(normalized_products) {
    /**
     * Submit normalized products to the target API.
     */
    const payload = {
        "products": normalized_products
    };
    
    try {
        const response = await makePostRequest(
            TARGET_IMPORT_ENDPOINT,
            payload,
        );
        console.log(`submit_products_to_target: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        console.log(`submitProductsToTarget error: ${error.message}`);
        return null;
    }
}

// === END API ENDPOINT FUNCTIONS === #

async function main() {
    // TODO: Fetch all products and normalize to match acceptable input with as much data as we can extrapolate

    const normalized_products = [{
        "productId": "XX-0000",
        "name": "Example Product Name",
        "description": "Example description",
        "category": "electronics",
        "price": {
            "amount": 99.99,
            "currency": "USD",
        },
        "inventory": {
            "available": 10,
            "reserved": 2,
        },
        "attributes": {
            "weight": {
                "value": 350,
                "unit": "g",
            },
            "dimensions": {
                "length": 100,
                "width": 50,
                "height": 25,
                "unit": "mm",
            }
        },
        "status": "active",
        "lastUpdated": "2024-10-12T08:30:15Z",
    }];
    
    // Submit normalized products to the target API
    if (normalized_products.length > 0) {
        console.log(`Submitting ${normalized_products.length} products to target API`);
        const result = await submitProductsToTarget(normalized_products);
        console.log(`Submission result: ${JSON.stringify(result)}`);
    } else {
        console.log("No products to submit");
    }
}

// Equivalent to Python's if __name__ == "__main__":
if (require.main === module) {
    main().catch(error => {
        console.error(`Error in main: ${error.message}`);
    });
}
