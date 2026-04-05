"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ShoppingBag, Heart } from "lucide-react";
import { useShop, Product } from "../context/ShopContext";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const images = product?.images || (product ? [product.image] : []);

  // Auto-switch image every 5 seconds on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovering && images.length > 1 && !isZoomed) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isHovering, images.length, isZoomed]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentImageIndex(0);
      setIsZoomed(false);
      setIsHovering(false);
    }, 300);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  if (!product) return null;

  const isWishlisted = wishlist.some((w) => w.id === product.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[200]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 md:p-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-creme w-full max-w-6xl max-h-[90vh] md:h-[80vh] rounded-sm overflow-hidden flex flex-col md:flex-row pointer-events-auto relative shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 bg-obsidian/10 hover:bg-obsidian hover:text-creme rounded-full transition-colors duration-300"
              >
                <X size={20} />
              </button>

              {/* Left Side: Image Viewer */}
              <div 
                className="w-full md:w-1/2 h-[50vh] md:h-full relative bg-obsidian/5 flex flex-col"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Main Image Area */}
                <div 
                  className="relative flex-grow overflow-hidden cursor-crosshair group"
                  onClick={() => setIsZoomed(!isZoomed)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[currentImageIndex]}
                        alt={`${product.name} - View ${currentImageIndex + 1}`}
                        fill
                        className={`object-cover transition-transform duration-200 ${
                          product.collection === 'Obsidian' ? 'grayscale contrast-125' : 
                          product.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''
                        }`}
                        style={isZoomed ? {
                          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                          transform: 'scale(2.5)'
                        } : {}}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Zoom Hint */}
                  {!isZoomed && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-obsidian/10 pointer-events-none">
                      <span className="bg-obsidian/80 text-creme px-4 py-2 rounded-full text-xs tracking-widest uppercase backdrop-blur-sm">
                        Click to Zoom
                      </span>
                    </div>
                  )}
                </div>

                {/* Slider Controls & Indicators (Only if multiple images) */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 z-10">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
                        className="p-1.5 bg-creme/80 hover:bg-creme text-obsidian rounded-full shadow-sm transition-colors backdrop-blur-sm"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              idx === currentImageIndex ? "bg-obsidian w-6" : "bg-obsidian/30 hover:bg-obsidian/60"
                            }`}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
                        className="p-1.5 bg-creme/80 hover:bg-creme text-obsidian rounded-full shadow-sm transition-colors backdrop-blur-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Product Details */}
              <div className="w-full md:w-1/2 h-full p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-creme text-obsidian">
                <div className="mb-2">
                  <span className="text-ash text-xs uppercase tracking-[0.3em] font-semibold">
                    {product.collection || "Signature"} Collection
                  </span>
                  {product.isHighJewelry && (
                    <span className="ml-3 px-2 py-1 bg-obsidian text-creme text-[10px] tracking-widest uppercase rounded-sm">
                      High Jewelry
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-3xl md:text-5xl mb-4 text-obsidian">{product.name}</h2>
                <p className="text-2xl font-light tracking-wide text-ash mb-8">{product.price}</p>

                <div className="prose prose-sm md:prose-base text-obsidian/80 font-medium mb-12">
                  <p className="leading-relaxed">
                    {product.description || "An exquisite piece crafted with uncompromising attention to detail, embodying the signature aesthetic of our house."}
                  </p>
                </div>

                {/* Technical Details */}
                <div className="border-t border-b border-ash/20 py-6 mb-12 grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="block text-ash text-xs uppercase tracking-widest mb-1">Category</span>
                    <span className="font-semibold text-obsidian">{product.category}</span>
                  </div>
                  <div>
                    <span className="block text-ash text-xs uppercase tracking-widest mb-1">Material</span>
                    <span className="font-semibold text-obsidian">{product.collection === 'Obsidian' ? 'Dark Rhodium / Obsidian' : product.collection === 'Ash' ? 'Brushed Gunmetal' : '18k Gold / Pearl'}</span>
                  </div>
                  <div>
                    <span className="block text-ash text-xs uppercase tracking-widest mb-1">Availability</span>
                    <span className="font-semibold text-obsidian">Made to Order</span>
                  </div>
                  <div>
                    <span className="block text-ash text-xs uppercase tracking-widest mb-1">Shipping</span>
                    <span className="font-semibold text-obsidian">Complimentary Global</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 mt-auto">
                  <button 
                    onClick={() => { addToCart(product); onClose(); }}
                    className="w-full py-4 bg-obsidian text-creme tracking-[0.2em] uppercase text-xs font-bold cursor-pointer hover:bg-primary transition-all duration-300 flex justify-center items-center gap-3 shadow-lg"
                  >
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`w-full py-4 border tracking-[0.2em] uppercase text-xs font-bold cursor-pointer transition-all duration-300 flex justify-center items-center gap-3 ${
                      isWishlisted 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-ash/40 text-obsidian hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Heart size={16} className={isWishlisted ? "fill-primary" : ""} /> 
                    {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
