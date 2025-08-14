import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import QRCode from "react-qr-code";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import './Manufacturer.css';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);
// VITAL: REPLACE THIS WITH YOUR ADDRESS
const MODULE_ADDRESS = "0x1a98b77867006bf21ee8fdf05823e2fa0918d56f3c1bd314d92bb7a5f50d7ac3";

export default function Manufacturer() {
  const { account, signAndSubmitTransaction }: any = useWallet();
  const [productDetails, setProductDetails] = useState({
    brand: "",
    productId: "",
    mfgDate: "",
    batchNumber: "",
    price: "",
    productType: "",
  });
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [isProductAdded, setIsProductAdded] = useState(false);
  // FIX #1: Add a new state to track loading
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: any) => {
    // When a new product is being entered, hide the old QR code
    setIsProductAdded(false);
    setQrCodeValue("");
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsLoading(true); // Start loading indicator

    const transaction = {
      data: {
        function: `${MODULE_ADDRESS}::product::add_product`,
        functionArgs: [
          productDetails.brand,
          productDetails.productId,
          productDetails.mfgDate,
          productDetails.batchNumber,
          parseInt(productDetails.price),
          productDetails.productType,
        ],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      const qrData = {
          manufacturer_addr: account.address,
          brand: productDetails.brand,
          product_id: productDetails.productId,
          batch_number: productDetails.batchNumber,
      };

      setQrCodeValue(JSON.stringify(qrData));
      setIsProductAdded(true); // This will now correctly show the QR code
      alert("Product successfully added to the blockchain!");
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Error: Could not add product. Have you created a product store yet?");
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // ... handleCreateStore function remains the same ...
  const handleCreateStore = async () => {
      if (!account) {
        alert("Please connect your wallet first.");
        return;
      }
      setIsLoading(true);
      const transaction = {
        data: {
          function: `${MODULE_ADDRESS}::product::create_product_store`,
          functionArgs: []
        }
      };

      try {
          const response = await signAndSubmitTransaction(transaction);
          await aptos.waitForTransaction({ transactionHash: response.hash });
          alert("Product store created successfully! You can now add products.");
      } catch (error) {
          console.error("Failed to create product store:", error);
          alert("Error: Store may already exist or another issue occurred.");
      } finally {
          setIsLoading(false);
      }
  }


  return (
    <div className="manufacturer-container">
      <h2>Manufacturer Dashboard</h2>
      <p className="component-description">Create a store once per account, then add as many products as you like.</p>
      <div className="actions-bar">
        <button onClick={handleCreateStore} className="action-button" disabled={isLoading}>
            {isLoading ? "Processing..." : "1. Create Product Store"}
        </button>
      </div>

      <form onSubmit={handleAddProduct} className="form-card">
        <div className="form-grid">
          {/* FIX #2: Add the `value` attribute to each input to make it a controlled component */}
          <input name="brand" placeholder="Brand" value={productDetails.brand} onChange={handleInputChange} required disabled={isLoading} />
          <input name="productId" placeholder="Product ID" value={productDetails.productId} onChange={handleInputChange} required disabled={isLoading} />
          <input name="mfgDate" placeholder="MM/DD/YYYY" value={productDetails.mfgDate} onChange={handleInputChange} required disabled={isLoading} />
          <input name="batchNumber" placeholder="Batch Number" value={productDetails.batchNumber} onChange={handleInputChange} required disabled={isLoading} />
          <input name="price" type="number" placeholder="Price" value={productDetails.price} onChange={handleInputChange} required disabled={isLoading} />
          <input name="productType" placeholder="Type of Product" value={productDetails.productType} onChange={handleInputChange} required disabled={isLoading} />
        </div>
        <button type="submit" className="action-button primary" disabled={isLoading}>
          {isLoading ? "Processing..." : "2. Add Product & Generate QR"}
        </button>
      </form>
      {isProductAdded && (
        <div className="qr-code-section">
          <h3>Product Added! QR Code Generated:</h3>
          <QRCode value={qrCodeValue} />
        </div>
      )}
    </div>
  );
}