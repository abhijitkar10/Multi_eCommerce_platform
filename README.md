

## 1. INTRODUCTION

### 1.1 About the Project

E-commerce is one of the most dynamic and rapidly growing industries in India and across the globe. With a growing number of consumers seeking unique, personalized, and seamless shopping experiences, the demand for digital platforms that facilitate and optimize online shopping has surged. Recognizing this opportunity, we propose ShopSavvy, an intelligent, database-driven e-commerce management system that serves as a one-stop platform for buyers, sellers, and product management.

ShopSavvy enables users to browse products, purchase or rent items, manage their accounts, and get personalized recommendations—all within a unified interface. It addresses current market gaps such as fragmented shopping systems, lack of real-time inventory information, and minimal personalization. Leveraging modern frontend and backend tools alongside a robust PostgreSQL database, ShopSavvy ensures scalable, secure, and user-friendly services tailored to each user's unique preferences.

### 1.2 Objectives

The primary objectives of ShopSavvy are:

- To design a centralized e-commerce portal integrating product listings, purchasing, and rental options
- To support multiple user types (buyers, sellers, and administrators)
- To enable real-time updates and notifications for orders, inventory, and deliveries
- To offer personalized product suggestions using user preferences and browsing history
- To provide a responsive interface that works across all devices
- To ensure secure user authentication and authorization using modern practices like JWT and OTP verification
- To integrate visual tools and user-friendly interactions for enhanced shopping experience

### 1.3 Scope of the Project

The scope of the ShopSavvy project spans several functional areas of e-commerce:

- **User Management**: Users can register, log in, manage their profiles, and maintain preferences like budget, delivery preferences, and payment methods
- **Product Management**: Comprehensive product listing with details including price, condition, images, and seller information
- **Order Processing**: End-to-end order management from cart to delivery
- **Rental System**: Specialized module for managing product rentals with time periods and deposits
- **Reviews & Social Features**: Users can post reviews, ratings, and share products
- **Communication**: Messaging between buyers and sellers with notification system
- **AI Integration**: Chatbot support and intelligent product recommendations
- **Future Scope**: Expand to international markets, integrate AR product previews, and add advanced analytics

## 2. PROBLEM DEFINITION

### 2.1 Description

The modern-day shopper is highly dependent on digital solutions to browse and purchase products. However, the current ecosystem faces several challenges:

- **Poor Personalization**: Most systems offer generalized recommendations that fail to match individual preferences
- **Inconsistent Data**: Information on inventory, pricing, and availability is not always synchronized in real-time
- **Lack of Unified Experience**: Users often have to navigate between buying and renting platforms
- **Limited Communication**: Minimal direct interaction between buyers and sellers
- **Inadequate Support**: Many platforms lack intelligent support systems for quick resolution of queries

ShopSavvy aims to eliminate these limitations by providing an interactive, data-driven platform that unifies the entire shopping journey—from product discovery to purchase or rental completion.

## 3. SYSTEM STUDY

### 3.1 Drawbacks of Traditional E-Commerce Systems

| Drawback | Description |
|----------|-------------|
| Manual Product Comparison | Users manually browse and compare products from different sources |
| Disjointed Buying/Renting | Separate platforms for purchasing and renting items |
| Generic Recommendations | Current systems do not cater to individual interests or needs |
| Lack of Real-Time Updates | Inventory and pricing changes aren't reflected immediately |
| Poor Mobile Experience | Many platforms aren't optimized for all device types |
| Limited Payment Options | Few payment methods with inconsistent checkout experiences |
| Inadequate Customer Support | Slow response times and limited self-service options |

### 3.2 Proposed System – ShopSavvy

The proposed system is a modular, cloud-deployable e-commerce database system that overcomes the above limitations by offering:

- **Integrated Modules** for product browsing, purchasing, renting, and user management
- **User-Centric Experience** powered by a flexible preference-based recommendation engine
- **Real-Time Updates** with socket-based push notifications for inventory and order status
- **Responsive Design** that works seamlessly across all device types
- **Personalized Recommendations** generated using preferences, browsing history, and purchase patterns
- **Intelligent Support System** with AI-powered chatbot integration
- **Secure Authentication** using JWT tokens and SMS verification

### 3.3 Benefits of the Proposed System

