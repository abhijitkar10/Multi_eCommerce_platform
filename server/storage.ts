import {
  users,
  products,
  cartItems,
  carts,
  orders,
  orderItems,
  reviews,
  rentals,
  messages,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Cart,
  type InsertCart,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CreateOrderItem,
  type Review,
  type InsertReview,
  type Rental,
  type InsertRental,
  type Message,
  type InsertMessage,
  type CartItemWithProduct,
  type CartWithItems,
  type OrderWithItems,
  type ProductWithSeller,
  type ReviewWithUser,
  type RentalWithDetails,
  type MessageWithUsers,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Type definition for SessionStore - use any to avoid TypeScript errors
// In a production app, we would define a proper interface
type SessionStore = any;

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductWithSeller(id: number): Promise<ProductWithSeller | undefined>;
  getProducts(params?: {
    category?: string;
    search?: string;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    availableForRent?: boolean;
    sort?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsBySeller(sellerId: number): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  markProductAsAvailable(
    id: number,
    isAvailable: boolean
  ): Promise<Product | undefined>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProductReviews(productId: number): Promise<ReviewWithUser[]>;
  getUserReviews(userId: number): Promise<Review[]>;

  // Rental operations
  createRental(rental: InsertRental): Promise<Rental>;
  getRental(id: number): Promise<RentalWithDetails | undefined>;
  getUserRentals(userId: number): Promise<RentalWithDetails[]>;
  getProductRentals(productId: number): Promise<RentalWithDetails[]>;
  updateRentalStatus(id: number, status: string): Promise<Rental | undefined>;

  // Cart operations
  // Cart management
  createCart(cart: InsertCart): Promise<Cart>;
  getCarts(userId: number): Promise<CartWithItems[]>;
  getCart(id: number): Promise<CartWithItems | undefined>;
  getDefaultCart(userId: number): Promise<CartWithItems | undefined>;
  updateCart(id: number, data: Partial<Cart>): Promise<Cart | undefined>;
  setDefaultCart(userId: number, cartId: number): Promise<Cart | undefined>;
  deleteCart(id: number): Promise<boolean>;

  // Cart items
  getCartItems(cartId: number): Promise<CartItemWithProduct[]>;
  getCartItem(cartId: number, productId: number): Promise<CartItem | undefined>;
  getCartItemById(id: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(
    id: number,
    quantity: number
  ): Promise<CartItem | undefined>;
  updateCartItemRentalDates(
    id: number,
    startDate: Date,
    endDate: Date
  ): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;
  moveCartItem(itemId: number, toCartId: number): Promise<CartItem | undefined>;

  // Order operations
  createOrder(order: InsertOrder, items: CreateOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getOrdersByUser(userId: number): Promise<OrderWithItems[]>;
  getOrdersBySeller(sellerId: number): Promise<OrderWithItems[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Message operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: number): Promise<MessageWithUsers[]>;
  getConversation(
    user1Id: number,
    user2Id: number
  ): Promise<MessageWithUsers[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private rentals: Map<number, Rental>;
  private messages: Map<number, Message>;

  currentUserId: number;
  currentProductId: number;
  currentCartId: number;
  currentCartItemId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentReviewId: number;
  currentRentalId: number;
  currentMessageId: number;

  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.rentals = new Map();
    this.messages = new Map();

    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentReviewId = 1;
    this.currentRentalId = 1;
    this.currentMessageId = 1;

    // Create in-memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Seed products and default carts
    this.seedProducts();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      phone: insertUser.phone || null,
      campus: insertUser.campus || null,
      dormitory: insertUser.dormitory || null,
      profileImage: insertUser.profileImage || null,
      bio: insertUser.bio || null,
    };
    this.users.set(id, user);

    // Create a default cart for the user
    const cartId = this.currentCartId++;
    const defaultCart = {
      id: cartId,
      userId: user.id,
      name: "My Cart",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true,
    };
    this.carts.set(cartId, defaultCart);

    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductWithSeller(
    id: number
  ): Promise<ProductWithSeller | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const seller = this.users.get(product.sellerId);
    if (!seller) return undefined;

    return {
      ...product,
      seller,
    };
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.sellerId === sellerId
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      tags: insertProduct.tags || null,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = {
      ...product,
      ...productData,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async markProductAsAvailable(
    id: number,
    isAvailable: boolean
  ): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    // Update product availability and reset sold/rented status if making available
    const updatedProduct = {
      ...product,
      inStock: isAvailable,
      isSold: isAvailable ? false : product.isSold,
      isRented: isAvailable ? false : product.isRented,
      rentalAvailable: isAvailable && product.availableForRent ? true : false,
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getProducts(
    params: {
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
      featured?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Product[]> {
    let filteredProducts = Array.from(this.products.values());

    // Apply filters
    if (params.category) {
      const categoryLower = params.category.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === categoryLower
      );
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    if (params.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= params.minPrice!
      );
    }

    if (params.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price <= params.maxPrice!
      );
    }

    if (params.featured !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.featured === params.featured
      );
    }

    // Apply sorting
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

    // Apply pagination
    if (params.limit !== undefined) {
      const offset = params.offset || 0;
      filteredProducts = filteredProducts.slice(offset, offset + params.limit);
    }

    return filteredProducts;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const featuredProducts = Array.from(this.products.values()).filter(
      (product) => product.featured
    );

    return limit ? featuredProducts.slice(0, limit) : featuredProducts;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchLower = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }

  // Cart management operations
  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.currentCartId++;
    const cartName = insertCart.name || "My Cart";
    const cart: Cart = {
      ...insertCart,
      id,
      name: cartName,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: insertCart.isDefault ?? false,
    };

    // If this is the default cart, make sure no other cart for this user is default
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

  async getCarts(userId: number): Promise<CartWithItems[]> {
    const userCarts = Array.from(this.carts.values()).filter(
      (cart) => cart.userId === userId
    );

    return Promise.all(
      userCarts.map(async (cart) => {
        const items = await this.getCartItems(cart.id);
        return {
          ...cart,
          items,
        };
      })
    );
  }

  async getCart(id: number): Promise<CartWithItems | undefined> {
    const cart = this.carts.get(id);
    if (!cart) return undefined;

    const items = await this.getCartItems(id);
    return {
      ...cart,
      items,
    };
  }

  async getDefaultCart(userId: number): Promise<CartWithItems | undefined> {
    const defaultCart = Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId && cart.isDefault
    );

    if (!defaultCart) return undefined;

    const items = await this.getCartItems(defaultCart.id);
    return {
      ...defaultCart,
      items,
    };
  }

  async updateCart(id: number, data: Partial<Cart>): Promise<Cart | undefined> {
    const cart = this.carts.get(id);
    if (!cart) return undefined;

    const updatedCart = {
      ...cart,
      ...data,
      updatedAt: new Date(),
    };

    // If setting this cart as default, unset default on other carts
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

  async setDefaultCart(
    userId: number,
    cartId: number
  ): Promise<Cart | undefined> {
    // Find the cart to set as default
    const cart = this.carts.get(cartId);
    if (!cart || cart.userId !== userId) return undefined;

    // Update all carts for this user
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

  async deleteCart(id: number): Promise<boolean> {
    const cart = this.carts.get(id);
    if (!cart) return false;

    // Delete all items in the cart
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === id
    );
    cartItems.forEach((item) => {
      this.cartItems.delete(item.id);
    });

    // Delete the cart
    return this.carts.delete(id);
  }

  // Cart item operations
  async getCartItems(cartId: number): Promise<CartItemWithProduct[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId
    );

    return cartItems.map((item) => {
      const product = this.products.get(item.productId)!;
      return {
        ...item,
        product,
      };
    });
  }

  async getCartItem(
    cartId: number,
    productId: number
  ): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.cartId === cartId && item.productId === productId
    );
  }

  async getCartItemById(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in cart
    const existingItem = await this.getCartItem(
      insertCartItem.cartId,
      insertCartItem.productId
    );

    if (existingItem) {
      // Update quantity
      return this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + (insertCartItem.quantity || 1)
      ) as Promise<CartItem>;
    }

    // Create new cart item
    const id = this.currentCartItemId++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      quantity: insertCartItem.quantity || 1,
      isRental: insertCartItem.isRental || false,
      rentalStartDate: insertCartItem.rentalStartDate || null,
      rentalEndDate: insertCartItem.rentalEndDate || null,
      rentalDays: insertCartItem.rentalDays || null,
      addedAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemRentalDates(
    id: number,
    startDate: Date,
    endDate: Date
  ): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    // Calculate rental days
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const diffDays = Math.ceil((endTime - startTime) / (1000 * 3600 * 24));

    const updatedItem = {
      ...cartItem,
      isRental: true,
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      rentalDays: diffDays,
    };

    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async updateCartItemQuantity(
    id: number,
    quantity: number
  ): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(cartId: number): Promise<void> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId
    );

    cartItems.forEach((item) => {
      this.cartItems.delete(item.id);
    });
  }

  async moveCartItem(
    itemId: number,
    toCartId: number
  ): Promise<CartItem | undefined> {
    const item = this.cartItems.get(itemId);
    if (!item) return undefined;

    // Check if cart exists
    if (!this.carts.get(toCartId)) return undefined;

    // Check if product already exists in target cart
    const existingItem = await this.getCartItem(toCartId, item.productId);

    if (existingItem) {
      // Update quantity of existing item
      await this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + item.quantity
      );

      // Remove the original item
      this.cartItems.delete(itemId);

      return this.cartItems.get(existingItem.id);
    }

    // Move to new cart
    const updatedItem = { ...item, cartId: toCartId };
    this.cartItems.set(itemId, updatedItem);
    return updatedItem;
  }

  // Order operations
  async createOrder(
    insertOrder: InsertOrder,
    insertOrderItems: CreateOrderItem[]
  ): Promise<Order> {
    // Create order
    const orderId = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id: orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertOrder.status || "pending",
      notes: insertOrder.notes || null,
      deliveryMethod: insertOrder.deliveryMethod || "shipping",
      meetupLocation: insertOrder.meetupLocation || null,
      trackingNumber: insertOrder.trackingNumber || null,
      contactPhone: insertOrder.contactPhone || null,
    };
    this.orders.set(orderId, order);

    // Create order items
    insertOrderItems.forEach((item) => {
      const orderItemId = this.currentOrderItemId++;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId,
        isRental: Boolean(item.isRental), // Ensure boolean type
        rentalStartDate: item.rentalStartDate || null,
        rentalEndDate: item.rentalEndDate || null,
        rentalDays: item.rentalDays || null,
      };
      this.orderItems.set(orderItemId, orderItem);

      // Update product sold status
      const product = this.products.get(item.productId);
      if (product) {
        this.products.set(item.productId, {
          ...product,
          isSold: Boolean(!item.isRental), // Mark as sold only if not a rental
          isRented: Boolean(item.isRental), // Mark as rented if it's a rental
        });
      }
    });

    // Get user's carts to clear them
    const userCarts = Array.from(this.carts.values()).filter(
      (cart) => cart.userId === insertOrder.userId
    );

    // Clear all user's carts
    for (const cart of userCarts) {
      await this.clearCart(cart.id);
    }

    return order;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter((item) => item.orderId === id)
      .map((item) => {
        const product = this.products.get(item.productId)!;
        return { ...item, product };
      });

    return {
      ...order,
      items,
    };
  }

  async getOrdersByUser(userId: number): Promise<OrderWithItems[]> {
    const userOrders = Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );

    // For each order, get its items with product details
    return Promise.all(
      userOrders.map(async (order) => {
        const orderWithItems = await this.getOrder(order.id);
        return orderWithItems as OrderWithItems;
      })
    );
  }

  async getOrdersBySeller(sellerId: number): Promise<OrderWithItems[]> {
    // Find all order items that belong to this seller
    const sellerOrderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.sellerId === sellerId
    );

    // Get unique order IDs - convert Set to Array for iteration
    const orderIds = Array.from(
      new Set(sellerOrderItems.map((item) => item.orderId))
    );

    // Get full orders with items
    const orders: OrderWithItems[] = [];
    for (const orderId of orderIds) {
      const order = await this.getOrder(orderId);
      if (order) {
        // Filter items to only include those for this seller
        order.items = order.items.filter((item) => item.sellerId === sellerId);
        orders.push(order);
      }
    }

    return orders;
  }

  async updateOrderStatus(
    id: number,
    status: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date(),
    };
    this.orders.set(id, updatedOrder);

    // If the order is completed, update the product status
    if (status === "completed") {
      // Get order items
      const orderItems = Array.from(this.orderItems.values()).filter(
        (item) => item.orderId === id
      );

      // For each item, update the product status
      for (const item of orderItems) {
        const product = this.products.get(item.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            isSold: item.isRental ? product.isSold : true,
            isRented: item.isRental ? true : product.isRented,
            inStock: item.isRental ? product.inStock : false, // Only if sold, not if rented
          };
          this.products.set(item.productId, updatedProduct);
        }
      }
    }

    return updatedOrder;
  }

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      comment: insertReview.comment || null,
    };
    this.reviews.set(id, review);

    // Update product rating
    const product = this.products.get(review.productId);
    if (product) {
      const productReviews = await this.getProductReviews(review.productId);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / productReviews.length;

      const updatedProduct = {
        ...product,
        rating: averageRating,
        reviewCount: productReviews.length,
      };
      this.products.set(product.id, updatedProduct);
    }

    return review;
  }

  async getProductReviews(productId: number): Promise<ReviewWithUser[]> {
    const reviews = Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );

    return reviews.map((review) => {
      const user = this.users.get(review.userId)!;
      return {
        ...review,
        user,
      };
    });
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }

  // Rental operations
  async createRental(insertRental: InsertRental): Promise<Rental> {
    const id = this.currentRentalId++;
    const rental: Rental = {
      ...insertRental,
      id,
      createdAt: new Date(),
      status: insertRental.status || "pending",
      returnDate: null,
      depositAmount: insertRental.depositAmount || null,
      notes: insertRental.notes || null,
    };
    this.rentals.set(id, rental);

    // Update product rental status
    const product = this.products.get(rental.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        isRented: true,
        rentalAvailable: false,
      };
      this.products.set(product.id, updatedProduct);
    }

    return rental;
  }

  async getRental(id: number): Promise<RentalWithDetails | undefined> {
    const rental = this.rentals.get(id);
    if (!rental) return undefined;

    const product = this.products.get(rental.productId)!;
    const renter = this.users.get(rental.renterId)!;

    return {
      ...rental,
      product,
      renter,
    };
  }

  async getUserRentals(userId: number): Promise<RentalWithDetails[]> {
    const rentals = Array.from(this.rentals.values()).filter(
      (rental) => rental.renterId === userId
    );

    return rentals.map((rental) => {
      const product = this.products.get(rental.productId)!;
      const renter = this.users.get(rental.renterId)!;
      return {
        ...rental,
        product,
        renter,
      };
    });
  }

  async getProductRentals(productId: number): Promise<RentalWithDetails[]> {
    const rentals = Array.from(this.rentals.values()).filter(
      (rental) => rental.productId === productId
    );

    return rentals.map((rental) => {
      const product = this.products.get(rental.productId)!;
      const renter = this.users.get(rental.renterId)!;
      return {
        ...rental,
        product,
        renter,
      };
    });
  }

  async updateRentalStatus(
    id: number,
    status: string
  ): Promise<Rental | undefined> {
    const rental = this.rentals.get(id);
    if (!rental) return undefined;

    const updatedRental = {
      ...rental,
      status,
    };

    // If completing rental, set return date and update product availability
    if (status === "completed" && !updatedRental.returnDate) {
      updatedRental.returnDate = new Date();

      // Make the product available for rent again
      const product = this.products.get(rental.productId);
      if (product) {
        this.products.set(product.id, {
          ...product,
          isRented: false,
          rentalAvailable: product.availableForRent || false,
        });
      }
    }

    this.rentals.set(id, updatedRental);
    return updatedRental;
  }

  // Message operations
  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      isRead: false,
      productId: insertMessage.productId || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getUserMessages(userId: number): Promise<MessageWithUsers[]> {
    const messages = Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );

    return messages.map((message) => {
      const sender = this.users.get(message.senderId)!;
      const receiver = this.users.get(message.receiverId)!;
      let product = null;
      if (message.productId) {
        product = this.products.get(message.productId)!;
      }

      return {
        ...message,
        sender,
        receiver,
        product: product || undefined,
      };
    });
  }

  async getConversation(
    user1Id: number,
    user2Id: number
  ): Promise<MessageWithUsers[]> {
    const messages = Array.from(this.messages.values()).filter(
      (message) =>
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    );

    // Sort by creation date
    messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return messages.map((message) => {
      const sender = this.users.get(message.senderId)!;
      const receiver = this.users.get(message.receiverId)!;
      let product = null;
      if (message.productId) {
        product = this.products.get(message.productId)!;
      }

      return {
        ...message,
        sender,
        receiver,
        product: product || undefined,
      };
    });
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Helper to seed products
  private seedProducts(): void {
    // Create a default user if needed for product seeding
    if (this.users.size === 0) {
      const defaultUser: User = {
        id: this.currentUserId++,
        username: "admin",
        password: "admin123", // This would be hashed in a real application
        email: "admin@example.com",
        name: "Admin User",
        phone: null,
        campus: null,
        dormitory: null,
        profileImage: null,
        bio: null,
        createdAt: new Date(),
      };
      this.users.set(defaultUser.id, defaultUser);
    }

    const sellerId = 1; // Using the default user as seller

    const demoProducts: InsertProduct[] = [
      {
        name: "Smart Watch Pro",
        description:
          "Advanced smartwatch with heart rate monitoring, GPS, and 5-day battery life.",
        price: 129.99,
        category: "Electronics",
        sellerId,
        mainImage:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        condition: "new",
        availableForRent: false,
        featured: true,
        inStock: true,
        isNew: true,
        onSale: false,
        rating: 4.5,
        reviewCount: 24,
      },
      {
        name: "Ultra Thin Laptop",
        description:
          "Powerful laptop with 16GB RAM, 512GB SSD, and stunning 4K display.",
        price: 999.99,
        category: "Electronics",
        sellerId,
        mainImage:
          "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
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
        reviewCount: 42,
      },
      {
        name: "Wireless Headphones",
        description:
          "Premium noise-cancelling headphones with 30-hour battery life.",
        price: 79.99,
        category: "Electronics",
        sellerId,
        mainImage:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        condition: "used",
        rating: 4,
        reviewCount: 18,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true, // Updated for Summer Sale 2025
        oldPrice: 99.99,
        tags: ["Summer Sale 2025"], // Added tag
      },
      {
        name: "Sport Sneakers",
        description:
          "Lightweight, breathable sneakers perfect for running and everyday use.",
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
        onSale: false,
      },
      {
        name: "Digital Camera 4K",
        description:
          "Professional-grade digital camera with 4K video recording and 24MP photos.",
        price: 449.99,
        category: "Electronics",
        sellerId,
        mainImage:
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
        condition: "used",
        rating: 5,
        reviewCount: 59,
        inStock: true,
        featured: true,
        isNew: false,
        onSale: false,
      },
      {
        name: "Bamboo Watch",
        description:
          "Eco-friendly bamboo watch with Japanese movement and leather strap.",
        price: 69.99,
        category: "Accessories",
        sellerId,
        mainImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUSExMWFhUXGBkbFRYXGBcYFxcYGxgYGBgaFxcaHSggGRolHxgYITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0lHyUtLS0tLS0uLy0tLS8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIARoAswMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAAAgMEBQYBB//EAEgQAAEDAgMDCQUFBgQFBAMAAAEAAhEDIQQSMQVBUQYTImFxgZGxwTJCodHwByNScpIUFVNi4fFDgrLCM2NzorODk8PSJCVE/8QAGQEAAgMBAAAAAAAAAAAAAAAAAAMBAgQF/8QALREAAgEDAwIFAwQDAAAAAAAAAAECAxESBCExQVETFCIycTNhkSOBsfBCQ9H/2gAMAwEAAhEDEQA/APcUIQgAQhCABCEIAEEoWe5a7U5qgWNPTqSB1N94+neqzkoq7LQi5SUUUO3+Vj3PLKLi1gsC3V3XO4Kn/f8AXj/iv/W75qpJNkLlyqSbu2daNGEVaxau27X/AI1T9bvmufvut/Gqfrd81WQlZVXJ9y3hx7Fl++q38ap+t3zR++q38Wp+t3zVZF4hJIU5PuGEexbfvqt/Fqfrd811m2K38Wp+t3zVUhrijJ9wwj2NHgdo1XXNV8D+d3dvVxsrbT2VAKhJY615teJus9SZkYBv7fePoIjuRSqazv8AHtKFVlF3FOlGSPUUKv2DiucoMJ1Ayu7R/SD3qwXWjLJXRy5KzsCEIUkAhCEACEIQAIQhAAhM4rENptLnaDxPUFRVuULplrWtb/NcnwNkudWMOWXhTlPg0NR4AJJgASTwA1XlHKLabq9V1QC2jATHRB/ue9XfKXlK6oDh2NjTO6dbTAHDisy4dIEC4uDvBiLQseorKWy4N2moOPqa3EODRI6U9cAbiLX+vBIpFsS4OzboIgdZJF95sN3XZ10m5HjJ1vqlEOMyJ4yCeA8gPALLkjZZjVGmbktc4CPY0OkyS0xHfqu0gXGzHFsTEyRpAkNiJm8btErKeA6rW6rePikc1r0W3MmwAJ0k8eCMkFmcf0nANadfZEkxfS3tQuVzuDcp0uS4yDBkiPCJkpzmybwJuNBMbx2dSTzZ4deg1+d0ZInFnK1MtjM2N+pE7jPCTuF7p7ZNGXibhtzbrt8fJRnsLd0d3grbYQmlJglziY6gcvnmPei6KyTSE49/Sjc0DxIkpDHxAm/Hj3qbX2dmcS0w4k2OknrFx8VS4wvY803NOZpE+Yg8IhQ11Kprg2/JHabWZ2VHtYDlc3MQBNwbnuWwa4ESDI4rxau81G5S0636wtV9nLqjar2Fx5stJDToHAi4G6xK2aava0GZNRQ5mj0BCELeYAQhCABCEIAEIQgDOcqcWQW0xHEz12Hfr4rPObq6TbyVrtI56zz1wNPdtI8FCxNLKx56iuNXbnNs6tFKMUjJVK0VXzvP+0Ad1lNbVEXhWew9mYfEVC6qJApk+05mhaASWkaSfgrXEbJ2c22VzuptSqfjmA+KlUG45XS+Rj1EYvGzMy2s3xQKrdbK6ODwfu4Vx63Vqo8nFQq+zWF0tYWN3AOcQLDe4yUuUUuqYyNRPo1+P+kRr26fW9c5xv12dqmM2U3r80ipsoDf4g/NULZxIXPtGvpdBxLOr4J5+zf5Qe8+qYdgmjVkeKCckRsVi2GwI+vIK5wdENp0xAjJPC5GY+ZVY3Z9MmBTBJWiAgNA0EfXwQysmN4QHM2dJtM+fBN8oacVp4sB+Jb5AKRQpnM2eMb+5c5TDpMPFp+B/qmx+k/kQ/qIpgAr7khUjEAcQ4fCfRULQtTyY2LUD21XgsAuAfaPduCnTpuaaQV2lBpmwQhC7JyAQhCABCEIAEiq+ASdwJ8EtV23Ma2nSMm7rNG88fgqylimy0VdpFBUgdImOP12lRn4lz5a1vR4kajqHcu08OXmXHjaLCw+vDgpT+bpNzEwN8rkbs6eyIOF2WL2gk3679SmPwcRMaX49XqhtarVuxmVu575EjqbqU9+wA3qPc/q9lvgPUp8NNKXT8iZahIYy0w67gO/64rmdh9IE/Vk+XUWaZG+E/Ncdjm6T8D8k1aSPVi3qJdER69ekyMz2tnTMQ2TGgmJ3eK7DXewQR1GR8Cszym2001uZa85mNkgB2pg6xGmXxVB+3mS5pBIJBMCZBgjNGYRfeqvSJ8SLLUSXKPQqmHsTFon6Ci1cOR/ZZLCcsX07Okj9YHc85j+vuWn2Xyio1xYi13QZgcXNIDmi2pGX+YpNTTSiNhXiwaCySAL62+oT+HxLTAg5p9k7+wqXVoyJFwRui/eq+rhhdZ2mh6aZMaLtvvHmNFB5YOI5kgx7c/9icwlctMG+8HeO7eucrRIouiR0/iGEeXwTYfTkV/2RKfZJPPUiSfbbv8A5gvW14/h33HatDsvl+/MW1qXRDoD22JHHLv+CfpakYJpi9ZSlJpxN+hIpVA5ocDIIBB4g3CWuicwEIQgAQhJq1A0FxMAXJQBH2hjW0mZjc+6N5PBZxrHVHc5UOvgBuA6k49zq7y91mj2RwHz4qFjcY57v2ehGciXOPs02XlzuvgPo8+pN1ZWXHT7m2EVTjd89fsLx2M6XM0W5ql5G5o/E87gl4bANZ95VcKjx7zvYZ+Rpt3lcaKeGpwJMm5N31XcT9WVRiMWaxLSSCNGjdOhHE9fknKMKW73ZS8qnGyLPG7cAMNBJPvHTWNNTchMsc97y15JtI3CLg26j5hRqODc9ozWcNTFjBFx1GxV3hqEAbyARJ1Nt6h1HLksoRiV1PAk08u8SAT1E5T5KccIJB0iSfAj1UlrUnEugHrsquRKRk3bDnEurkg5gbdpHyULFcmj+z1KTSC9/O9LQDnXPcT3NefBayL/AFxKTFz9blnyY8xu2OT4dUpMa2G9IvcB7rWQ1s8S5zT2NKye0thVGVKjsO533BEuzZHNdlzkMeIu1paSbe0vXalO/wBdSpts7IFSk5jMrczi51oDj0SQ4i9zEm+m9MhWlEpKnGRieTP2hGm7msX0RJ+9ggT/AM6m0W/6jBO8tfqPT6VZtUAtIgtBsQQQ4kgtIs5pGjhIMHgvOuUfJVlbm6LWRVylzsRBhrRaD+Ml1g3cATbfnOTnKKvsnEHB4uTRB93pGlmualLix1i5lp6nAFNcI1VdcicpUnZ7o9drUN4Ckta2vTNF9jq13WNDHHd1glDMQ2pTDmlpDgCC0y1zXAZXMO9hvB6iDBBC66lBkTx+KxxvB2f7mpvNXX7GaqYZ1N5Y8QR4HrB3hRsC0RcXkz4lbDGYYV2T/iM0PHq7D8D3rJ4RsEg/iPmoqQx3XDHQqZrflHq2yxFGkP8Als/0hSlG2b/waf5G/wCkKSuxHhHFfIIQhSQCotu187hRboCC/r4DyPgrjE1gxpcdAJWbwjbOqO1Jk9pk/XYs2ontj3/gfQjvkNbVxopU8rRme6Gsb+Jx3dmpPYmaNJuFpOzHM89Kq/e9+5o6hoAmdl/eVX4o3a0mnQ7ffePIdgVRt3HuLxlgsY6LzGaDLj3jKO/iqw/Thk+WXa8SeK4QV8Q6qeca4ZgSANWgCRkPDrOsqbgcNmyvc3K4TAJuNxEjUf0VdsljajucALT7w3Om4ncdbGxWkoMgD63pF23dmh2Ssh5jFJaPVNhON9D6K4th8vVRcW+XRwA+M/JSTu7FXuMuJ7PVUm+haCFDX64lJA1+uCU0X7/UoA1+t4Sxh0+19cQm3i311Jb/AGj2+q4RbuQBErUvVYflZyapPpHDhj6lZ78zapu/PfPUq1IgN9mRvEBosI9DLfM+qhY6l7RH1rCtGTjuiGk9meW/Zvt+phMQdl4kwC8iiSbU6joOWf4VXo30Di13Fe0Nh3ZA11BFiCOIMiO1eI/aLsRrmGoapqYmmAatgBzZDbBoswNkEAkkgkmdV6J9m/KT9twjajzNZhFOtxLwJbU/ztuf5qbuKfVSnHxFz1EQvCWD46Gha7I6QLKdgdh0KlR1QgkmDEw02F4G8701XEiUvZeJgjqN+w6pdFq+MuC9S9rxNKAurgK6uiYAQhCAKflFV6LaY9437B/U/BU3KLEGnQys9pxDGfmcC0HuBJ7lZ7ROauf5QB6+qp6p5zF0WH2aYfVd2gBrPjmWJ+urb+7Gtemnf+7htCMPQFNnuNDG/mOp8z3LM81UaRlLXN0LDY9zhr1yFacosSM7A5wAALnEmBLjlEnx8VXbLwzQ4Fj3FsezmzN6omSI6iq15XnbsNoRxhfuXez8OGiGgDXTiSVZtHn81Fw7VLjTtPqEtEscJExN7239fmPEJweh9FFxuHDxBnUEEGCDxBFwetVD9sVMK4MxQLqbrMrtGulqjRo7rGvDWGJXKN2L3EOgd0eSgt17h6p2piGva1zHBzTcEGQbBNs3fW4JM/cMjwLbqux5D0XGi663Xw9FCJZx3tHt9Ubu75prE12szOc4AC5JMAAHUk6LJ43luHvNHBUziKm93s0mdbnHUdkA7irKLZDaRrq1VrQXOIaBckkAAcSToFVfvLnb0hLDpUIIaf8ApjWoOuzTNnHRV2A2HUqOFTGVOffMhkZaFMz7lL3iPxPk9i0LqWvFDsSrmY2jg6YJqvpuqTlBaG5y8+6S0ACRYSYAAE6SsTyBrOwG2HYN0sp4joAOOhd95hiTo5wdDD+Zy9SxbLW13eBXkn2l4atSqUMYXMFQOyg0w4ZS2H07uPSM5rwNNE7Ty3xfUVqF6b9j3mnc9RA8hqo7Ya+Nx/slbPxQrNZWb7NVrKjfy1GtqfAuI7kYpm9Kaxfwy0XkvlGh2dUlg4i3gpSq9jVPaHGD81aLowd0YZKzBCEKxUz1V0uqHrd/u/oqfZt6+Jf+FlNg7znP+pWz9an5nKq2Rrij/wAyn/4wsVHep+f5NVXaH4KPa1eKzzlc67Ww1ubQCbcJld2IxhlzWZSYDpYWEkcZAnXXtUXa1WoKjiwT946bT7wHdvU3YVR7gS8QZtaJEDceuR3JEt5N/c1raKL6ipDN3b80xQ39qfZoEIoxx+vejEYdtRhY9oc0iCD2pNTUdqXUdDT2eqvco1c8i5Q4XF7Nrur0Hk0HkaiW6ABtVvHQBwgniN9/yf5dUcQWsqfdVJAgnouNvZd6GD2rW4mg2o0seA5rgAQbggg7l5Ryk5K0MPVzOqgUXTkpnMajnCJZ0b82JkuHSgZR0nAq8camz5Kyyp7rg2vJyo2hhA57g0c5iHuJIAANaqQSTYWjVU+2vtJp05Zhm86/c8yKczaB7T91hAO4rDVeexVSmw1gc7iGtJc2m0tAuxpJub2E3BvBC9E5J8jKdAte7p1LdNwuPyj3fPrUyjGDvLdvoEZSkrLZGfwuxcZtBwqYyo5tOZFLQ9zdGdpBd5rf7K2LTosDGNDWjcOPEnUnrKn0qIbMD6gp5314pEpuXI5RUeDrBp2/JJqfXwSmajt+SQ/Q9/kFUCNWFivN/tMwLf2So81Huc17XNDnCBLsvRYABYO1uY3r0mqbH63rzrl5Uo8xim80OcLQDUytmQaTru9rQtHcr0naaCavB/BtfsxxJqbMwbzqKbmf+1VqMb/25VpMcOiFjvsfP/6qh1OxH/kb81sMaegOwplbaUhNHeKHNn40MqNFyS1xgCTAIBPiR4qwft+gGc6XjmwYNS2QEOyEEzudIPAg8FmOac6uMpIiluaSbvjcx3Dq791NygxTP2RuJaXGhnpDKGdGOcax3SFPiD73fuWmj7EZ6vuZ6m1wIkGQdChRNlCKTRwkeBK4nCiqr+0/td5qp2SIfih/NSd3ZA30VvjxFZw438R9eCq6Iy4tzf4lAx1uY8nyIWKk7VbfJrqb0zObSpv514a4N6c3bm1II3hTNktIAzOk8YA3i0BM7fojnbkgODSSHFuhg3G6yZ2NVpAltMg/iIkiZbq42JtpKRNWk19zTF3gmaahp3qQ0qLQdZPtNvrghFWPFJrutHV6rqZe6c3d6qW9iEtxs/L1VLjNg4Z9TnX0muePedLiA24AzE5QOAgXV1w7lC2i6KdQ8KdQ+DCVVN3LW2M47kPhKjabixzamRri9j3h2fKDIvAg6WstVg6WVrRJdEXMSbHWAB4Ic2HAcAB8Eulu7vJyHJvkFFIUN/1uK6fl5pE6/W5LB8x5hVLCqOo7R6Jt+h7T5NS6Go7k2/Q9/kFJAzX39p8wvOvtFrEYXEfci+QCrLD/AIjZt7QJAjuXouJPtdp815L9qmIqMpNpOqhwfUzAZMroZm1IMES4bgmUVeaK1HaDPQvslpxsjC9fPu8a5aP9C1GOPRHZ5lROTeB5jB4egRDqdCk144PLQ9/xeVKxdyBwHyVq79TF0dooqsSH/tLAwNJNJ3tHLo9hsebf+LSBuTOPqMqtz82DSp1qctDZfmpVWB4DOan2mu0N+qbajZuFa5/Sa12VvvAGNNJVwzCUwZDGg8Q0A+MLXR9iM1V+oRs1v3bZBHw3ncUKUhNFFLtynD2P6iD8fmqLbL8jqOIH+G5s/kd0XebT3LWbUo5qZA1Fx3f0lZqtTD2OYRIIIPYbeSwVv06mX7myl64WK3lNhhrYhrt+hY4jxtCpcPiXZw1rCGjVzuiNQOiLk/AK9puL6OV930vu6nWPcd3g+SzGMpVM4YNACHXgG4gneQRCnUR3Ul1LaeW2L6GtwrrKXNlRbGe1jBSzAuaLgbgZgdXV2K5a63ikjWh55TQNndo8kuoU3ud2jyUMEcGo7lC2iJp1BxY4fqGX1UxuoUTF6DrdSHjVYPVQuUS+CTV9sopaD/L5OSXe0u0tB2N8nKCTo39o9Etu7tHmFynqe30CG6jtHohEMVQ1Hd6JqodU5RNwmKzvrxUgV22sVTYwirZj3FpJBLbz7RAhoOkmF5a/AMx22qOEYS6hTeM8uL2hjPvK0Ekw2AW8J7VquVHKOrhW1nvAgucKTSLGzg2HD2tA5wOknSy59h+wiyjVx9QdOuSymTrzTXA1Xf5ngN/yOWmgrJzYjUO7UEemOfmk8TPZeY9E1lk/X1uXXG3miiDr4dqzr1Ma/Si62NTs53Ex4KyTGCpZWNadQn104KyOfJ3YIQhWKgs3jqHN1D+EzHYd3cVpFE2ng+cYRvFx8u9JrU84/cbSnjIyO1Pu3itEtLQysOLLQ7taTM/JUu1sNDtd1nD3mm4I+tVooPsnd9EKsxuEDPuiegT9y86MJ/w3fyncfWc2ejNSXhyH1IuLziVFCtkDadJskybzlHFzzqfMrQ0akgj83bvhZo1TTcWuERqDuKlUK4osLj06jzHW52jWjg0fASeKVODg7MfCamro0TnXHWfVA0PaPJQGY9manTLgHm8XjWNdNdxupjHWP5lQloUPX5KJiL5R/PT+Dg7/AGqTKYqe3S/P/wDHUPohcgx12pXaW7sb6pJNylU93YFHUnoKZv7R6Lo1Hd6JLT5jySKlUCJIEloHWYFhxKhAxxpuFQ7Vx1IudQqktBYXSSWhzQSXFrwbFtidCNUvFY1tQVqQqOpOp+0+zSy2dtQE2LD8YcF5Zyg5QV9pPp4DDMzuLgHFt+ceJu0n2aQBJkxaZsE6nTc2LnUUFcTTp1ds45mGZUe7DUiSargAW0genVeALvIhotc5bCSveaVFlJjabG5WMa1rGfhY0ANb4a9ZKouRnJils/D80whz3EOrVY/4j90b+bbJyjfJdvCuq1Qz2/KFevUVsIi6VNt5yOSZ+XorXZWGl0nRvmoGGYbDeYHeVpcNRDGho7+sq2np9WVr1OiHUIQtpkBCEIAEIQgCn2zs7N02a+8OI4jrVKXBzcjgCCCO2y2SzW38OKbg4Czp7JHlM+axaij/AJxNdCr/AIszG1dmyIcbAdGpqWj8NTi2/tf2dlsVjX4Z4ZUbIEx2aEsO/Uj4WuvQadaN3UoG0NisqtyQCPwO0B/lIuw9nXAEqkK6axqF50XF5QMvsfEtqVRVztcBeBOYWtmadIj4jgr7D7TigazhcnM1uhgmKbe09HvJWL23yMrU3ZsO4z7rHEMqdWR4OVx6gQRvVFV5WYvDkU8RTzZXBwbUBpvzNMjpCzhN9CrPT33g7olajpNHsNTENBY0m7iQ3rIBcfgCgwXsuOgczrjogsc0E8NT4FeZYb7SaBqMfVZVZla8QA14zOLbzIOjY03qyZ9oOB+/JrEF4AaDTqaCmANG8S7xS/CmuhfxIPqbptdrgXBwLeIII8U42qAQJuRYcY18wvNaPLvBtw9RnOHMTLQGP3BkXiNWqPtX7UaGem6jSqOLCfbysDgWObEguOpB091QqM2+AdWmup6W7FTzjWRnaYvpmLJbP8t/gVjOU/KKi2nRxD3htSINKZqAgQ7K2bFr2kSYB42WLHKTaePqvGEpvbmDQ4UWuMAZoLqh9j2ndKW/BaDk39kznnnsfVmbmlTcCSdfvK928Qcmc9YTVQUVebFPUXdoIztfFY3bVfm6FINaGgPIOVjWTOavU/DMkN8ATr69yL5IUNn0iGdJ7h97WcIdU/lDf8OlPu6n3uCt9nbPo0KbaVFjWMbdrWiGg2vckufHvOJdrdFSqdFWpqEvTBbEwotvKfIurWtbfr4/XgjDUzvvxKZY2TB1P14JrbmJLWik3V13fl/qZ8OtJirLKQ57+lD2HxWfE0mM9gPH+aLk9g3f2W3XnnJef2qkPz/6HL0NbNI3KLb7mTVLGSS7AhCFqMwIQhAAhCEACp+VDfuh+YfEFXCg7bpZqLxvAkd1/RLrK8GhlJ2mmY5kjQyOHCJ3p2jVvM3G4jQpjMoO1sUWtGWM3HhHDrK46d9mdVxLl1YlsECCRM3GhTWI2fRqNLXNGXc0hrmgcAx4LR3BSuT+z+ewzKhe4vOaTFrPc0DLroOKfrbHqt0GbssfA+i0eFVjvEz+JTk8WYzHfZvgKknmGtP8hqMPweWD9KqXfZBgzJDqwHDn2euGW/fRqNkOa4dcHzhNiruKPHqx5I8Gm+DEYf7I8EHdI1ndRrtjwbQafirrAcgNn0rjD0ieLw+ofCq5zP8AtV4XncuOfxMfBDr1WSqNND7BTa0NAsNG+6PysHRbu0AXHYu8KFUxTd7p7L+Si1McfdHj/RJbk/cxsYpcIsqlS11GdWLjDR36f3UPZuMZWc9pzZmRLTpB0LeI1HH4TaWmer0VW7bFkhzZ1IAk7954qt2ves48IHwnzJVvgd/cs5tFxNapB95w8DHorv6aKr3stuSQ/wDyx+V/p81vlhuRAnEOJ3UzH6mrcrfpF+mYtU/1AQhC1GYEIQgAQhCABCEIAEIQgAQhCABRajZMqSUhQyU7EfmUcypCFGJORH5pHNKQhRiGRH5pHNKQhGIZEfml0Uk+uhGIZER9GSnsMITi63VSkDYtCEKxUEIQgAQhCAP//Z",
        condition: "used",
        rating: 4.5,
        reviewCount: 27,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false,
      },
      {
        name: "Apple Watch Series 6",
        description:
          "Smartwatch with fitness tracking, heart rate monitor, and GPS.",
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
        oldPrice: 59.99,
      },
      {
        name: "Wireless Mouse",
        description:
          "Ergonomic wireless mouse with long battery life and responsive tracking.",
        price: 24.99,
        category: "Electronics",
        sellerId,
        mainImage:
          "https://www.portronics.com/cdn/shop/files/Image1_5067bdd1-4473-4933-a66d-edcb4d49409a.png?v=1720258592&width=1445",
        condition: "used",
        rating: 4,
        reviewCount: 32,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false,
      },
      {
        name: "Designer Backpack",
        description:
          "Stylish and functional backpack with laptop compartment and water bottle pocket.",
        price: 59.99,
        category: "Accessories",
        sellerId,
        mainImage:
          "https://images.unsplash.com/photo-1622560480605-d83c661469e5",
        condition: "used",
        rating: 4.5,
        reviewCount: 38,
        inStock: true,
        featured: true,
        isNew: true,
        onSale: false,
      },
      {
        name: "Coffee Maker",
        description:
          "Programmable coffee maker with thermal carafe and auto shut-off.",
        price: 79.99,
        category: "Home & Kitchen",
        sellerId,
        mainImage:
          "https://assets.epicurious.com/photos/62741684ef40ea9d3866a0be/16:9/w_2560%2Cc_limit/breville-bambino-espresso-maker_HERO_050422_8449_VOG_Badge_final.jpg",
        condition: "used",
        rating: 4,
        reviewCount: 21,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: false,
      },
      {
        name: "Fitness Tracker",
        description:
          "Water-resistant fitness tracker with heart rate monitor and sleep tracking.",
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
        onSale: false,
      },
      {
        name: "Portable Bluetooth Speaker",
        description:
          "Waterproof Bluetooth speaker with 12-hour playtime and deep bass.",
        price: 34.99,
        category: "Electronics",
        sellerId,
        mainImage:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
        condition: "used",
        rating: 4.5,
        reviewCount: 63,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true, // Updated for Summer Sale 2025
        oldPrice: 49.99,
        tags: ["Summer Sale 2025"], // Added tag
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
        oldPrice: 49.99,
      },
      {
        name: "Lipstick",
        description: "MAC Red lipstick",
        price: 14.99,
        category: "Beauty",
        sellerId,
        mainImage:
          "https://sdcdn.io/mac/ca/mac_sku_M0N904_1x1_0.png?width=1080&height=1080",
        condition: "new",
        rating: 4.5,
        reviewCount: 63,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        oldPrice: 49.99,
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
        oldPrice: 49.99,
      },
      {
        name: "Ball",
        description: "Nike Size 6 football.",
        price: 34.99,
        category: "Sports",
        sellerId,
        mainImage:
          "https://rukminim3.flixcart.com/image/850/1000/jwgple80/ball/c/n/g/410-440-5-68-premier-league-strike-1-sc3311-1015-football-nike-original-imafgk4xqeh4gw4b.jpeg?q=90&crop=false",
        condition: "used",
        rating: 3.5,
        reviewCount: 634,
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true, // Updated for Summer Sale 2025
        oldPrice: 49.99,
        tags: ["Summer Sale 2025"], // Added tag
      },
    ];

    // Create products with proper typing
    demoProducts.forEach((productData) => {
      const id = this.currentProductId++;

      // Handle the image/mainImage conversion
      let mainImage = productData.mainImage;
      if ("image" in productData && !mainImage) {
        mainImage = productData.image as unknown as string;
      }

      // Create a properly typed product object
      const product: Product = {
        id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        sellerId: productData.sellerId,
        mainImage: mainImage || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        condition: productData.condition || "used",
        images: [],
        location: null,
        availableForRent: productData.availableForRent || false,
        rentalAvailable: productData.availableForRent || false,
        rentalPrice: productData.rentalPrice || null,
        rentalMinDays:
          "rentalMinDays" in productData
            ? (productData.rentalMinDays as unknown as number)
            : null,
        rentalMaxDays:
          "rentalMaxDays" in productData
            ? (productData.rentalMaxDays as unknown as number)
            : null,
        featured: productData.featured || false,
        inStock: productData.inStock !== undefined ? productData.inStock : true,
        isNew: productData.isNew || false,
        onSale: productData.onSale || false,
        oldPrice: productData.oldPrice || null,
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        isSold: false,
        isRented: false,
        tags: productData.tags || [],
      };

      this.products.set(id, product);
    });
  }
}

export const storage = new MemStorage();
