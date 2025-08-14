import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import './Verifier.css';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);
// VITAL: REPLACE THIS WITH YOUR ADDRESS
const MODULE_ADDRESS = "0x1a98b77867006bf21ee8fdf05823e2fa0918d56f3c1bd314d92bb7a5f50d7ac3";

export default function Verifier() {
  const [verifiedProduct, setVerifiedProduct] = useState<any>(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (data: any) => {
    if (data) {
      setIsScanning(false);
      setError("");
      setVerifiedProduct(null);
      try {
        const parsedData = JSON.parse(data.text);
        await verifyOnChain(parsedData);
      } catch (e) {
        setError("Invalid QR Code.");
        setVerifiedProduct(null);
      }
    }
  };

  const verifyOnChain = async (data: any) => {
    try {
      const payload = {
  function: `${MODULE_ADDRESS}::product::verify_product` as const, // <-- This is the only change
  type_arguments: [],
  arguments: [data.manufacturer_addr, data.brand, data.product_id, data.batch_number],
};
      const product = await aptos.view({ payload });
      setVerifiedProduct({
        brand: product[0],
        productId: product[1],
        mfgDate: product[2],
        batchNumber: product[3],
        price: product[4],
        productType: product[5],
      });
      setError("");
    } catch (e) {
      setError("Product is FAKE.");
      setVerifiedProduct(null);
    }
  };

  const handleScanError = (err: any) => {
    console.error(err);
    setError("Camera error.");
  };

  return (
    <div className="verifier-container">
      <h2>Verify Your Product</h2>
      <button onClick={() => setIsScanning(true)}>Start Camera</button>
      {isScanning && (
        <div style={{width: "300px", marginTop: "20px"}}>
          <QrScanner delay={300} onError={handleScanError} onScan={handleScan} style={{ width: "100%" }} />
        </div>
      )}
      {verifiedProduct && (
        <div className="product-details verified">
          <h3>Product is Verified</h3>
          <p><strong>Brand:</strong> {verifiedProduct.brand}</p>
          <p><strong>Product ID:</strong> {verifiedProduct.productId}</p>
          <p><strong>Manufacture Date:</strong> {verifiedProduct.mfgDate}</p>
          <p><strong>Batch:</strong> {verifiedProduct.batchNumber}</p>
          <p><strong>Price:</strong> {verifiedProduct.price.toString()}</p>
          <p><strong>Type:</strong> {verifiedProduct.productType}</p>
        </div>
      )}
      {error && (
        <div className="product-details fake"><h3>{error}</h3></div>
      )}
    </div>
  );
}