| Feature | Benefit |
|---------|---------|
| Modular Architecture | Easy to maintain, extend, and upgrade |
| Type-safe ORM | Reduced bugs and improved data integrity |
| Multi-user Access | Separate roles for buyers, sellers, admins |
| Real-Time Systems | Users receive up-to-date info instantly |
| Reviews and Ratings | Builds trust and guides user decisions |
| Recommendations Engine | Better suggestions based on behavior and interests |
| Unified Buy/Rent Options | More flexible shopping experience |
| Personalized Dashboards | Streamlined UX for each user role |

## 4. SYSTEM ARCHITECTURE

The architecture follows a 3-tier structure:

1. **Presentation Layer (Frontend)**
   - Tech: React.js, Next.js, Tailwind CSS, ShadCN/UI
   - Purpose: Displays pages for product browsing, cart management, user profiles, etc.

2. **Application Layer (Backend)**
   - Tech: Node.js, Express.js
   - Purpose: Manages user authentication, business logic, APIs, and real-time messaging

3. **Database Layer (Data Storage)**
   - Tech: PostgreSQL with Drizzle ORM, Neon for hosting
   - Purpose: Stores user info, products, orders, rentals, reviews, messages, etc.

**Tools Integrated:**
- JWT for secure user authentication
- Twilio for SMS-based verification
- OpenAI API for intelligent chatbot support
- Elfsight for embedded customer support
- Zod for end-to-end validation

## 5. FEATURES

Below are the categorized features of the system:

### 5.1 User Features
- Register/Login (Email or Social Media with OTP verification)
- Profile Customization (Preferences, Purchase History)
- Responsive Design Support
- Personalized Dashboard
- Shopping Cart for Purchases and Rentals
- Payment Integration (with Multiple Options)
- View/Rate Products and Sellers
- Order Tracking

### 5.2 Seller Features
- Profile Management
- Product Listing and Inventory Management
- Real-Time Order Notifications
- Earnings Dashboard
- Order Fulfillment Tools

### 5.3 Admin Features
- User and Content Moderation
- Database Management (Products, Categories, Tags)
- Analytics Dashboard
- Promotion and Discount Management
- Verification of Sellers

### 5.4 Backend/Database Features
- PostgreSQL-based schema with Drizzle ORM
- Type-safe database interactions
- Review System
- Real-time inventory tracking
- Email and SMS Notifications
- Analytics and Reporting

## 6. FUNCTIONALITIES

The ShopSavvy system includes a wide variety of core functionalities organized based on user roles. Each role—Buyer, Seller, and Admin—has a tailored set of modules and tools that together form a comprehensive e-commerce platform.

### 6.1 Buyer Functionality

Buyers are the primary users of the system. They can search, browse, purchase, and rent products. Below are the functionalities available to them:

#### a. User Registration and Login
- Users can register via email with OTP verification through Twilio
- Secure login using JWT token-based authentication
- Password reset and profile recovery features

#### b. Profile and Preference Management
- Update personal info like name, address, and contact details
- Set shopping preferences: preferred categories, budget range, and size preferences
- Save favorite products and view purchase history

#### c. Product Discovery and Browsing
- Browse categorized products with filtering options
- View detailed descriptions, ratings, specifications, images, and seller information
- Compare products side by side

#### d. Shopping Cart System
- Add products to cart for purchase or rental
- Manage quantities and options
- Save cart for later purchases

#### e. Order Processing
- Multiple payment method options
- Address selection or addition
- Order confirmation and tracking
- Cancellation and return management

#### f. Rental Management
- Browse rental-eligible products
- Select rental duration and view deposit requirements
- Track rental period and return process

#### g. Reviews and Ratings
- Post reviews for products and sellers
- Rate services out of 5 stars and add textual feedback
- Upload images with reviews

#### h. Real-Time Notifications
- Receive alerts on order status, delivery updates, price drops
- Get personalized product recommendations
- Rental return reminders

#### i. Communication
- Direct messaging with sellers
- Support requests via chatbot or customer service
- Community forums for product discussions

### 6.2 Seller Functionality

Sellers can list products, manage inventory, and process orders through their specialized interface.

#### a. Registration and Store Setup
- Apply to become a verified seller
- Set up store profile with branding and policies
- Configure payment methods and shipping options

#### b. Product Management
- Add new products with multiple images, descriptions, and specifications
- Define price, inventory, condition, and shipping details
- Manage product variations (size, color, etc.)

