import urllib.request
import urllib.parse
import json
import ssl

# === CONSTANTS === #
# No need to change these during the assessment!
TARGET_API_KEY = "Bearer test-api-key-12345"
BASE_URL = "https://cofactr.pythonanywhere.com"
PRODUCTS_ENDPOINT = f"{BASE_URL}/source_api/products/"
PRODUCT_DETAIL_ENDPOINT = f"{BASE_URL}/source_api/products/"  # + product_id
INVENTORY_ENDPOINT = f"{BASE_URL}/source_api/inventory-status/"
TARGET_IMPORT_ENDPOINT = f"{BASE_URL}/target_api/import/"
# === END CONSTANTS === #


### === REQUEST FUNCTIONS === ###
# No need to edit these during the assessment!
# They should be equipped with whatever is required for successful completeion
ssl_context = ssl.create_default_context()

def make_get_request(url, params=None):
    """Make a GET request to the given URL with optional parameters."""
    if params:
        query_string = urllib.parse.urlencode(params)
        url = f"{url}?{query_string}"
    try:
        request = urllib.request.Request(url)
        with urllib.request.urlopen(request, context=ssl_context) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}")
        return None
    except Exception as e:
        print(f"make_get_request: Error making request: {str(e)}")
        return None

# Helper function to make a POST request
def make_post_request(url, data, headers=None):
    """Make a POST request to the given URL with JSON data and optional headers."""
    try:
        # Convert data to JSON
        json_data = json.dumps(data).encode('utf-8')
        
        # Create request
        request = urllib.request.Request(url, data=json_data, method="POST")
        
        # Add headers
        request.add_header('Content-Type', 'application/json')
        if headers:
            for key, value in headers.items():
                request.add_header(key, value)
        
        # Make request
        with urllib.request.urlopen(request, context=ssl_context) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}")
        if e.code == 400:
            error_data = e.read().decode('utf-8')
            return json.loads(error_data)
        return None
    except Exception as e:
        print(f"make_post_request: Error making request: {str(e)}")
        return None
# === END REQUEST FUNCTIONS === #

# === API ENDPOINT FUNCTIONS === #
# Some of these might need edits to complete the assessment
# you can feel free to improve them however you like.

def fetch_products():
    """Fetch multiple products from the products endpoint."""
    params = {} # TODO: Add params
    response = make_get_request(
        PRODUCTS_ENDPOINT, 
        params=params,
    )
    print(f"fetch_products: {response}")
    return response

def fetch_product_details(product_id):
    """Fetch detailed information for a specific product."""
    params = {} # TODO: Add params
    response = make_get_request(f"{PRODUCT_DETAIL_ENDPOINT}{product_id}/", params=params)
    print(f"fetch_product_details: {response}")
    return response

def fetch_inventory_data(product_ids=[]):
    """Fetch inventory information for multiple products."""
    params = {} #  TODO: Add product ids
    response = make_get_request(INVENTORY_ENDPOINT, params=params)
    print(f"fetch_inventory_data: {response}")
    return response

def submit_products_to_target(normalized_products):
    """Submit normalized products to the target API."""

    payload = {
        "products": normalized_products
    }
    
    response = make_post_request(
        TARGET_IMPORT_ENDPOINT,
        data=payload,
    )
    print(f"submit_products_to_target: {response}")
    return response

# === END API ENDPOINT FUNCTIONS === #

def main():

    # TODO: Fetch all products and normalize to match acceptable input with as much data as we can extrapolate

    normalized_products = [{
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
    }]
    
    # Submit normalized products to the target API
    if normalized_products:
        print(f"Submitting {len(normalized_products)} products to target API")
        result = submit_products_to_target(normalized_products)
        print(f"Submission result: {result}")
    else:
        print("No products to submit")

if __name__ == "__main__":
    main()
