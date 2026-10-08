# Beary Baby App

## Description:

Beary Baby App is application that display products, product gallery for the app and pricing.Mobile First and display mostly on apple mobile

## Intent:

My only goal is to display my products when I am talking to my customer.

It is not a website for everyone. It helps me to display my products.

I want very simple application. No need for ERP application or complicated process ordering.

What I need application on first page display engaging about my shop. Use very simple English.

Also Add sections where display categories when category selected.

In header: I want search where you can search products name (flexible on searching product name).

It enter product page list with filtered by a categories.

Then there are links for products and login(this login is for admin only).

Product page this will display my list of my products. Displaying in list of cards products, price and main image list.

In product page add filter by categories, price range..

Add sort by price high to low, by categories, by name a to z.

When click the product card it will redirect to product detail page where

Main product picture

Product name

Product Price

Product Description

Product Galleries(Carousel)

### Theme:

Abstract color pink with beary baby icon.

## Specification:

### Package Manager:

Bun

### Hosting:

Vercel

### Framework:

Running on NextJS Application

### CSS:

TailwindCSS and DaisyCSS

### Authentication:

NextJS

* Use username and password credential \- env based credentials
* No other authentication. Only username and password env base credentials.

### Database:

* Drizzle ORM
* Namespace: beary
* Use public: no
* Migration: No Default Drizzle. Manual Migration

### Package:

* NextAuth
* Daisy tailwind css
* React Virtual Scroll

### Schema:

\`\`\`FeatureProducts:

* Id: uuidV7
* Order: number;
* ProductId: Product

Categories:

* Id: uuidV7
* Name: string;
* ImageURL: string; image url.
* Slug: string;

Products:

* Id: uuidV7
* Slug: string;
* Name: string;
* Code: string; Product Code
* Description?: string;
* Price: double;
* Available: boolean;
* Stocks?: number;
* ImageURL: string;
* DisplayPrice: boolean; default true

ProductGalleries:

* Id: uuidV7
* ProductId: Product;
* ImageURL: string; Image Link;
* Order: number;

\`\`\`

### Infrastructure:

* Presentation
* Application
  * ProductService
  * CategoryService
  * ImportService
* Domain
  * Product
  * Category
  * Gallery
* Infrastructure
  * Drizzle
  * ImageProvider

### Code:

* Use src/app/ instead of app
* Customer: /src/app/customer
* Admin: /src/app/admin

## Plan:

1. Create NextJS Application using Bun
2. Create a header with BearyBaby
  1. With Label itself is home
  2. Products link
  3. Search Bar
  4. Login(For admin credentials only)
3. Build a frontend page
  1. Theme:
    1. Abstract Color Pink App
  2. Pages
    1. Home
      1. Hero Section \- Tells about BearyBaby
      2. Category Section \- list of categories.
      3. Product Features Section \- list of favored products.
    2. Product
      1. Filter and Sort Section
        1. Filter
          1. By Category
          2. By Name
          3. By Price
        2. Sort
          1. By Category (A to Z or Vice Versa)
          2. By Name
          3. By Price
      2. Product List Cards
        1. Card
          1. Image
          2. Name
          3. Price in Philippine Pesos
      3. Load More
        1. Functionality
          1. Do not display all products
4. Build Backend Page:
  1. Login (Only Admin Credential No need for customer login)
    1. Username \= env.ADMIN\_USERNAME
    2. Password \= env.ADMIN\_PASSWORD
  2. CRUD Pages
    1. Product
      1. Product Images Management.
    2. Category
    3. Features Product
5. Functionalities:
  1. Batch Import of Product using CSV
  2. Hide products on display if unavailable and 0 stocks except nulled stocks
  3. All prices in Philippine pesos
  4. Images are stored externally when put on url linked. Only paste url
  5. In product details on front pages. Display other product with same category in random
  6. Search matches product names flexibly (partial match, case-insensitive), maybe also description.
  7. Mobile first
  8. In URL and display of image when paste and drag and order galleries
  9. Use query url params
  10. Slugs in crud should listen on name and slugify version of it

## Q and A

1. will you primarily operate the app on your phone and show it to them? Yes
2. Products? 20 \- 50
3. ProductCode?: product code is for admin
4. Unavailable Products? Pushed to the bottom that show unavailable
5. How should products with `Stocks = NULL` behave? If stocks null behave normally. If 0 pushed to the bottom and show out of stocks
6. Image hosted on imagebb. External Image URL
7. Product Image. Product Main Image
8. For CSV import, what should happen if a product code already exists? Skip it

Which of these do you explicitly want to avoid?

* ❌ Shopping cart
* ❌ Online checkout
* ❌ Customer accounts
* ❌ Customer registration
* ❌ Orders
* ❌ Payment processing
* ❌ Inventory management
* ❌ Sales reports
* ❌ Customer database
* ❌ Notifications
* ❌ Complex permissions
* ❌ ERP functionality

\- SingleNextJS App? beary-bary/(customer)\- Should the customer-facing pages be primarily Server Components, with Client Components only where interaction is required? For your use case, I'd strongly favor **Server Components by default**.\- What database are you actually planning to use with Drizzle? Supabase PostgreSQL\- Should `Code` be globally unique? Yes UNIQUE\- Do products need `createdAt` and `updatedAt`? Yes\- Do you need product-category many-to-many relationships? Yes\- Prefer Server Action over REST API? Yes\- Do you expect hundreds or thousands of products, or is the catalog likely to remain below a few hundred? Only about 20 \- 50 products\- If the product name changes, should the slug automatically change too, or should the existing slug remain unchanged? Remain unchanged only for create when slugs is change base on name\- add validation if slugs already exist and code exists on database before create and update\- If a product is deleted, should its galleries and category relationships automatically be deleted as well? yes\- What should happen if a product has `Available = true` but `Stocks = 0`? Should `Stocks = 0` always win and display:\- Do you actually need both `Available` and `Stocks`, or should availability be derived from stock? Recommend best.\- Should products with `Available = false` be completely hidden from customers, or merely pushed to the bottom like stock-zero products? How about if available display but stocks is zero pushed to bottom.\- Should the admin enter prices as: 299 and the UI display: ₱299.00\- What should `DisplayPrice = false` display to customers? Hide to customer\- When a category is deleted, what happens to products assigned to it? Move them to "Uncategorized"\- Do you need category ordering? yes \- Should the category image be required? Optional.\- Should clicking a category on the home page navigate to: /products?category=baby-clothes\- Should the admin be able to paste multiple image URLs at once? yes

**Do you want Beary Baby to be "database-driven but extremely simple," or "static-first with database-backed admin"?**

For only **20–50 products**, I'd strongly consider: ┌───────────────┐ │ Next.js │ │ │

Customer ──────────►│ Server Pages │ │ │ │ │ ▼ │ │ Application │ │ │ │Admin ─────────────►│ Server Action │ │ │ │ └──────┼────────┘ │ Drizzle │ Supabase PostgreSQL

with **Server Components by default**, **Server Actions for mutations**, and **URL query parameters for catalog state**.