#### c. Order Management
- View and process incoming orders
- Update order status and provide tracking information
- Manage returns and refunds

#### d. Inventory Control
- Real-time stock updates
- Low inventory alerts
- Bulk product upload and management

#### e. Analytics and Reporting
- Track sales performance and revenue
- View customer demographics and buying patterns
- Monitor product performance and review metrics

### 6.3 Admin Functionality

Admins are responsible for overseeing the system's operation, maintaining database health, and ensuring platform integrity.

#### a. User Management
- View and manage registered buyers and sellers
- Suspend or ban accounts for policy violations
- Reset passwords or assist in account recovery

#### b. Product Oversight
- Review and approve new seller accounts
- Monitor product listings for policy compliance
- Remove inappropriate or prohibited items

#### c. System Configuration
- Manage categories, tags, and attributes
- Configure payment gateways and shipping methods
- Set up promotional campaigns and discounts

#### d. Analytics and Reporting
- View platform-wide metrics and performance indicators
- Generate sales reports and revenue analysis
- Monitor user engagement and conversion rates

#### e. Support Management
- Oversee customer service tickets
- Configure chatbot responses and functionality
- Maintain FAQ and help documentation

### 6.4 Common System-Wide Functionalities

These are functionalities that cut across all user roles:

- **Responsive Design**: All interfaces adapt to desktop, tablet, and mobile devices
- **Search Functionality**: Advanced search with filters, sorting, and suggestions
- **Notification System**: Email, SMS, and in-app alerts for important events
- **Security Features**: Data encryption, secure authentication, and fraud detection
- **Performance Optimization**: Caching strategies and optimized database queries
- **Error Handling**: User-friendly error messages and recovery options

## 7. DATA FLOW DIAGRAM

### 7.1 CONTEXT DIAGRAM

1. **Central Process: ShopSavvy**
   The ShopSavvy system serves as a comprehensive e-commerce platform that orchestrates multiple services including product management, order processing, rental services, payment processing, and communication. The system integrates various modules to deliver end-to-end shopping solutions while maintaining user profiles, preferences, and purchase histories.

2. **External Entities**
   
   2.1 **Administrators**
   Administrators interact with the system to:
   - Manage product categories and attributes
   - Oversee user accounts and seller verifications
   - Monitor platform activity and performance
   - Review and process refunds
   - Configure system settings and integrations
   - Manage promotional campaigns
   
   2.2 **Buyers**
   Buyers engage with the system to:
   - Register accounts and maintain profiles
   - Browse and search products
   - Add items to cart and complete purchases
   - Track orders and manage returns
   - Submit reviews and ratings
   - Rent products for specific durations
   - Communicate with sellers
   
   2.3 **Sellers**
   Sellers use the system to:
   - Create and manage product listings
   - Process orders and update shipping status
   - Manage inventory and product variations
   - View sales analytics and performance metrics
   - Communicate with buyers
   - Configure store settings and policies
   
   2.4 **External Services**
   - Payment processors handling transactions
   - Twilio for SMS verification
   - OpenAI API for chatbot intelligence
   - Elfsight for customer support widgets
   - Cloud storage for product images

3. **Data Stores**
   
   3.1 **Primary Database**
   Contains interrelated tables organized into functional categories:
   
   3.1.1 **User Management**
   - Users: Core user information with roles and credentials
   - User Preferences: Personalized settings and preferences
   - Addresses: User shipping and billing addresses
   
   3.1.2 **Product Management**
   - Products: Complete product information and inventory
   - Categories: Hierarchical product categorization
   - Tags: Additional product classification
   - Product Images: Visual assets for products
   
   3.1.3 **Order Management**
   - Orders: Purchase transaction records
   - Order Items: Individual items within orders
   - Order Status History: Tracking of order progress
   
   3.1.4 **Rental Management**
   - Rentals: Rental transaction records
   - Rental Periods: Duration and terms
   - Deposits: Security deposit information
   
   3.1.5 **Financial Management**
   - Payments: Transaction records
   - Refunds: Reimbursement processing
   - Payment Methods: Available payment options
   
   3.1.6 **Communication**
   - Messages: User-to-user communications
   - Notifications: System alerts and updates
   - Support Tickets: Customer service requests
   
   3.1.7 **Review System**
   - Product Reviews: User feedback on products
   - Seller Reviews: Ratings for seller performance
   - Review Images: Visual content with reviews

