# HerbSpot.fi 🪴

**Premium 510 Cartridges & Aromatherapy Devices**

A modern e-commerce platform built with Next.js 14, Shopify Storefront API, and integrated loyalty program with gamification features.

## 🚀 Features

### Core E-commerce
- ✅ **Product Catalog** - Browse premium aromatherapy products
- ✅ **Shopify Integration** - Real-time product data via Storefront API
- ✅ **Mock Checkout** - Stripe-powered checkout flow
- ✅ **Responsive Design** - Mobile-first dark/neon theme

### Loyalty & Gamification
- ✅ **Points System** - Earn points with every purchase
- ✅ **Tier System** - Bronze → Silver → Gold → VIP progression
- ✅ **QR Code Rewards** - Scan QR codes to claim points
- ✅ **Streak Tracking** - Maintain purchase streaks for bonus points
- ✅ **Dashboard** - Track points, orders, and rewards

### Design System
- 🎨 **Dark Theme** - Black/white with neon green (#39FF14) accents
- 🎨 **Modern UI** - Framer Motion animations, glassmorphism effects
- 🎨 **Typography** - Poppins font family for premium feel
- 🎨 **Accessibility** - WCAG compliant, keyboard navigation

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components, Server Actions
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Component library

### Backend & APIs
- **Shopify Storefront API** - Product data and inventory
- **Supabase** - Loyalty points, user data, real-time features
- **Stripe** - Payment processing (mock implementation)
- **NextAuth.js** - Authentication (ready for implementation)

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Render.com** - Deployment platform

## 🚀 Quick Start

### Prerequisites
- Node.js 20.10.0+
- npm or yarn
- Shopify store with Storefront API access
- Supabase account (optional for loyalty features)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd herbspot-fi
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your credentials:
   ```env
   # Shopify
   PUBLIC_STORE_DOMAIN=herbspot.myshopify.com
   PUBLIC_STOREFRONT_API_TOKEN=your-storefront-token
   
   # Supabase (optional)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Stripe (mock)
   STRIPE_SECRET_KEY=mock
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## 📱 Pages & Features

### Public Pages
- **/** - Hero section with featured products
- **/shop** - Full product catalog
- **/product/[handle]** - Individual product pages
- **/checkout** - Mock checkout flow

### User Dashboard
- **/account** - Account overview and order history
- **/account/orders** - Detailed order management
- **/account/loyalty** - Points, tiers, and QR codes

### Admin (Future)
- **/admin** - Product management
- **/admin/orders** - Order processing
- **/admin/analytics** - Sales and loyalty metrics

## 🎯 Loyalty Program

### Points System
- **2 points per €1** spent (Bronze tier)
- **2.5 points per €1** spent (Silver tier)
- **3 points per €1** spent (Gold tier)
- **4 points per €1** spent (VIP tier)

### Tier Benefits
- **Bronze** (0-499 pts): Basic rewards, free shipping over €50
- **Silver** (500-1499 pts): Priority support, free shipping over €30
- **Gold** (1500-3999 pts): Early access, exclusive discounts
- **VIP** (4000+ pts): Personal shopper, birthday surprises

### Gamification
- **QR Code Scanning** - Earn bonus points by scanning QR codes
- **Streak Tracking** - Maintain purchase streaks for multipliers
- **Progress Bars** - Visual progress to next tier
- **Achievement Badges** - Unlock special badges and rewards

## 🗄 Database Schema

### Supabase Tables (Optional)

```sql
-- Loyalty points tracking
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Bronze',
  streak INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Point transaction history
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  points_added INTEGER NOT NULL,
  reason TEXT NOT NULL,
  total_points INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- QR code tracking
CREATE TABLE qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  qr_data TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  scanned_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Render.com (Recommended)

1. **Connect repository** to Render
2. **Add environment variables** in dashboard
3. **Deploy automatically** on git push

```yaml
# render.yaml included in repository
services:
  - type: web
    name: herbspot-web
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### Vercel (Alternative)

```bash
npm install -g vercel
vercel --prod
```

### Environment Variables (Production)

```env
# Required
PUBLIC_STORE_DOMAIN=herbspot.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your-production-token

# Optional (for full loyalty features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe (replace mock with real keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
npm run format       # Format with Prettier

# Testing (future)
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

### Project Structure

```
herbspot-fi/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth pages
│   ├── account/        # User dashboard
│   ├── checkout/       # Checkout flow
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/             # shadcn/ui components
│   ├── ProductCard.tsx # Product display
│   ├── LoyaltyCard.tsx # Loyalty dashboard
│   └── QRDisplay.tsx   # QR code display
├── lib/                # Utilities
│   ├── shopify.ts      # Shopify API client
│   ├── loyalty.ts      # Loyalty system
│   └── utils.ts        # Helper functions
├── public/             # Static assets
└── render.yaml         # Render deployment config
```

## 🔧 Configuration

### Shopify Setup

1. **Create Custom App** in Shopify Admin
2. **Configure Storefront API scopes:**
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_customers`
3. **Copy Storefront Access Token**

### Supabase Setup (Optional)

1. **Create new project** at supabase.com
2. **Run SQL schema** (see Database Schema section)
3. **Enable RLS policies** for security
4. **Copy URL and anon key**

## 🎨 Customization

### Theme Colors
```css
:root {
  --herbspot-green: #39FF14;
  --herbspot-green-dark: #32E60A;
  --herbspot-black: #000000;
  --herbspot-white: #ffffff;
}
```

### Loyalty Tiers
Edit `lib/loyalty.ts` to customize:
- Tier names and colors
- Points thresholds
- Benefits per tier

### Product Display
Modify `components/ProductCard.tsx` for:
- Product layout
- Image handling
- Pricing display

## 📊 Analytics & Monitoring

### Built-in Features
- **Performance monitoring** - Core Web Vitals
- **Error tracking** - Console errors and API failures
- **User behavior** - Page views and interactions

### Future Integrations
- **Google Analytics 4** - Detailed user tracking
- **Hotjar** - User session recordings
- **Sentry** - Error monitoring and performance
- **Mixpanel** - Event tracking and funnels

## 🔒 Security

### Implemented
- ✅ **Input validation** - Zod schemas for all inputs
- ✅ **CSRF protection** - Next.js built-in protection
- ✅ **Environment variables** - Secure secret management
- ✅ **Type safety** - TypeScript throughout

### Future Enhancements
- 🔄 **Rate limiting** - API request throttling
- 🔄 **Authentication** - User login/signup
- 🔄 **RBAC** - Role-based access control
- 🔄 **Audit logging** - Security event tracking

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Code Standards
- Follow TypeScript strict mode
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Issues
- **Bug reports** - Use GitHub Issues
- **Feature requests** - Use GitHub Discussions
- **Security issues** - Email security@herbspot.fi

---

**Built with ❤️ by HerbSpot Team**

*Premium aromatherapy products for the modern lifestyle*