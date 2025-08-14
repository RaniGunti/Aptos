module product_addr::product {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    // --- Error Codes ---
    // These codes provide specific reasons if a transaction fails.
    const E_PRODUCT_NOT_FOUND: u64 = 1;
    const E_STORE_ALREADY_EXISTS: u64 = 2;
    const E_STORE_NOT_FOUND: u64 = 3;

    // --- Structs ---
    // 'struct' defines the shape of our data.

    // Holds the details for a single product.
    struct Product has store, drop, key {
        brand: String,
        product_id: String,
        manufacture_date: String,
        batch_number: String,
        price: u64,
        product_type: String,
    }

    // A resource that holds all products for a single manufacturer.
    struct ProductStore has key {
        products: vector<Product>,
    }

    // --- Entry Functions ---
    // These are functions that users can call to initiate a transaction.

    /// Publishes a new, empty ProductStore under the manufacturer's account.
    /// This only needs to be done once per manufacturer.
    public entry fun create_product_store(manufacturer: &signer) {
        let manufacturer_addr = signer::address_of(manufacturer);
        // Ensure the manufacturer doesn't already have a store.
        assert!(!exists<ProductStore>(manufacturer_addr), E_STORE_ALREADY_EXISTS);
        move_to(manufacturer, ProductStore { products: vector::empty<Product>() });
    }

    /// Allows a manufacturer to add a new product to their existing store.
    public entry fun add_product(
        manufacturer: &signer,
        brand: vector<u8>,
        product_id: vector<u8>,
        manufacture_date: vector<u8>,
        batch_number: vector<u8>,
        price: u64,
        product_type: vector<u8>
    ) acquires ProductStore {
        let manufacturer_addr = signer::address_of(manufacturer);
        // Ensure the manufacturer has already created a store.
        assert!(exists<ProductStore>(manufacturer_addr), E_STORE_NOT_FOUND);

        // Borrow a mutable reference to the store to add the new product.
        let product_store = borrow_global_mut<ProductStore>(manufacturer_addr);

        let new_product = Product {
            brand: string::utf8(brand),
            product_id: string::utf8(product_id),
            manufacture_date: string::utf8(manufacture_date),
            batch_number: string::utf8(batch_number),
            price,
            product_type: string::utf8(product_type),
        };

        // Add the newly created product to the vector of products.
        vector::push_back(&mut product_store.products, new_product);
    }
    #[view]
    public fun verify_product(
        manufacturer_addr: address,
        brand: String,
        product_id: String,
        batch_number: String
    ): (String, String, String, String, u64, String) acquires ProductStore {
        // Ensure the specified manufacturer has a product store.
        assert!(exists<ProductStore>(manufacturer_addr), E_STORE_NOT_FOUND);

        let product_store = borrow_global<ProductStore>(manufacturer_addr);
        let i = 0;
        let len = vector::length(&product_store.products);

        // Loop through all products in the store.
        while (i < len) {
            let p = vector::borrow(&product_store.products, i);
            // Check if the product details match the query.
            if (p.brand == brand && p.product_id == product_id && p.batch_number == batch_number) {
                // If a match is found, return all its details.
                return (
                    p.brand,
                    p.product_id,
                    p.manufacture_date,
                    p.batch_number,
                    p.price,
                    p.product_type
                );
            };
            i = i + 1;
        };

        // If the loop finishes without finding a match, abort with an error.
        abort E_PRODUCT_NOT_FOUND
    }
}