4. **Data Flows**
   
   4.1 **Buyer → ShopSavvy**
   - Registration and profile data
   - Product search and browsing activity
   - Cart additions and order submissions
   - Payment information and shipping details
   - Review submissions and ratings
   - Rental requests and return confirmations
   
   4.2 **ShopSavvy → Buyer**
   - Product listings and search results
   - Order confirmations and tracking updates
   - Personalized recommendations
   - Notification alerts
   - Receipt of messages from sellers
   
   4.3 **Seller → ShopSavvy**
   - Store setup and configuration
   - Product listings and inventory updates
   - Order processing and status changes
   - Return and refund processing
   - Messaging to buyers
   
   4.4 **ShopSavvy → Seller**
   - Order notifications
   - Analytics and performance metrics
   - Inventory alerts
   - Buyer messages and inquiries
   
   4.5 **Admin → ShopSavvy**
   - System configuration updates
   - User management actions
   - Product approval or removal
   - Promotion creation and management
   
   4.6 **ShopSavvy → Admin**
   - Platform metrics and analytics
   - User activity reports
   - Issue alerts and system status
   - Revenue and performance indicators

### 7.2 SCHEMA DIAGRAM

[A detailed schema diagram would be included here showing all tables and their relationships]

### 7.3 ER DIAGRAM

[A comprehensive entity-relationship diagram would be included here]

## 8. TECHNOLOGIES USED

### FRONTEND
1. React.js
2. Next.js
3. Tailwind CSS
4. ShadCN/UI
5. Zod (for form validation)
6. Context API

### BACKEND
1. Node.js
2. Express.js
3. JWT Authentication
4. Twilio API
5. OpenAI API

### DATABASE
1. PostgreSQL
2. Drizzle ORM
3. Neon (PostgreSQL hosting)

## 9. INSTALLATION

1. Clone the repository
   ```
   git clone https://github.com/username/shopsavvy.git
   ```

2. Install dependencies for frontend
   ```
   cd frontend
   npm install
   ```

3. Install dependencies for backend
   ```
   cd backend
   npm install
   ```

4. Set up environment variables
   - Create `.env.local` in frontend directory
   - Create `.env` in backend directory
   - Add necessary environment variables as per documentation

5. Set up database
   - Configure PostgreSQL connection in backend `.env`
   - Run database migrations:
     ```
     npm run migrate
     ```

6. Start the development servers
   - Frontend:
     ```
     npm run dev
     ```
   - Backend:
     ```
     npm run start
     ```

7. Access the application at `http://localhost:3000`

## 10. LOGIN DETAILS

### Admin:
- Email: admin@shopsavvy.com
- Password: [Would be provided separately]

### Sample User:
- Email: user@example.com
- Password: [Would be provided separately]

### Sample Seller:
- Email: seller@example.com
- Password: [Would be provided separately]

## 11. SCREENSHOTS

[Screenshots of various pages and features would be included here]

## 12. CONCLUSION

In conclusion, our ShopSavvy e-commerce database serves as a comprehensive and efficient solution for managing online shopping experiences. It streamlines product discovery, enhances user experience, and supports better decision-making for both buyers and sellers. By integrating key features such as real-time updates, user-friendly interfaces, and detailed analytics, this database significantly improves the overall shopping experience.

The development and implementation of ShopSavvy represent a transformative step in redefining personalized shopping experiences through a robust PostgreSQL database-driven platform. By enabling users to browse, purchase, and rent products within a unified interface, the platform empowers shoppers to make informed decisions with confidence and ease. The successful integration of real-time notifications, secure authentication, and intelligent support systems fosters meaningful connections between buyers, sellers, and the platform itself.

Looking ahead, ShopSavvy sets a strong precedent for future advancements in the e-commerce industry, offering a blueprint for integrating technology with personalized shopping experiences. The platform's detailed analytics and responsive design pave the way for data-driven decision-making, benefiting both shoppers and sellers. As the platform continues to evolve, opportunities to incorporate emerging technologies, such as augmented reality product previews or advanced AI-driven recommendations, could further elevate the user experience. This project's success underscores the potential of technology to transform online shopping into a more interactive, inclusive, and enriching journey, positioning ShopSavvy as a leader in the digital commerce landscape.
