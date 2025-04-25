import express, { type Express, type Request, type Response, Router } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { z } from "zod";
import dotenv from "dotenv";
import {
  insertCartItemSchema,
  insertCartSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  createOrderItemSchema,
  insertProductSchema,
  insertRentalSchema,
  RentalWithDetails,
  CartItemWithProduct,
  CreateOrderItem,
} from "@shared/schema";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import upload from "./upload";
import { sendOTP, verifyOTP } from "./twilio";

// Load environment variables if needed (in case not already loaded elsewhere)
dotenv.config();

// Create an additional router for OTP endpoints
const otpRouter = Router();

// ----------------- OTP Endpoints -----------------
// OTP: Send OTP
otpRouter.post("/api/send-otp", async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  try {
    const result = await sendOTP(phoneNumber);
    res.json({ message: "OTP sent", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP", details: error });
  }
});

// OTP: Verify OTP
otpRouter.post("/api/verify-otp", async (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code) {
    return res.status(400).json({ error: "Phone number and OTP code are required" });
  }
  try {
    const result = await verifyOTP(phoneNumber, code);
    if (result.status === "approved") {
      res.json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ error: "OTP verification failed", result });
    }
  } catch (error) {
    res.status(500).json({ error: "Error during OTP verification", details: error });
  }
});

