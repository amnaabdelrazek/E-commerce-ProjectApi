# E-Commerce Platform

A full-stack e-commerce application built with **.NET 8 (C#)** backend and **Angular 21** frontend, featuring complete shopping functionality, admin dashboard, seller management, and payment integration.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
  - [JWT Authentication](#jwt-authentication)
  - [PayPal Integration](#paypal-integration)
  - [Email Configuration](#email-configuration)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Features

### User Management
- User registration and login with JWT authentication
- Email verification
- User profile management
- Password change functionality
- Role-based access (Customer, Seller, Admin)

### Shopping
- Browse products by category
- Advanced product filtering
- Product reviews and ratings
- Add to cart and wishlist
- Coupon/discount application

### Checkout & Payment
- Secure checkout process
- **PayPal Integration** (Sandbox mode)
- **Credit Card Payment** support
- Order creation and tracking
- Order history

### Seller Management
- Seller registration and profile management
- Seller dashboard
- Product listing and management
- Sales analytics
- Order management
- Admin seller approval system

### Admin Dashboard
- Manage products and categories
- Manage users and roles
- Manage sellers and approvals
- View sales analytics
- Coupon management

### Additional Features
- Cart management
- Wishlist functionality
- Product reviews and ratings
- Order status tracking
- Comprehensive error handling

## Tech Stack

### Backend
- **.NET 8.0** - Web framework
- **C#** - Backend language
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT** - Authentication
- **PayPal SDK** - Payment processing
- **MailKit** - Email sending
- **Swagger/OpenAPI** - API documentation

### Frontend
- **Angular 21** - Frontend framework
- **TypeScript** - Language
- **Material Design** - UI library
- **Chart.js** - Data visualization
- **RxJS** - Reactive programming
- **JWT Decode** - Token handling
- **SweetAlert2** - User notifications

## Project Structure

```
E-commerce-ProjectApi/
├── E-commerce Project/              # Backend (.NET 8)
│   ├── Controllers/                # API endpoints
│   ├── Models/                     # Data models
│   ├── DTOs/                       # Data transfer objects
│   ├── Services/                   # Business logic
│   ├── Repositories/               # Data access layer
│   ├── Data/                       # Database context
│   ├── Helpers/                    # Utilities (JWT, etc.)
│   ├── Migrations/                 # Database migrations
│   ├── Program.cs                  # Application startup
│   ├── appsettings.json           # Configuration
│   └── E-commerce Project.csproj   # Project file
│
└── E-commerceFrontend/
    └── E-commerceProject/          # Frontend (Angular 21)
        ├── src/
        │   ├── app/
        │   │   ├── features/       # Feature modules
        │   │   ├── core/           # Core services & guards
        │   │   ├── shared/         # Shared components & utilities
        │   │   ├── app.component.ts
        │   │   └── app.routes.ts
        │   ├── main.ts             # Entry point
        │   ├── index.html
        │   └── styles.css
        ├── angular.json            # Angular configuration
        ├── package.json            # NPM dependencies
        └── tsconfig.json           # TypeScript configuration
```

## Prerequisites

### Backend Requirements
- **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** - Local or remote SQL Server instance
- **Visual Studio 2022** or **VS Code** (optional but recommended)

### Frontend Requirements
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 10+** - Comes with Node.js
- **Angular CLI 21** - Will be installed via npm

### Additional Requirements
- **PayPal Developer Account** - For payment integration ([Create Account](https://developer.paypal.com))
- **Gmail Account** - For email notifications (requires App Password)
- **Git** - For version control

## Installation & Setup

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd "E-commerce Project"
```

#### 2. Configure Connection String
Open `appsettings.json` and update the SQL Server connection string:
```json
"ConnectionStrings": {
  "Default": "Server=YOUR_SERVER;Database=EcommerceDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=True;"
}
```

**For Local SQL Server:**
```json
"Default": "Server=.;Database=EcommerceDb;Trusted_Connection=true;Encrypt=True;TrustServerCertificate=True;"
```

#### 3. Configure Secrets (JWT, PayPal, Email)
Update `appsettings.json` with your configuration:

```json
{
  "Jwt": {
    "Key": "YOUR_SUPER_SECRET_KEY_AT_LEAST_32_CHARACTERS",
    "Issuer": "EcommerceAPI",
    "Audience": "EcommerceClient",
    "DurationInDays": 7
  },
  "PayPal": {
    "ClientId": "YOUR_PAYPAL_SANDBOX_CLIENT_ID",
    "Secret": "YOUR_PAYPAL_SANDBOX_SECRET",
    "Mode": "sandbox",
    "FrontendUrl": "http://localhost:4200"
  },
  "EmailSettings": {
    "Email": "your.email@gmail.com",
    "Password": "your-app-password",
    "Host": "smtp.gmail.com",
    "Port": 587,
    "DisplayName": "E-Commerce"
  }
}
```

#### 4. Restore NuGet Packages
```bash
dotnet restore
```

#### 5. Create/Migrate Database
```bash
dotnet ef database update
```

This command will:
- Create the database if it doesn't exist
- Run all pending migrations
- Seed initial data if configured

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd "E-commerceFrontend/E-commerceProject"
```

#### 2. Install Dependencies
```bash
npm install
```

This installs all packages from `package.json` into the `node_modules` directory.

#### 3. Verify Installation
```bash
ng version
```

You should see Angular CLI and other tool versions.

#### 4. Configure API Base URL (if needed)
Check the proxy configuration in `proxy.conf.json` to ensure it points to your backend API:
```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false
  }
}
```

## Running the Application

### Start Backend API
```bash
cd "E-commerce Project"
dotnet run
```

The backend will start on `https://localhost:7000` (or the configured port).

**API Documentation (Swagger):** Open `https://localhost:7000/swagger` in your browser

### Start Frontend Application
```bash
cd "E-commerceFrontend/E-commerceProject"
ng serve
```

Or use npm:
```bash
npm start
```

The frontend will start on `http://localhost:4200` and automatically open in your browser.

### Verify Both Services Are Running
- **Backend API**: `https://localhost:7000` (should show Swagger)
- **Frontend App**: `http://localhost:4200` (should show login page)

## Configuration

### JWT Authentication

JWT (JSON Web Tokens) are used for stateless authentication.

**Configuration in `appsettings.json`:**
```json
"Jwt": {
  "Key": "your-super-secret-key-minimum-32-characters",
  "Issuer": "EcommerceAPI",
  "Audience": "EcommerceClient",
  "DurationInDays": 7
}
```

**Key Points:**
- The `Key` should be at least 32 characters long (longer is better)
- Tokens expire after the specified `DurationInDays`
- Use environment variables or User Secrets for sensitive data in production

### PayPal Integration

The application supports PayPal Sandbox for testing payments.

**Setup Steps:**
1. Create a [PayPal Developer Account](https://developer.paypal.com)
2. Navigate to Dashboard → Apps & Credentials → Sandbox
3. Create a **Business Account** and a **Personal Account** for testing
4. Copy the Client ID and Secret of the Business Account
5. Update `appsettings.json`:

```json
"PayPal": {
  "ClientId": "YOUR_SANDBOX_CLIENT_ID",
  "Secret": "YOUR_SANDBOX_SECRET",
  "Mode": "sandbox",
  "FrontendUrl": "http://localhost:4200"
}
```

**Testing PayPal Payments:**
1. Add items to cart
2. Proceed to checkout
3. Choose "Pay with PayPal"
4. Login with the **Personal Account** (test buyer)
5. Approve the payment
6. You'll be redirected back to confirm the order

**For Production:** Change `"Mode": "sandbox"` to `"Mode": "live"` and use live credentials.

### Email Configuration

The application sends emails for user verification and notifications.

**Gmail Setup:**
1. Enable 2-Step Verification on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Update `appsettings.json`:

```json
"EmailSettings": {
  "Email": "your.email@gmail.com",
  "Password": "your-app-password",
  "Host": "smtp.gmail.com",
  "Port": 587,
  "DisplayName": "E-Commerce"
}
```

**Note:** Use an app password, not your Gmail password, for security.

## Database

### Database Schema
The application uses **SQL Server** with Entity Framework Core. Key entities include:

- **ApplicationUser** - User accounts
- **Product** - Product catalog
- **Category** - Product categories
- **Cart & CartItem** - Shopping cart
- **Order & OrderItem** - Order management
- **Wishlist** - User wishlists
- **Review** - Product reviews
- **Seller** - Seller accounts
- **Coupon** - Discount codes

### Database Migrations
View migration history:
```bash
dotnet ef migrations list
```

Create a new migration after model changes:
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

## API Documentation

The backend API includes **Swagger/OpenAPI** documentation.

**Access Swagger UI:**
- URL: `https://localhost:7000/swagger`
- Lists all endpoints with request/response schemas
- Test endpoints directly from the browser

**Example Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `POST /api/cart/add` - Add item to cart
- `POST /api/orders/checkout` - Create order
- `POST /api/paypal/create` - Create PayPal payment

## Common Issues & Troubleshooting

### Issue: Cannot connect to SQL Server
**Solution:**
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure credentials are correct
- Check firewall settings

### Issue: CORS errors from frontend
**Solution:**
- Backend CORS is configured in `Program.cs`
- Ensure frontend URL matches the configured CORS policy
- Check proxy configuration in `proxy.conf.json`

### Issue: PayPal payment fails with "Bad Request"
**Solution:**
- Verify PayPal credentials in `appsettings.json` are correct
- Ensure Mode is set to "sandbox" for testing
- Check that test accounts exist in PayPal Sandbox
- See `PayPal Integration` section above

### Issue: Emails not sending
**Solution:**
- Verify Gmail app password (not regular password)
- Enable "Less secure apps" if using regular password (not recommended)
- Check email configuration in `appsettings.json`
- Look at backend logs for SMTP errors

### Issue: Frontend won't start with `ng serve`
**Solution:**
```bash
# Clear cache and reinstall dependencies
rm -r node_modules package-lock.json
npm install
ng serve
```

### Issue: Backend won't run with `dotnet run`
**Solution:**
```bash
# Clear build artifacts and try again
dotnet clean
dotnet build
dotnet run
```

## Development Workflow

### Backend Development
1. Make changes to models, services, or controllers
2. If you modified models, create a migration: `dotnet ef migrations add DescriptiveNameHere`
3. Update database: `dotnet ef database update`
4. Restart backend with `dotnet run`

### Frontend Development
1. Make changes to components, services, or styles
2. Angular watches for changes and auto-recompiles
3. Refresh browser to see changes

### Testing
- Backend: Use Swagger UI to test endpoints
- Frontend: Test through the application UI or use browser DevTools

## Deployment

### Backend Deployment
1. Build for production: `dotnet build -c Release`
2. Publish: `dotnet publish -c Release`
3. Deploy to hosting platform (Azure, AWS, etc.)

### Frontend Deployment
1. Build for production: `ng build --configuration production`
2. Output goes to `dist/e-commerce-project/`
3. Deploy to static hosting (Netlify, Vercel, etc.)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## License

This project is proprietary and for educational purposes.

## Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify all configuration settings are correct

---

**Happy coding!** 🚀
