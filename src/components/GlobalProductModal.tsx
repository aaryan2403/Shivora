"use client";

import { useShop } from "../context/ShopContext";
import ProductModal from "./ProductModal";

export default function GlobalProductModal() {
  const { isProductModalOpen, selectedProduct, closeProduct } = useShop();

  return (
    <ProductModal 
      product={selectedProduct} 
      isOpen={isProductModalOpen} 
      onClose={closeProduct} 
    />
  );
}
