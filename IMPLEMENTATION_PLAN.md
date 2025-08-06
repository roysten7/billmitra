# BillMitra - Restaurant Billing & Management System

## 📋 Project Overview
A mobile-first, full-featured restaurant management system with billing, inventory, and reporting capabilities.

## 🏗️ Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Offline Support**: Dexie.js (IndexedDB)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (multi-tenant)
- **Authentication**: JWT + Role-based access
- **Deployment**: Oracle Cloud VM, NGINX + PM2
- **UI Components**: Radix UI + shadcn/ui

## 📁 Project Structure

```
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── components/       # Reusable UI components
│   │   ├── config/          # App configuration
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper utilities
│   └── ...
├── server/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   └── ...
└── ...
```

## 🚀 Implementation Phases

### Phase 1: Core Setup & Authentication
- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Tailwind CSS with custom theme
- [ ] Implement authentication flow (login, register, forgot password)
- [ ] Set up JWT authentication middleware
- [ ] Create basic layout components (Header, Sidebar, Footer)
- [ ] Implement role-based routing

### Phase 2: Restaurant & Outlet Management
- [ ] Super Admin: Restaurant CRUD operations
- [ ] Restaurant Admin: Outlet management
- [ ] User management with role assignments
- [ ] Subscription management

### Phase 3: Menu & Inventory
- [ ] Menu category management
- [ ] Menu item management with variants
- [ ] Inventory management with low stock alerts
- [ ] Recipe management (ingredient mapping)

### Phase 4: Billing System (Core)
- [ ] Table management
- [ ] Order management
- [ ] Split/merge bills
- [ ] KOT generation
- [ ] Payment processing

### Phase 5: Reporting & Analytics
- [ ] Sales reports
- [ ] Inventory reports
- [ ] Staff performance
- [ ] Export functionality (PDF/Excel)

### Phase 6: Offline Support & PWA
- [ ] Implement Dexie.js for IndexedDB
- [ ] Offline data sync
- [ ] PWA setup
- [ ] Background sync

### Phase 7: WhatsApp Integration
- [ ] Bill sharing via WhatsApp
- [ ] Template management
- [ ] Notification system

## 🛠️ Component Breakdown

### Shared Components
- `Button` - Custom button component with variants
- `Input` - Form input with validation
- `DataTable` - Reusable data table with sorting/filtering
- `Modal` - Custom modal/dialog
- `Toast` - Notification system
- `Loading` - Loading states

### Billing Components
- `TableGrid` - Visual table layout
- `OrderPanel` - Current order items
- `ItemGrid` - Menu items display
- `PaymentModal` - Payment processing
- `BillPreview` - Bill preview/print

## 📊 Database Schema (Key Tables)

### Authentication
- `users` - User accounts
- `roles` - User roles and permissions
- `sessions` - Active user sessions

### Restaurant Management
- `restaurants` - Restaurant details
- `outlets` - Restaurant outlets
- `subscriptions` - Subscription plans

### Menu & Inventory
- `menu_categories` - Menu categories
- `menu_items` - Menu items
- `item_variants` - Item variants
- `ingredients` - Inventory items
- `inventory_transactions` - Stock movements

### Orders & Billing
- `tables` - Restaurant tables
- `orders` - Customer orders
- `order_items` - Items in orders
- `bills` - Generated bills
- `payments` - Payment records

## 🔄 API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Restaurants
- `GET /api/restaurants`
- `POST /api/restaurants`
- `GET /api/restaurants/:id`
- `PUT /api/restaurants/:id`
- `DELETE /api/restaurants/:id`

### Menu
- `GET /api/menu/items`
- `POST /api/menu/items`
- `GET /api/menu/items/:id`
- `PUT /api/menu/items/:id`
- `DELETE /api/menu/items/:id`

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `POST /api/orders/:id/pay` - Process payment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- PNPM (recommended)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd billmitra_v1

# Install dependencies (client)
cd client
pnpm install

# Install dependencies (server)
cd ../server
pnpm install

# Set up environment variables
cp .env.example .env

# Start development servers
cd ../client
pnpm dev

# In another terminal
cd ../server
pnpm dev
```

## 📝 Coding Standards
- Follow TypeScript strict mode
- Use functional components with hooks
- Follow Airbnb JavaScript Style Guide
- Write unit tests for critical components
- Document complex logic with JSDoc
- Keep components small and focused

## 📅 Next Steps
1. Set up the initial project structure
2. Implement authentication flow
3. Create basic layout components
4. Set up database models and migrations
5. Implement core API endpoints

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
