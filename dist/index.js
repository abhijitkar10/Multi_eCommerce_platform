// server/index.ts
import express3 from "express";
import dotenv3 from "dotenv";

// server/routes.ts
import express, { Router } from "express";
import { createServer } from "http";
import path2 from "path";
import fs2 from "fs";
import { z } from "zod";
import dotenv2 from "dotenv";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  campus: text("campus"),
  // University/college campus
  dormitory: text("dormitory"),
  // Dormitory or housing location
  profileImage: text("profile_image"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders)
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  phone: true,
  campus: true,
  dormitory: true,
  profileImage: true,
  bio: true
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  // User who is selling/renting the item
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull().default("used"),
  // new, like new, good, fair, poor
  images: jsonb("images").notNull().default([]),
  // Array of image URLs
  mainImage: text("main_image").notNull(),
  // Primary image URL
  location: text("location"),
  // Campus location
  availableForRent: boolean("available_for_rent").notNull().default(false),
  rentalPrice: doublePrecision("rental_price"),
  // Price per day for rental
  rentalAvailable: boolean("rental_available").notNull().default(false),
  rentalMinDays: integer("rental_min_days"),
  rentalMaxDays: integer("rental_max_days"),
  isSold: boolean("is_sold").notNull().default(false),
  isRented: boolean("is_rented").notNull().default(false),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  onSale: boolean("on_sale").notNull().default(false),
  oldPrice: doublePrecision("old_price"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  tags: jsonb("tags").default([])
  // Keywords/tags for the product
});
var productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id]
  }),
  reviews: many(reviews),
  rentals: many(rentals)
}));
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  // Reviewer
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}));
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var rentals = pgTable("rentals", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  renterId: integer("renter_id").notNull(),
  // User renting the item
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, active, completed, canceled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  returnDate: timestamp("return_date"),
  // Actual return date
  depositAmount: doublePrecision("deposit_amount"),
  notes: text("notes")
});
var rentalsRelations = relations(rentals, ({ one }) => ({
  product: one(products, {
    fields: [rentals.productId],
    references: [products.id]
  }),
  renter: one(users, {
    fields: [rentals.renterId],
    references: [users.id]
  })
}));
var insertRentalSchema = createInsertSchema(rentals).omit({
  id: true,
  createdAt: true
});
var carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull().default("Default Cart"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isDefault: boolean("is_default").notNull().default(true)
  // Whether this is the default cart
});
var cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id]
  }),
  items: many(cartItems)
}));
var insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  isRental: boolean("is_rental").default(false),
  // Is this a rental item or purchase
  rentalStartDate: timestamp("rental_start_date"),
  // For rental items
  rentalEndDate: timestamp("rental_end_date"),
  // For rental items
  rentalDays: integer("rental_days"),
  // Number of days for rental
  addedAt: timestamp("added_at").notNull().defaultNow()
});
var cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id]
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id]
  })
}));
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, processing, shipped, delivered, canceled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  shippingAddress: text("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  deliveryMethod: text("delivery_method").notNull().default("pickup"),
  // pickup, delivery, shipping
  meetupLocation: text("meetup_location"),
  // For campus pickup
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  contactPhone: text("contact_phone")
});
var ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems)
}));
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  isRental: boolean("is_rental").default(false),
  rentalStartDate: timestamp("rental_start_date"),
  rentalEndDate: timestamp("rental_end_date"),
  rentalDays: integer("rental_days"),
  sellerId: integer("seller_id").notNull()
  // Track the seller for each item
});
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id]
  })
}));
var createOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  productId: integer("product_id"),
  // Optional, if message is about a specific product
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [messages.productId],
    references: [products.id]
  })
}));
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  products;
  carts;
  cartItems;
  orders;
  orderItems;
  reviews;
  rentals;
  messages;
  currentUserId;
  currentProductId;
  currentCartId;
  currentCartItemId;
  currentOrderId;
  currentOrderItemId;
  currentReviewId;
  currentRentalId;
  currentMessageId;
  sessionStore;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.carts = /* @__PURE__ */ new Map();
    this.cartItems = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.orderItems = /* @__PURE__ */ new Map();
    this.reviews = /* @__PURE__ */ new Map();
    this.rentals = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentReviewId = 1;
    this.currentRentalId = 1;
    this.currentMessageId = 1;
    const MemoryStore2 = createMemoryStore(session);
    this.sessionStore = new MemoryStore2({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this.seedProducts();
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      phone: insertUser.phone || null,
      campus: insertUser.campus || null,
      dormitory: insertUser.dormitory || null,
      profileImage: insertUser.profileImage || null,
      bio: insertUser.bio || null
    };
    this.users.set(id, user);
    const cartId = this.currentCartId++;
    const defaultCart = {
      id: cartId,
      userId: user.id,
      name: "My Cart",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      isDefault: true
    };
    this.carts.set(cartId, defaultCart);
    return user;
  }
  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Product operations
  async getProduct(id) {
    return this.products.get(id);
  }
  async getProductWithSeller(id) {
    const product = this.products.get(id);
    if (!product) return void 0;
    const seller = this.users.get(product.sellerId);
    if (!seller) return void 0;
    return {
      ...product,
      seller
    };
  }
  async getProductsBySeller(sellerId) {
    return Array.from(this.products.values()).filter(
      (product) => product.sellerId === sellerId
    );
  }
  async createProduct(insertProduct) {
    const id = this.currentProductId++;
    const product = {
      ...insertProduct,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      condition: insertProduct.condition || "new",
      location: insertProduct.location || null,
      availableForRent: insertProduct.availableForRent || false,
      rentalPrice: insertProduct.rentalPrice || null,
      featured: insertProduct.featured || false,
      inStock: insertProduct.inStock || true,
      isNew: insertProduct.isNew || false,
      onSale: insertProduct.onSale || false,
      oldPrice: insertProduct.oldPrice || null,
      rating: insertProduct.rating || 0,
      reviewCount: insertProduct.reviewCount || 0,
      isSold: false,
      isRented: false,
      rentalAvailable: insertProduct.availableForRent || false,
      rentalMinDays: insertProduct.rentalMinDays || null,
      rentalMaxDays: insertProduct.rentalMaxDays || null,
      // Convert image strings to mainImage and images array
      mainImage: insertProduct.mainImage || "",
      images: insertProduct.images || null,
      tags: insertProduct.tags || null
    };
    this.products.set(id, product);
    return product;
  }
  async updateProduct(id, productData) {
    const product = this.products.get(id);
    if (!product) return void 0;
    const updatedProduct = {
      ...product,
      ...productData,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  async deleteProduct(id) {
    return this.products.delete(id);
  }
  async markProductAsAvailable(id, isAvailable) {
    const product = this.products.get(id);
    if (!product) return void 0;
    const updatedProduct = {
      ...product,
      inStock: isAvailable,
      isSold: isAvailable ? false : product.isSold,
      isRented: isAvailable ? false : product.isRented,
      rentalAvailable: isAvailable && product.availableForRent ? true : false
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  async getProducts(params = {}) {
    let filteredProducts = Array.from(this.products.values());
    if (params.category) {
      const categoryLower = params.category.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === categoryLower
      );
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower)
      );
    }
    if (params.minPrice !== void 0) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= params.minPrice
      );
    }
    if (params.maxPrice !== void 0) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price <= params.maxPrice
      );
    }
    if (params.featured !== void 0) {
      filteredProducts = filteredProducts.filter(
        (p) => p.featured === params.featured
      );
    }
    if (params.sort) {
      switch (params.sort) {
        case "price_asc":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "rating_desc":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          filteredProducts.sort((a, b) => b.id - a.id);
          break;
      }
    }
    if (params.limit !== void 0) {
      const offset = params.offset || 0;
      filteredProducts = filteredProducts.slice(offset, offset + params.limit);
    }
    return filteredProducts;
  }
  async getProductsByCategory(category) {
    return Array.from(this.products.values()).filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }
  async getFeaturedProducts(limit) {
    const featuredProducts = Array.from(this.products.values()).filter(
      (product) => product.featured
    );
    return limit ? featuredProducts.slice(0, limit) : featuredProducts;
  }
  async searchProducts(query) {
    const searchLower = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower)
    );
  }
  // Cart management operations
  async createCart(insertCart) {
    const id = this.currentCartId++;
    const cartName = insertCart.name || "My Cart";
    const cart = {
      ...insertCart,
      id,
      name: cartName,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      isDefault: insertCart.isDefault ?? false
    };
    if (cart.isDefault) {
      const userCarts = Array.from(this.carts.values()).filter(
        (c) => c.userId === cart.userId
      );
      userCarts.forEach((c) => {
        if (c.id !== id && c.isDefault) {
          this.carts.set(c.id, { ...c, isDefault: false });
        }
      });
    }
    this.carts.set(id, cart);
    return cart;
  }
  async getCarts(userId) {
    const userCarts = Array.from(this.carts.values()).filter(
      (cart) => cart.userId === userId
    );
    return Promise.all(
      userCarts.map(async (cart) => {
        const items = await this.getCartItems(cart.id);
        return {
          ...cart,
          items
        };
      })
    );
  }
  async getCart(id) {
    const cart = this.carts.get(id);
    if (!cart) return void 0;
    const items = await this.getCartItems(id);
    return {
      ...cart,
      items
    };
  }
  async getDefaultCart(userId) {
    const defaultCart = Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId && cart.isDefault
    );
    if (!defaultCart) return void 0;
    const items = await this.getCartItems(defaultCart.id);
    return {
      ...defaultCart,
      items
    };
  }
  async updateCart(id, data) {
    const cart = this.carts.get(id);
    if (!cart) return void 0;
    const updatedCart = {
      ...cart,
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (data.isDefault && cart.userId) {
      const userCarts = Array.from(this.carts.values()).filter(
        (c) => c.userId === cart.userId
      );
      userCarts.forEach((c) => {
        if (c.id !== id && c.isDefault) {
          this.carts.set(c.id, { ...c, isDefault: false });
        }
      });
    }
    this.carts.set(id, updatedCart);
    return updatedCart;
  }
  async setDefaultCart(userId, cartId) {
    const cart = this.carts.get(cartId);
    if (!cart || cart.userId !== userId) return void 0;
    const userCarts = Array.from(this.carts.values()).filter(
      (c) => c.userId === userId
    );
    userCarts.forEach((c) => {
      const isDefault = c.id === cartId;
      if (c.isDefault !== isDefault) {
        this.carts.set(c.id, { ...c, isDefault });
      }
    });
    return this.carts.get(cartId);
  }
  async deleteCart(id) {
    const cart = this.carts.get(id);
    if (!cart) return false;
    const cartItems2 = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === id
    );
    cartItems2.forEach((item) => {
      this.cartItems.delete(item.id);
    });
    return this.carts.delete(id);
  }
  // Cart item operations
  async getCartItems(cartId) {
    const cartItems2 = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId
    );
    return cartItems2.map((item) => {
      const product = this.products.get(item.productId);
      return {
        ...item,
        product
      };
    });
  }
  async getCartItem(cartId, productId) {
    return Array.from(this.cartItems.values()).find(
      (item) => item.cartId === cartId && item.productId === productId
    );
  }
  async getCartItemById(id) {
    return this.cartItems.get(id);
  }
  async addToCart(insertCartItem) {
    const existingItem = await this.getCartItem(
      insertCartItem.cartId,
      insertCartItem.productId
    );
    if (existingItem) {
      return this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + (insertCartItem.quantity || 1)
      );
    }
    const id = this.currentCartItemId++;
    const cartItem = {
      ...insertCartItem,
      id,
      quantity: insertCartItem.quantity || 1,
      isRental: insertCartItem.isRental || false,
      rentalStartDate: insertCartItem.rentalStartDate || null,
      rentalEndDate: insertCartItem.rentalEndDate || null,
      rentalDays: insertCartItem.rentalDays || null,
      addedAt: /* @__PURE__ */ new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  async updateCartItemRentalDates(id, startDate, endDate) {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return void 0;
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const diffDays = Math.ceil((endTime - startTime) / (1e3 * 3600 * 24));
    const updatedItem = {
      ...cartItem,
      isRental: true,
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      rentalDays: diffDays
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  async updateCartItemQuantity(id, quantity) {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return void 0;
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  async removeCartItem(id) {
    this.cartItems.delete(id);
  }
  async clearCart(cartId) {
    const cartItems2 = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId
    );
    cartItems2.forEach((item) => {
      this.cartItems.delete(item.id);
    });
  }
  async moveCartItem(itemId, toCartId) {
    const item = this.cartItems.get(itemId);
    if (!item) return void 0;
    if (!this.carts.get(toCartId)) return void 0;
    const existingItem = await this.getCartItem(toCartId, item.productId);
    if (existingItem) {
      await this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + item.quantity
      );
      this.cartItems.delete(itemId);
      return this.cartItems.get(existingItem.id);
    }
    const updatedItem = { ...item, cartId: toCartId };
    this.cartItems.set(itemId, updatedItem);
    return updatedItem;
  }
  // Order operations
  async createOrder(insertOrder, insertOrderItems) {
    const orderId = this.currentOrderId++;
    const order = {
      ...insertOrder,
      id: orderId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      status: insertOrder.status || "pending",
      notes: insertOrder.notes || null,
      deliveryMethod: insertOrder.deliveryMethod || "shipping",
      meetupLocation: insertOrder.meetupLocation || null,
      trackingNumber: insertOrder.trackingNumber || null,
      contactPhone: insertOrder.contactPhone || null
    };
    this.orders.set(orderId, order);
    insertOrderItems.forEach((item) => {
      const orderItemId = this.currentOrderItemId++;
      const orderItem = {
        ...item,
        id: orderItemId,
        orderId,
        isRental: Boolean(item.isRental),
        // Ensure boolean type
        rentalStartDate: item.rentalStartDate || null,
        rentalEndDate: item.rentalEndDate || null,
        rentalDays: item.rentalDays || null
      };
      this.orderItems.set(orderItemId, orderItem);
      const product = this.products.get(item.productId);
      if (product) {
        this.products.set(item.productId, {
          ...product,
          isSold: Boolean(!item.isRental),
          // Mark as sold only if not a rental
          isRented: Boolean(item.isRental)
          // Mark as rented if it's a rental
        });
      }
    });
    const userCarts = Array.from(this.carts.values()).filter(
      (cart) => cart.userId === insertOrder.userId
    );
    for (const cart of userCarts) {
      await this.clearCart(cart.id);
    }
    return order;
  }
  async getOrder(id) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const items = Array.from(this.orderItems.values()).filter((item) => item.orderId === id).map((item) => {
      const product = this.products.get(item.productId);
      return { ...item, product };
    });
    return {
      ...order,
      items
    };
  }
  async getOrdersByUser(userId) {
    const userOrders = Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
    return Promise.all(
      userOrders.map(async (order) => {
        const orderWithItems = await this.getOrder(order.id);
        return orderWithItems;
      })
    );
  }
  async getOrdersBySeller(sellerId) {
    const sellerOrderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.sellerId === sellerId
    );
    const orderIds = Array.from(
      new Set(sellerOrderItems.map((item) => item.orderId))
    );
    const orders2 = [];
    for (const orderId of orderIds) {
      const order = await this.getOrder(orderId);
      if (order) {
        order.items = order.items.filter((item) => item.sellerId === sellerId);
        orders2.push(order);
      }
    }
    return orders2;
  }
  async updateOrderStatus(id, status) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updatedOrder = {
      ...order,
      status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, updatedOrder);
    if (status === "completed") {
      const orderItems2 = Array.from(this.orderItems.values()).filter(
        (item) => item.orderId === id
      );
      for (const item of orderItems2) {
        const product = this.products.get(item.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            isSold: item.isRental ? product.isSold : true,
            isRented: item.isRental ? true : product.isRented,
            inStock: item.isRental ? product.inStock : false
            // Only if sold, not if rented
          };
          this.products.set(item.productId, updatedProduct);
        }
      }
    }
    return updatedOrder;
  }
  // Review operations
  async createReview(insertReview) {
    const id = this.currentReviewId++;
    const review = {
      ...insertReview,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      comment: insertReview.comment || null
    };
    this.reviews.set(id, review);
    const product = this.products.get(review.productId);
    if (product) {
      const productReviews = await this.getProductReviews(review.productId);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / productReviews.length;
      const updatedProduct = {
        ...product,
        rating: averageRating,
        reviewCount: productReviews.length
      };
      this.products.set(product.id, updatedProduct);
    }
    return review;
  }
  async getProductReviews(productId) {
    const reviews2 = Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
    return reviews2.map((review) => {
      const user = this.users.get(review.userId);
      return {
        ...review,
        user
      };
    });
  }
  async getUserReviews(userId) {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }
  // Rental operations
  async createRental(insertRental) {
    const id = this.currentRentalId++;
    const rental = {
      ...insertRental,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: insertRental.status || "pending",
      returnDate: null,
      depositAmount: insertRental.depositAmount || null,
      notes: insertRental.notes || null
    };
    this.rentals.set(id, rental);
    const product = this.products.get(rental.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        isRented: true,
        rentalAvailable: false
      };
      this.products.set(product.id, updatedProduct);
    }
    return rental;
  }
  async getRental(id) {
    const rental = this.rentals.get(id);
    if (!rental) return void 0;
    const product = this.products.get(rental.productId);
    const renter = this.users.get(rental.renterId);
    return {
      ...rental,
      product,
      renter
    };
  }
  async getUserRentals(userId) {
    const rentals2 = Array.from(this.rentals.values()).filter(
      (rental) => rental.renterId === userId
    );
    return rentals2.map((rental) => {
      const product = this.products.get(rental.productId);
      const renter = this.users.get(rental.renterId);
      return {
        ...rental,
        product,
        renter
      };
    });
  }
  async getProductRentals(productId) {
    const rentals2 = Array.from(this.rentals.values()).filter(
      (rental) => rental.productId === productId
    );
    return rentals2.map((rental) => {
      const product = this.products.get(rental.productId);
      const renter = this.users.get(rental.renterId);
      return {
        ...rental,
        product,
        renter
      };
    });
  }
  async updateRentalStatus(id, status) {
    const rental = this.rentals.get(id);
    if (!rental) return void 0;
    const updatedRental = {
      ...rental,
      status
    };
    if (status === "completed" && !updatedRental.returnDate) {
      updatedRental.returnDate = /* @__PURE__ */ new Date();
      const product = this.products.get(rental.productId);
      if (product) {
        this.products.set(product.id, {
          ...product,
          isRented: false,
          rentalAvailable: product.availableForRent || false
        });
      }
    }
    this.rentals.set(id, updatedRental);
    return updatedRental;
  }
  // Message operations
  async sendMessage(insertMessage) {
    const id = this.currentMessageId++;
    const message = {
      ...insertMessage,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      isRead: false,
      productId: insertMessage.productId || null
    };
    this.messages.set(id, message);
    return message;
  }
  async getUserMessages(userId) {
    const messages2 = Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
    return messages2.map((message) => {
      const sender = this.users.get(message.senderId);
      const receiver = this.users.get(message.receiverId);
      let product = null;
      if (message.productId) {
        product = this.products.get(message.productId);
      }
      return {
        ...message,
        sender,
        receiver,
        product: product || void 0
      };
    });
  }
  async getConversation(user1Id, user2Id) {
    const messages2 = Array.from(this.messages.values()).filter(
      (message) => message.senderId === user1Id && message.receiverId === user2Id || message.senderId === user2Id && message.receiverId === user1Id
    );
    messages2.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return messages2.map((message) => {
      const sender = this.users.get(message.senderId);
      const receiver = this.users.get(message.receiverId);
      let product = null;
      if (message.productId) {
        product = this.products.get(message.productId);
      }
      return {
        ...message,
        sender,
        receiver,
        product: product || void 0
      };
    });
  }
  async markMessageAsRead(id) {
    const message = this.messages.get(id);
    if (!message) return void 0;
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  // Helper to seed products
  seedProducts() {
    if (this.users.size === 0) {
      const defaultUser = {
        id: this.currentUserId++,
        username: "admin",
        password: "admin123",
        // This would be hashed in a real application
        email: "admin@example.com",
        name: "Admin User",
        phone: null,
        campus: null,
        dormitory: null,
        profileImage: null,
        bio: null,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.users.set(defaultUser.id, defaultUser);
    }
    const sellerId = 1;
    const demoProducts = [
      {
        name: "Smart Watch Pro",
        description: "Advanced smartwatch with heart rate monitoring, GPS, and 5-day battery life.",
        price: 129.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        condition: "new",
        availableForRent: false,
        featured: true,
        inStock: true,
        isNew: true,
        onSale: false,
        rating: 4.5,
        reviewCount: 24
      },
      {
        name: "Ultra Thin Laptop",
        description: "Powerful laptop with 16GB RAM, 512GB SSD, and stunning 4K display.",
        price: 999.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
        condition: "new",
        availableForRent: true,
        rentalPrice: 99.99,
        rentalMinDays: 1,
        rentalMaxDays: 30,
        featured: true,
        inStock: true,
        isNew: false,
        onSale: false,
        rating: 5,
        reviewCount: 42
      },
      {
        name: "Wireless Headphones",
        description: "Premium noise-cancelling headphones with 30-hour battery life.",
        price: 79.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        condition: "used",
        rating: 4,
        reviewCount: 18,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        // Updated for Summer Sale 2025
        oldPrice: 99.99,
        tags: ["Summer Sale 2025"]
        // Added tag
      },
      {
        name: "Sport Sneakers",
        description: "Lightweight, breathable sneakers perfect for running and everyday use.",
        price: 89.99,
        category: "Clothing",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        condition: "used",
        rating: 3.5,
        reviewCount: 36,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false
      },
      {
        name: "Digital Camera 4K",
        description: "Professional-grade digital camera with 4K video recording and 24MP photos.",
        price: 449.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
        condition: "used",
        rating: 5,
        reviewCount: 59,
        inStock: true,
        featured: true,
        isNew: false,
        onSale: false
      },
      {
        name: "Bamboo Watch",
        description: "Eco-friendly bamboo watch with Japanese movement and leather strap.",
        price: 69.99,
        category: "Accessories",
        sellerId,
        mainImage: "data:image/jpeg;base64,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",
        condition: "used",
        rating: 4.5,
        reviewCount: 27,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false
      },
      {
        name: "Apple Watch Series 6",
        description: "Smartwatch with fitness tracking, heart rate monitor, and GPS.",
        price: 39.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        condition: "used",
        rating: 4,
        reviewCount: 45,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        oldPrice: 59.99
      },
      {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with long battery life and responsive tracking.",
        price: 24.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://www.portronics.com/cdn/shop/files/Image1_5067bdd1-4473-4933-a66d-edcb4d49409a.png?v=1720258592&width=1445",
        condition: "used",
        rating: 4,
        reviewCount: 32,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false
      },
      {
        name: "Designer Backpack",
        description: "Stylish and functional backpack with laptop compartment and water bottle pocket.",
        price: 59.99,
        category: "Accessories",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1622560480605-d83c661469e5",
        condition: "used",
        rating: 4.5,
        reviewCount: 38,
        inStock: true,
        featured: true,
        isNew: true,
        onSale: false
      },
      {
        name: "Coffee Maker",
        description: "Programmable coffee maker with thermal carafe and auto shut-off.",
        price: 79.99,
        category: "Home & Kitchen",
        sellerId,
        mainImage: "https://assets.epicurious.com/photos/62741684ef40ea9d3866a0be/16:9/w_2560%2Cc_limit/breville-bambino-espresso-maker_HERO_050422_8449_VOG_Badge_final.jpg",
        condition: "used",
        rating: 4,
        reviewCount: 21,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false
      },
      {
        name: "Fitness Tracker",
        description: "Water-resistant fitness tracker with heart rate monitor and sleep tracking.",
        price: 49.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://m.media-amazon.com/images/I/61AeGQhwjxL._AC_UF1000,1000_QL80_.jpg",
        condition: "used",
        rating: 4,
        reviewCount: 52,
        inStock: true,
        featured: false,
        isNew: true,
        onSale: false
      },
      {
        name: "Portable Bluetooth Speaker",
        description: "Waterproof Bluetooth speaker with 12-hour playtime and deep bass.",
        price: 34.99,
        category: "Electronics",
        sellerId,
        mainImage: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
        condition: "used",
        rating: 4.5,
        reviewCount: 63,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        // Updated for Summer Sale 2025
        oldPrice: 49.99,
        tags: ["Summer Sale 2025"]
        // Added tag
      },
      {
        name: "RD Sharma Class 10",
        description: "Maths textbook",
        price: 19.99,
        category: "Books",
        sellerId,
        mainImage: "https://m.media-amazon.com/images/I/A1AN37Ta+fL.jpg",
        condition: "used",
        rating: 4.5,
        reviewCount: 63,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        oldPrice: 49.99
      },
      {
        name: "Lipstick",
        description: "MAC Red lipstick",
        price: 14.99,
        category: "Beauty",
        sellerId,
        mainImage: "https://sdcdn.io/mac/ca/mac_sku_M0N904_1x1_0.png?width=1080&height=1080",
        condition: "new",
        rating: 4.5,
        reviewCount: 63,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        oldPrice: 49.99
      },
      {
        name: "Hotwheels",
        description: "Mclaren 720s",
        price: 24.99,
        category: "Toys",
        sellerId,
        mainImage: "https://m.media-amazon.com/images/I/510DGgcax9L.jpg",
        condition: "used",
        rating: 4.5,
        reviewCount: 63,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        oldPrice: 49.99
      },
      {
        name: "Ball",
        description: "Nike Size 6 football.",
        price: 34.99,
        category: "Sports",
        sellerId,
        mainImage: "https://rukminim3.flixcart.com/image/850/1000/jwgple80/ball/c/n/g/410-440-5-68-premier-league-strike-1-sc3311-1015-football-nike-original-imafgk4xqeh4gw4b.jpeg?q=90&crop=false",
        condition: "used",
        rating: 3.5,
        reviewCount: 634,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        // Updated for Summer Sale 2025
        oldPrice: 49.99,
        tags: ["Summer Sale 2025"]
        // Added tag
      }
    ];
    demoProducts.forEach((productData) => {
      const id = this.currentProductId++;
      let mainImage = productData.mainImage;
      if ("image" in productData && !mainImage) {
        mainImage = productData.image;
      }
      const product = {
        id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        sellerId: productData.sellerId,
        mainImage: mainImage || "",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        condition: productData.condition || "used",
        images: [],
        location: null,
        availableForRent: productData.availableForRent || false,
        rentalAvailable: productData.availableForRent || false,
        rentalPrice: productData.rentalPrice || null,
        rentalMinDays: "rentalMinDays" in productData ? productData.rentalMinDays : null,
        rentalMaxDays: "rentalMaxDays" in productData ? productData.rentalMaxDays : null,
        featured: productData.featured || false,
        inStock: productData.inStock !== void 0 ? productData.inStock : true,
        isNew: productData.isNew || false,
        onSale: productData.onSale || false,
        oldPrice: productData.oldPrice || null,
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        isSold: false,
        isRented: false,
        tags: productData.tags || []
      };
      this.products.set(id, product);
    });
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "shop-ease-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 60 * 60 * 1e3
      // 1 hour
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/upload.ts
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});
var imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error("Only image files are allowed!"));
  }
  cb(null, true);
};
var upload = multer({
  storage: storage2,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB max file size
  }
});
var upload_default = upload;

