# InSeats - Event Ticketing Platform

A modern event ticketing platform built with React, TypeScript, and Supabase, featuring advanced seat selection capabilities and secure payment processing.

## Features

### Core Functionality
- **Event Discovery**: Browse and search events by category, location, and date
- **Event Details**: Comprehensive event information with venue details and pricing
- **Secure Checkout**: Stripe-powered payment processing with PCI compliance
- **Electronic Tickets**: Digital ticket delivery with QR codes and sharing capabilities
- **User Profiles**: Account management with order history and preferences

### Advanced Seat Selection (New!)
- **Interactive Seat Maps**: Visual venue layouts with real-time availability
- **Tier-Based Pricing**: Multiple pricing tiers with detailed seat information
- **Seat Reservations**: Temporary seat holds during the selection process (15-minute expiration)
- **Real-Time Updates**: Live availability updates to prevent double bookings
- **Detailed Seat Info**: Section, row, and seat number with pricing transparency

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Code splitting, lazy loading, and caching strategies
- **SEO Friendly**: Dynamic meta tags and sitemap generation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Type Safety**: Full TypeScript implementation with strict type checking

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Hook Form** for form management

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Edge Functions** for serverless API endpoints
- **Row Level Security** for data protection

### Payment Processing
- **Stripe** for secure payment handling
- **Webhook Integration** for payment confirmations
- **PCI Compliance** for card data security

### Development Tools
- **ESLint** for code linting
- **TypeScript** for type checking
- **Git** for version control
- **GitHub Actions** for CI/CD (planned)

## Database Schema

### Core Tables
- `events` - Event information and metadata
- `tickets` - Ticket listings with pricing and availability
- `orders` - Purchase records and order management
- `profiles` - User account information
- `webhook_events` - Payment webhook processing

### Seat Selection Tables
- `reservations` - Temporary seat holds with expiration
  - Automatic cleanup of expired reservations
  - User-based reservation tracking
  - Integration with checkout process

## API Endpoints

### Event Management
- `GET /events` - List events with filtering
- `GET /events/:id` - Event details with seat tiers
- `GET /events/:id/tiers` - Available seat tiers for an event

### Seat Selection
- `GET /events/:id/tiers/:tierId/seats` - Detailed seat information
- `POST /reserve-seats` - Reserve selected seats temporarily
- `DELETE /release-reservations` - Release user's seat reservations

### Payment Processing
- `POST /create-payment-intent` - Initialize Stripe payment
- `POST /webhooks` - Handle payment confirmations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/justingrant1/inseats4.git
   cd inseats4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   supabase db reset
   
   # Or apply migrations individually
   supabase migration up
   ```

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy get-event-tiers
   supabase functions deploy get-tier-seats
   supabase functions deploy reserve-seats
   supabase functions deploy release-reservations
   supabase functions deploy create-payment-intent
   supabase functions deploy webhooks
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Local Development**
   ```bash
   # Start Supabase locally
   supabase start
   
   # Start the dev server
   npm run dev
   ```

2. **Database Changes**
   ```bash
   # Create a new migration
   supabase migration new migration_name
   
   # Apply migrations
   supabase db reset
   ```

3. **Function Development**
   ```bash
   # Serve functions locally
   supabase functions serve
   
   # Deploy functions
   supabase functions deploy function_name
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI)
│   ├── EventCard.tsx   # Event display components
│   ├── Header.tsx      # Navigation components
│   └── ...
├── pages/              # Route components
│   ├── EventDetail.tsx # Event details with seat selection
│   ├── Checkout.tsx    # Payment processing
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useEventDetails.ts
│   └── ...
├── lib/                # Utility functions and configurations
│   ├── supabase.ts     # Supabase client
│   ├── stripe.ts       # Stripe configuration
│   └── ...
├── types/              # TypeScript type definitions
│   ├── index.ts        # Main types including seat selection
│   └── database.types.ts
└── ...

supabase/
├── functions/          # Edge Functions
│   ├── get-event-tiers/
│   ├── get-tier-seats/
│   ├── reserve-seats/
│   ├── release-reservations/
│   └── ...
└── migrations/         # Database migrations
    ├── 01_create_events_table.sql
    ├── 09_create_reservations_table.sql
    └── ...
```

## Seat Selection Architecture

### Data Flow
1. **Event Detail Page** → Fetch available seat tiers
2. **Tier Selection** → Load detailed seat map for chosen tier
3. **Seat Selection** → Reserve selected seats temporarily
4. **Checkout Process** → Complete purchase or release reservations
5. **Automatic Cleanup** → Expired reservations removed automatically

### Key Components
- **SeatTier**: Pricing tiers with availability information
- **Seat**: Individual seats with coordinates and pricing
- **SeatSection**: Venue sections containing multiple seats
- **Reservation**: Temporary seat holds with expiration times

### API Integration
- Real-time seat availability checking
- Automatic reservation expiration (15 minutes)
- Conflict resolution for simultaneous selections
- Integration with existing checkout flow

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@inseats.com or create an issue in this repository.

## Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Event organizer portal
- [ ] Advanced seat selection UI components
- [ ] 3D venue visualization
- [ ] Group booking functionality

### Recent Updates
- ✅ Seat selection infrastructure (January 2025)
- ✅ Reservation system with automatic cleanup
- ✅ Enhanced type system for seat management
- ✅ API endpoints for seat selection workflow