// ----------------- End OTP Endpoints -----------------

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // ----------------- Product Routes -----------------
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { category, search, minPrice, maxPrice, sort, featured, limit, offset } = req.query;
      const params = {
        category: category as string | undefined,
        search: search as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sort: sort as string | undefined,
        featured: featured === "true" ? true : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };
      const products = await storage.getProducts(params);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const featuredProducts = await storage.getFeaturedProducts(limit);
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/categories/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const allProducts = await storage.getProducts();
      const products = allProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/seller/products", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = (req.user as Express.User).id;
      const products = await storage.getProductsBySeller(sellerId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller products" });
    }
  });

  app.get("/api/products/search", async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const products = await storage.searchProducts(q as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Serve static files from the uploads folder
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Create product listing (protected)
  app.post("/api/products", upload.array("images", 5), async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = (req.user as Express.User).id;
      const files = req.files as Express.Multer.File[];
      const uploadedFiles = files || [];
      const imageUrls = uploadedFiles.map((file) => `/uploads/${file.filename}`);
      const mainImage = imageUrls.length > 0 ? imageUrls[0] : "";
      const productData = {
        ...req.body,
        sellerId,
        images: imageUrls,
        mainImage,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        rentalPrice: req.body.rentalPrice ? parseFloat(req.body.rentalPrice) : undefined,
        rentalMinDays: req.body.rentalMinDays ? parseInt(req.body.rentalMinDays) : undefined,
        availableForRent: req.body.availableForRent === "true",
        rentalAvailable: req.body.rentalAvailable === "true",
        featured: req.body.featured === "true",
      };
      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (req.files) {
        const files = req.files as Express.Multer.File[];
        files.forEach((file) => {
          const filePath = path.join(process.cwd(), "uploads", file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Product creation error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.patch("/api/products/:id/availability", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { isAvailable } = req.body;
      const userId = (req.user as Express.User).id;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.sellerId !== userId) {
        return res.status(403).json({ message: "You can only change availability of your own products" });
      }
      if (typeof isAvailable !== "boolean") {
        return res.status(400).json({ message: "isAvailable must be a boolean value" });
      }
      const updatedProduct = await storage.markProductAsAvailable(id, isAvailable);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product availability" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.sellerId !== userId) {
        return res.status(403).json({ message: "You can only update your own products" });
      }
      const { sellerId, ...updateData } = req.body;
      const updatedProduct = await storage.updateProduct(id, updateData);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.sellerId !== userId) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }
      const result = await storage.deleteProduct(id);
      if (result) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Failed to delete product" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // ----------------- End Product Routes -----------------

  // ----------------- Cart Management Routes -----------------
  app.get("/api/carts", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const carts = await storage.getCarts(userId);
      res.json(carts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch carts" });
    }
  });

  app.get("/api/cart", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const cartId = req.query.cartId ? parseInt(req.query.cartId as string) : undefined;
      let cart;
      if (cartId) {
        cart = await storage.getCart(cartId);
        if (!cart || cart.userId !== userId) {
          return res.status(403).json({ message: "This cart doesn't belong to you" });
        }
      } else {
        cart = await storage.getDefaultCart(userId);
      }
      if (!cart) {
        return res.json([]);
      }
      const cartItems = await storage.getCartItems(cart.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const { productId, quantity, cartId } = req.body;
      let targetCart;
      if (cartId) {
        targetCart = await storage.getCart(cartId);
        if (!targetCart || targetCart.userId !== userId) {
          return res.status(403).json({ message: "This cart doesn't belong to you" });
        }
      } else {
        targetCart = await storage.getDefaultCart(userId);
        if (!targetCart) {
          targetCart = await storage.createCart({ userId, name: "My Cart", isDefault: true });
        }
      }
      const cartItem = await storage.addToCart({
        cartId: targetCart.id,
        productId,
        quantity: quantity || 1,
      });
      res.status(200).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const cart = await storage.getDefaultCart(userId);
      if (!cart) {
        return res.status(404).json({ message: "Default cart not found" });
      }
      await storage.clearCart(cart.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const item = await storage.getCartItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const cart = await storage.getCart(item.cartId);
      if (!cart || cart.userId !== userId) {
        return res.status(403).json({ message: "You can only remove items from your own cart" });
      }
      await storage.removeCartItem(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const userId = (req.user as Express.User).id;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      const item = await storage.getCartItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const cart = await storage.getCart(item.cartId);
      if (!cart || cart.userId !== userId) {
        return res.status(403).json({ message: "You can only update items in your own cart" });
      }
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item quantity" });
    }
  });

  app.get("/api/carts/default", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const cart = await storage.getDefaultCart(userId);
      if (!cart) {
        return res.status(404).json({ message: "Default cart not found" });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default cart" });
    }
  });

  app.get("/api/carts/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/carts", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const validatedData = insertCartSchema.parse({ ...req.body, userId });
      const cart = await storage.createCart(validatedData);
      res.status(201).json(cart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create cart" });
    }
  });

  app.put("/api/carts/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "You can only update your own carts" });
      }
      const updatedCart = await storage.updateCart(id, req.body);
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.post("/api/carts/:id/default", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.setDefaultCart(userId, id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to set default cart" });
    }
  });

  app.delete("/api/carts/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own carts" });
      }
      const result = await storage.deleteCart(id);
      if (result) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Failed to delete cart" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cart" });
    }
  });
  // ----------------- End Cart Routes -----------------

  // ----------------- Cart Item Routes -----------------
  app.get("/api/carts/:id/items", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const cartId = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "You can only view your own cart items" });
      }
      const cartItems = await storage.getCartItems(cartId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/carts/:id/items", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const cartId = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "You can only add items to your own cart" });
      }
      const validatedData = insertCartItemSchema.parse({ ...req.body, cartId });
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart-items/:id/quantity", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const userId = (req.user as Express.User).id;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      // Find the cart item in any of the user's carts
      const userCarts = await storage.getCarts(userId);
      let foundItem = null;
      for (const cart of userCarts) {
        const item = cart.items.find((item: CartItemWithProduct) => item.id === id);
        if (item) {
          foundItem = item;
          break;
        }
      }
      if (!foundItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item quantity" });
    }
  });

  app.put("/api/cart-items/:id/rental-dates", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { startDate, endDate } = req.body;
      const userId = (req.user as Express.User).id;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const item = await storage.getCartItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const cart = await storage.getCart(item.cartId);
      if (!cart || cart.userId !== userId) {
        return res.status(403).json({ message: "You can only update items in your own cart" });
      }
      const updatedItem = await storage.updateCartItemRentalDates(
        id,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item rental dates" });
    }
  });

  app.delete("/api/cart-items/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const item = await storage.getCartItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const cart = await storage.getCart(item.cartId);
      if (!cart || cart.userId !== userId) {
        return res.status(403).json({ message: "You can only remove items from your own cart" });
      }
      await storage.removeCartItem(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.post("/api/cart-items/:id/move", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { toCartId } = req.body;
      const userId = (req.user as Express.User).id;
      if (!toCartId) {
        return res.status(400).json({ message: "Target cart ID is required" });
      }
      const item = await storage.getCartItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const sourceCart = await storage.getCart(item.cartId);
      const targetCart = await storage.getCart(toCartId);
      if (!sourceCart || !targetCart) {
        return res.status(404).json({ message: "One of the carts was not found" });
      }
      if (sourceCart.userId !== userId || targetCart.userId !== userId) {
        return res.status(403).json({ message: "You can only move items between your own carts" });
      }
      const movedItem = await storage.moveCartItem(id, toCartId);
      res.json(movedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to move cart item" });
    }
  });

  app.delete("/api/carts/:id/items", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const cartId = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "You can only clear your own cart" });
      }
      await storage.clearCart(cartId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  // ----------------- End Cart Item Routes -----------------

  // ----------------- Order Routes -----------------
  app.post("/api/orders", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const { orderData, orderItems } = req.body;
      if (!orderData || !orderItems || !Array.isArray(orderItems)) {
        return res.status(400).json({ message: "Invalid order data" });
      }
      const validatedOrderData = insertOrderSchema.parse({ ...orderData, userId });
      const validatedOrderItems = [];
      for (const item of orderItems) {
        const validatedItem = createOrderItemSchema.parse(item);
        validatedOrderItems.push(validatedItem);
      }
      const order = await storage.createOrder(validatedOrderData, validatedOrderItems);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = (req.user as Express.User).id;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const isBuyer = order.userId === userId;
      const isSeller = order.items.some(item => item.sellerId === userId);
      if (!isBuyer && !isSeller) {
        return res.status(403).json({ message: "You can only update orders that you've placed or that contain your products" });
      }
      if (isBuyer && !isSeller) {
        if ((order.status !== 'pending' && status === 'cancelled') ||
            (order.status !== 'delivered' && status === 'completed')) {
          return res.status(403).json({ message: "As a buyer, you can only cancel pending orders or mark delivered orders as completed" });
        }
      }
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/seller/orders", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = (req.user as Express.User).id;
      const orders = await storage.getOrdersBySeller(sellerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller orders" });
    }
  });
  // ----------------- End Order Routes -----------------

  // ----------------- Rental Routes -----------------
  app.get("/api/rentals", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = (req.user as Express.User).id;
      const rentals = await storage.getUserRentals(userId);
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  });

  app.post("/api/rentals", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const renterId = (req.user as Express.User).id;
      const productId = req.body.productId;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.sellerId === renterId) {
        return res.status(400).json({ message: "You cannot rent your own products" });
      }
      if (!product.availableForRent) {
        return res.status(400).json({ message: "This product is not available for rent" });
      }
      if (!product.rentalAvailable) {
        return res.status(400).json({ message: "This product is currently not available for rental" });
      }
      const validatedData = insertRentalSchema.parse({
        ...req.body,
        renterId,
        status: 'pending'
      });
      const rental = await storage.createRental(validatedData);
      res.status(201).json(rental);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rental data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rental" });
    }
  });

  app.get("/api/seller/rentals", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = (req.user as Express.User).id;
      const products = await storage.getProductsBySeller(sellerId);
      if (!products.length) {
        return res.json([]);
      }
      const allRentals: RentalWithDetails[] = [];
      for (const product of products) {
        const rentals = await storage.getProductRentals(product.id);
        allRentals.push(...rentals);
      }
      res.json(allRentals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller rentals" });
    }
  });

  app.patch("/api/rentals/:id/status", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = (req.user as Express.User).id;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      const rental = await storage.getRental(id);
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      const isOwner = rental.product.sellerId === userId;
      const isRenter = rental.renterId === userId;
      if (!isOwner && !isRenter) {
        return res.status(403).json({ message: "You can only update rentals for your products or rentals you've made" });
      }
      if (isRenter && !isOwner) {
        if (rental.status !== 'pending' || status !== 'cancelled') {
          return res.status(403).json({ message: "As a renter, you can only cancel pending rentals" });
        }
      }
      const updatedRental = await storage.updateRentalStatus(id, status);
      res.json(updatedRental);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rental status" });
    }
  });
  // ----------------- End Rental Routes -----------------

  // Attach the OTP endpoints
  app.use(otpRouter);

  // Create and return the HTTP server
  const httpServer: Server = createServer(app);
  return httpServer;
}
