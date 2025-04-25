import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model - Extended for campus details
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  campus: text("campus"), // University/college campus
  dormitory: text("dormitory"), // Dormitory or housing location
  profileImage: text("profile_image"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  products: many(products),
  orders: many(orders),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  phone: true,
  campus: true,
  dormitory: true,
  profileImage: true,
  bio: true,
});

// Product model - Extended for student marketplace with rental options
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(), // User who is selling/renting the item
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull().default("used"), // new, like new, good, fair, poor
  images: jsonb("images").notNull().default([]), // Array of image URLs
  mainImage: text("main_image").notNull(), // Primary image URL
  location: text("location"), // Campus location
  availableForRent: boolean("available_for_rent").notNull().default(false),
  rentalPrice: doublePrecision("rental_price"), // Price per day for rental
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
  tags: jsonb("tags").default([]), // Keywords/tags for the product
});

export const productsRelations = relations(products, ({ one, many }: { one: any, many: any }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  rentals: many(rentals),
}));

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Reviews model - For product reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(), // Reviewer
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }: { one: any }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Rental model - For rental transactions
export const rentals = pgTable("rentals", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  renterId: integer("renter_id").notNull(), // User renting the item
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed, canceled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  returnDate: timestamp("return_date"), // Actual return date
  depositAmount: doublePrecision("deposit_amount"),
  notes: text("notes"),
});

export const rentalsRelations = relations(rentals, ({ one }: { one: any }) => ({
  product: one(products, {
    fields: [rentals.productId],
    references: [products.id],
  }),
  renter: one(users, {
    fields: [rentals.renterId],
    references: [users.id],
  }),
}));

export const insertRentalSchema = createInsertSchema(rentals).omit({
  id: true,
  createdAt: true,
});

// Cart model
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull().default("Default Cart"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isDefault: boolean("is_default").notNull().default(true), // Whether this is the default cart
});

export const cartsRelations = relations(carts, ({ one, many }: { one: any, many: any }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Cart item model
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  isRental: boolean("is_rental").default(false), // Is this a rental item or purchase
  rentalStartDate: timestamp("rental_start_date"), // For rental items
  rentalEndDate: timestamp("rental_end_date"), // For rental items
  rentalDays: integer("rental_days"), // Number of days for rental
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const cartItemsRelations = relations(cartItems, ({ one }: { one: any }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

// Order model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, canceled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  shippingAddress: text("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  deliveryMethod: text("delivery_method").notNull().default("pickup"), // pickup, delivery, shipping
  meetupLocation: text("meetup_location"), // For campus pickup
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  contactPhone: text("contact_phone"),
});

export const ordersRelations = relations(orders, ({ one, many }: { one: any, many: any }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Order item model
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  isRental: boolean("is_rental").default(false),
  rentalStartDate: timestamp("rental_start_date"),
  rentalEndDate: timestamp("rental_end_date"),
  rentalDays: integer("rental_days"),
  sellerId: integer("seller_id").notNull(), // Track the seller for each item
});

export const orderItemsRelations = relations(orderItems, ({ one }: { one: any }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id],
  }),
}));

// For creating new order items during order creation (without orderId)
export const createOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true,
});

// For inserting order items directly (with orderId) - used for existing orders
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Messages model - For communication between users about products
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  productId: integer("product_id"), // Optional, if message is about a specific product
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }: { one: any }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [messages.productId],
    references: [products.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Rental = typeof rentals.$inferSelect;
export type InsertRental = z.infer<typeof insertRentalSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Types for frontend
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

export interface ProductWithSeller extends Product {
  seller: User;
}

export interface ReviewWithUser extends Review {
  user: User;
}

export interface RentalWithDetails extends Rental {
  product: Product;
  renter: User;
}

export interface MessageWithUsers extends Message {
  sender: User;
  receiver: User;
  product?: Product;
}
