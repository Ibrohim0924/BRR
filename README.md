# Non va Suv Hisob-kitob Tizimi
## Bread and Water Business Operations System

A comprehensive business management system for bread (non) and drinking water (suv) production and sales operations.

## Features

### 🏠 Dashboard (Bosh sahifa)
- Real-time production and sales overview
- Today's statistics and trends
- Current inventory levels
- Top customer debts
- Sales analytics charts

### 📦 Warehouse Management (Ombor)
- Raw material inventory tracking
- Stock movements (in/out)
- Low stock alerts
- Material cost management

### 🛒 Sales & Distribution (Tarqatish)
- Quick customer search
- Product sales recording
- Multiple payment types (cash, bank transfer, credit)
- Return management
- Real-time inventory updates

### 👥 Customer Management (Mijozlar)
- Customer information storage
- Debt tracking and management
- Sales history
- Payment records

### 💰 Expense Management (Xarajatlar)
- Multiple expense categories
- Monthly expense tracking
- Expense reporting

### 📊 Reports (Hisobotlar)
- Daily/monthly sales reports
- Expense summaries
- Customer debt reports
- Export to Excel/PDF

### ⚙️ Admin Panel (Sozlamalar)
- User management
- Product price management
- System configuration

## Technology Stack

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Authentication**: JWT with role-based access control
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator, Class-transformer

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd non-va-suv-hisob-kitob-tizimi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=non_suv_db
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-secret-key-here
   ```

4. **Database Setup**
   
   Make sure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE non_suv_db;
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

### Initial Data

The system automatically seeds initial data on first run:
- **Default Users**:
  - Admin: username=`admin`, password=`admin123`
  - Accountant: username=`accountant`, password=`accountant123`
  - Sales: username=`sales`, password=`sales123`
- **Sample Products**: Bread varieties and water bottles
- **Raw Materials**: Flour, yeast, salt, filters, bottles
- **Sample Customers**: For testing purposes

## API Documentation

Once the application is running, access the interactive API documentation at:
```
http://localhost:3000/api
```

## User Roles and Permissions

### Admin
- Full system access
- User management
- Delete operations
- System configuration

### Accountant
- Financial operations
- Expense management
- Warehouse operations
- Reports generation

### Sales
- Sales transactions
- Customer management
- Basic reporting

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Create new user (admin only)

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/monthly-report` - Monthly performance report

### Products
- `GET /products` - List all products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Customers
- `GET /customers` - List customers with search
- `POST /customers` - Create new customer
- `GET /customers/:id` - Get customer details
- `POST /customers/payments` - Record payment

### Sales
- `POST /sales` - Create new sale
- `GET /sales` - List all sales
- `GET /sales/:id` - Get sale details
- `PATCH /sales/:id/return` - Process returns

### Warehouse
- `GET /warehouse/materials` - List raw materials
- `POST /warehouse/materials` - Add new material
- `POST /warehouse/movements` - Record stock movement
- `GET /warehouse/materials/low-stock` - Get low stock alerts

### Expenses
- `GET /expenses` - List expenses
- `POST /expenses` - Create new expense
- `GET /expenses/monthly/:year/:month` - Monthly expense report

## Database Schema

### Core Entities

- **Users**: System users with role-based access
- **Customers**: Business customers and their information
- **Products**: Bread and water products
- **Raw Materials**: Production inputs (flour, yeast, etc.)
- **Sales**: Sales transactions with items
- **Payments**: Customer payment records
- **Expenses**: Business expense tracking
- **Warehouse Movements**: Stock in/out tracking

### Relationships

- Customers have many Sales and Payments
- Sales have many Sale Items
- Products are used in Sale Items
- Raw Materials have many Warehouse Movements
- Users create Sales, Expenses, and Movements

## Development

### Running Tests
```bash
npm run test
npm run test:e2e
```

### Code Quality
```bash
npm run lint
npm run format
```

### Building for Production
```bash
npm run build
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set secure JWT secret
4. Enable SSL/TLS
5. Set up reverse proxy (nginx)
6. Configure monitoring and logging

## Support and Maintenance

The system includes:
- Comprehensive error handling
- Request validation
- Authentication and authorization
- Audit trails for critical operations
- Performance optimization
- Scalable architecture

## License

This project is licensed under the UNLICENSED license.