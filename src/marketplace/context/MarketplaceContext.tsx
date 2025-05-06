import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart, CartItem, Product } from "../types";

interface MarketplaceContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined,
);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<Cart>(() => {
    // Initialize cart from localStorage if available
    const savedCart = localStorage.getItem("marketplace_cart");
    return savedCart
      ? JSON.parse(savedCart)
      : { items: [], total: 0, currency: "FCFA" };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("marketplace_cart", JSON.stringify(cart));
  }, [cart]);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.product_id === product.id,
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          product_id: product.id,
          product: product,
          quantity: quantity,
          price: product.sale_price || product.price,
        };
        updatedItems = [...prevCart.items, newItem];
      }

      // Calculate new total
      const total = calculateTotal(updatedItems);

      return {
        ...prevCart,
        items: updatedItems,
        total,
        currency: product.currency || prevCart.currency,
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter(
        (item) => item.product_id !== productId,
      );
      const total = calculateTotal(updatedItems);

      return {
        ...prevCart,
        items: updatedItems,
        total,
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item,
      );
      const total = calculateTotal(updatedItems);

      return {
        ...prevCart,
        items: updatedItems,
        total,
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0, currency: "FCFA" });
  };

  const isInCart = (productId: string) => {
    return cart.items.some((item) => item.product_id === productId);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