// server/twilio.ts
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error("\u274C Missing one or more Twilio environment variables.");
}
var client = twilio(accountSid, authToken);
var sendOTP = async (phoneNumber) => {
  console.log(`\u{1F4E8} Sending OTP to: ${phoneNumber}`);
  try {
    const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: phoneNumber,
      channel: "sms"
    });
    console.log("\u2705 OTP sent successfully:", {
      sid: verification.sid,
      status: verification.status,
      to: verification.to,
      channel: verification.channel
    });
    return verification;
  } catch (error) {
    console.error("\u274C Error while sending OTP:", {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    });
    throw new Error("Failed to send OTP");
  }
};
var verifyOTP = async (phoneNumber, code) => {
  console.log(`\u{1F50D} Verifying OTP for: ${phoneNumber}, Code: ${code}`);
  try {
    const result = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: phoneNumber,
      code
    });
    console.log("\u2705 OTP verification result:", {
      sid: result.sid,
      status: result.status,
      valid: result.valid
    });
    return result;
  } catch (error) {
    console.error("\u274C Error during OTP verification:", {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    });
    throw new Error("Failed to verify OTP");
  }
};

// server/routes.ts
dotenv2.config();
var otpRouter = Router();
otpRouter.post("/api/send-otp", async (req, res) => {
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
otpRouter.post("/api/verify-otp", async (req, res) => {
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
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, search, minPrice, maxPrice, sort, featured, limit, offset } = req.query;
      const params = {
        category,
        search,
        minPrice: minPrice ? parseFloat(minPrice) : void 0,
        maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
        sort,
        featured: featured === "true" ? true : void 0,
        limit: limit ? parseInt(limit) : void 0,
        offset: offset ? parseInt(offset) : void 0
      };
      const products2 = await storage.getProducts(params);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const featuredProducts = await storage.getFeaturedProducts(limit);
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });
  app2.get("/api/products/categories/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const allProducts = await storage.getProducts();
      const products2 = allProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  app2.get("/api/seller/products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = req.user.id;
      const products2 = await storage.getProductsBySeller(sellerId);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller products" });
    }
  });
  app2.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const products2 = await storage.searchProducts(q);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  app2.use("/uploads", express.static(path2.join(process.cwd(), "uploads")));
  app2.post("/api/products", upload_default.array("images", 5), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = req.user.id;
      const files = req.files;
      const uploadedFiles = files || [];
      const imageUrls = uploadedFiles.map((file) => `/uploads/${file.filename}`);
      const mainImage = imageUrls.length > 0 ? imageUrls[0] : "";
      const productData = {
        ...req.body,
        sellerId,
        images: imageUrls,
        mainImage,
        price: req.body.price ? parseFloat(req.body.price) : void 0,
        rentalPrice: req.body.rentalPrice ? parseFloat(req.body.rentalPrice) : void 0,
        rentalMinDays: req.body.rentalMinDays ? parseInt(req.body.rentalMinDays) : void 0,
        availableForRent: req.body.availableForRent === "true",
        rentalAvailable: req.body.rentalAvailable === "true",
        featured: req.body.featured === "true"
      };
      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (req.files) {
        const files = req.files;
        files.forEach((file) => {
          const filePath = path2.join(process.cwd(), "uploads", file.filename);
          if (fs2.existsSync(filePath)) {
            fs2.unlinkSync(filePath);
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
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.patch("/api/products/:id/availability", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { isAvailable } = req.body;
      const userId = req.user.id;
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
  app2.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.get("/api/carts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
      const carts2 = await storage.getCarts(userId);
      res.json(carts2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch carts" });
    }
  });
  app2.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
      const cartId = req.query.cartId ? parseInt(req.query.cartId) : void 0;
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
      const cartItems2 = await storage.getCartItems(cart.id);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
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
        quantity: quantity || 1
      });
      res.status(200).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  app2.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
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
  app2.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.put("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const userId = req.user.id;
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
  app2.get("/api/carts/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
      const cart = await storage.getDefaultCart(userId);
      if (!cart) {
        return res.status(404).json({ message: "Default cart not found" });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default cart" });
    }
  });
  app2.get("/api/carts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.post("/api/carts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
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
  app2.put("/api/carts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.post("/api/carts/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const cart = await storage.setDefaultCart(userId, id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to set default cart" });
    }
  });
  app2.delete("/api/carts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.get("/api/carts/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const cartId = parseInt(req.params.id);
      const userId = req.user.id;
      const cart = await storage.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      if (cart.userId !== userId) {
        return res.status(403).json({ message: "You can only view your own cart items" });
      }
      const cartItems2 = await storage.getCartItems(cartId);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/carts/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const cartId = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.put("/api/cart-items/:id/quantity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const userId = req.user.id;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      const userCarts = await storage.getCarts(userId);
      let foundItem = null;
      for (const cart of userCarts) {
        const item = cart.items.find((item2) => item2.id === id);
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
  app2.put("/api/cart-items/:id/rental-dates", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { startDate, endDate } = req.body;
      const userId = req.user.id;
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
  app2.delete("/api/cart-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.post("/api/cart-items/:id/move", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { toCartId } = req.body;
      const userId = req.user.id;
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
  app2.delete("/api/carts/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const cartId = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
      const { orderData, orderItems: orderItems2 } = req.body;
      if (!orderData || !orderItems2 || !Array.isArray(orderItems2)) {
        return res.status(400).json({ message: "Invalid order data" });
      }
      const validatedOrderData = insertOrderSchema.parse({ ...orderData, userId });
      const validatedOrderItems = [];
      for (const item of orderItems2) {
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
  app2.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
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
  app2.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.id;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const validStatuses = ["pending", "processing", "shipped", "delivered", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const isBuyer = order.userId === userId;
      const isSeller = order.items.some((item) => item.sellerId === userId);
      if (!isBuyer && !isSeller) {
        return res.status(403).json({ message: "You can only update orders that you've placed or that contain your products" });
      }
      if (isBuyer && !isSeller) {
        if (order.status !== "pending" && status === "cancelled" || order.status !== "delivered" && status === "completed") {
          return res.status(403).json({ message: "As a buyer, you can only cancel pending orders or mark delivered orders as completed" });
        }
      }
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
      const orders2 = await storage.getOrdersByUser(userId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/seller/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = req.user.id;
      const orders2 = await storage.getOrdersBySeller(sellerId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller orders" });
    }
  });
  app2.get("/api/rentals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const userId = req.user.id;
      const rentals2 = await storage.getUserRentals(userId);
      res.json(rentals2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  });
  app2.post("/api/rentals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const renterId = req.user.id;
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
        status: "pending"
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
  app2.get("/api/seller/rentals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const sellerId = req.user.id;
      const products2 = await storage.getProductsBySeller(sellerId);
      if (!products2.length) {
        return res.json([]);
      }
      const allRentals = [];
      for (const product of products2) {
        const rentals2 = await storage.getProductRentals(product.id);
        allRentals.push(...rentals2);
      }
      res.json(allRentals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller rentals" });
    }
  });
  app2.patch("/api/rentals/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.id;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const validStatuses = ["pending", "active", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
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
        if (rental.status !== "pending" || status !== "cancelled") {
          return res.status(403).json({ message: "As a renter, you can only cancel pending rentals" });
        }
      }
      const updatedRental = await storage.updateRentalStatus(id, status);
      res.json(updatedRental);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rental status" });
    }
  });
  app2.use(otpRouter);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv3.config();
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
  console.error("\u274C Missing Twilio environment variables.");
  process.exit(1);
}
console.log("\u2705 Twilio env vars loaded.");
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  let reply = "Sorry, I didn\u2019t understand that.";
  if (message.toLowerCase().includes("hello")) {
    reply = "Hello! How can I assist you today?";
  }
  res.json({ reply });
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("\u{1F525} Global Error:", message);
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = process.env.PORT || 5e3;
  server.listen(
    {
      port: PORT,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`\u{1F680} Server ready on http://localhost:${PORT}`);
    }
  );
})();
