# InSeats - Event Ticketing Marketplace

## Project Overview

InSeats is a modern event ticketing marketplace that allows users to discover, purchase, and sell tickets for concerts, sports events, theater performances, and more. The platform integrates with multiple third-party services to provide a seamless ticket buying and selling experience.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [API Integrations](#api-integrations)
  - [Supabase Database Integration](#supabase-database-integration)
  - [Stripe Payment Integration](#stripe-payment-integration)
  - [TicketNetwork API Integration](#ticketnetwork-api-integration)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

InSeats is built with a modern tech stack:

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Query for server state, React Context for app state
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **Ticket API**: TicketNetwork API
- **Deployment**: Lovable platform with Netlify option for custom domains

The application follows a component-based architecture with a clear separation of concerns:

- `/src/components`: UI components
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions and API integrations
- `/src/pages`: Page components
- `/src/types`: TypeScript type definitions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd inseats

# Install dependencies
npm install

# Set up environment variables
# Copy the .env.example file to .env and fill in the required values
cp .env.example .env

# Start the development server
npm run dev
```

## API Integrations

### Supabase Database Integration

#### Overview

The application uses Supabase as its primary database and authentication provider. The Supabase client is configured in `src/lib/supabase.ts`.

#### Features

- **Database Operations**: CRUD operations for events, tickets, and orders
- **Authentication**: User signup, login, password reset
- **Storage**: Image uploads for event and profile pictures
- **Real-time Updates**: Real-time notifications for ticket purchases

#### Database Schema

The database includes the following tables:

1. `events`: Stores event information from TicketNetwork or user listings
2. `tickets`: Links to events and contains ticket pricing, seating, and availability info
3. `orders`: Tracks purchase transactions, including payment status and delivery method

#### Implementation Details

- TypeScript interfaces match the database schema in `src/types/database.types.ts`
- Supabase client automatically handles authentication tokens and session management
- Database operations are wrapped in error handling with appropriate fallbacks

### Stripe Payment Integration

#### Overview

Stripe handles all payment processing for ticket purchases. The integration supports both test and production modes with automatic detection based on API keys.

#### Features

- **Payment Processing**: Secure checkout for ticket purchases
- **Payment Intents**: Pre-authorization flow to ensure funds are available
- **Refund Handling**: API for processing refunds when necessary

#### Implementation Details

- Integration is in `src/lib/stripe.ts`
- Environment variables control test vs. production mode
- TypeScript interfaces ensure type safety for payment operations
- Frontend components for checkout are located in `src/components/Checkout.tsx`

### TicketNetwork API Integration

#### Overview

The TicketNetwork API provides access to a large inventory of event tickets. The integration includes full OAuth 2.0 authentication, comprehensive error handling, and a mock data system for development.

#### Features

- **OAuth 2.0 Authentication**: Secure API authentication with automatic token refresh
- **Event Search**: Search for events by keyword, location, category, and date
- **Ticket Availability**: Real-time ticket availability and pricing
- **Mock Data**: Fallback to realistic mock data when API credentials are unavailable

#### Implementation Details

- Integration is in `src/lib/ticketnetwork.ts`
- Authentication is handled by the `TicketNetworkAuth` class
- API requests are made through the `TicketNetworkAPI` class
- React Query hooks provide caching and optimistic updates
- Mock data system generates realistic event and ticket data for development

#### API Methods

- `searchEvents(params)`: Search for events with filtering options
- `getEventDetails(eventId)`: Get detailed information about an event
- `getTicketsForEvent(eventId)`: Get available tickets for an event
- `getCategories()`: Get event categories
- React Query hooks for all operations: `useSearchEvents`, `useEventDetails`, `useEventTickets`, `useCategories`

## Database Schema

### Events Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  venue_city TEXT NOT NULL,
  venue_state TEXT,
  venue_country TEXT,
  category_id INT,
  category_name TEXT,
  image_url TEXT,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
```

### Tickets Table

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) NOT NULL,
  external_id TEXT,
  section_name TEXT,
  row_name TEXT,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  delivery_methods TEXT[],
  in_hand_date TIMESTAMPTZ,
  status TEXT DEFAULT 'available',
  seller_id UUID REFERENCES auth.users(id),
  buyer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  quantity INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  delivery_method TEXT,
  delivery_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Authentication

The application uses Supabase Auth for authentication. User state is managed through the Supabase client and made available via React Context.

### Authentication Flow

1. User signs up or logs in via the UI
2. Supabase manages the session and provides JWT tokens
3. Tokens are used for authenticated API requests to Supabase and other services
4. The app maintains the user's logged-in state across page reloads

### Authorization

- Public pages: Home, Event listings, Event details
- Protected pages: Checkout, Order history, Ticket selling, User profile
- Admin-only functionality: Event management, User management

## Environment Variables

The application uses the following environment variables:

```
# Supabase
VITE_SUPABASE_URL=https://ukezslnkdygyikotxkgv.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# TicketNetwork API
VITE_TICKETNETWORK_API_KEY=your-ticketnetwork-api-key
VITE_TICKETNETWORK_CONSUMER_KEY=your-consumer-key
VITE_TICKETNETWORK_CONSUMER_SECRET=your-consumer-secret
VITE_TICKETNETWORK_ENVIRONMENT=sandbox
VITE_TICKETNETWORK_WCID=your-wcid
VITE_TICKETNETWORK_BID=your-bid
```

### Environment Mode Configuration

#### Development Mode

In development mode, the application can run with minimal configuration:

- If TicketNetwork credentials are missing, the system will use mock data
- If Stripe credentials are missing or using a test key, the system will operate in test mode
- Supabase credentials are required for database functionality

#### Production Mode

For production deployment:

1. **Supabase**: Use your production Supabase URL and anon key
2. **Stripe**: Use a live publishable key (starts with `pk_live_`)
3. **TicketNetwork**: Set all required credentials and set environment to `production`

## Development Workflow

### Code Organization

The codebase follows a feature-based organization:

- Common UI components in `/src/components/ui`
- Feature-specific components in `/src/components`
- Pages that compose components in `/src/pages`
- API integrations and utilities in `/src/lib`
- Hooks for shared logic in `/src/hooks`

### State Management

- **Server State**: React Query for data fetching, caching, and synchronization
- **UI State**: React state and context for component-level and shared state
- **Form State**: React Hook Form for form management

### Working with APIs

#### Supabase

```typescript
import { supabase } from '@/lib/supabase'

// Example: Fetch events
const { data, error } = await supabase
  .from('events')
  .select('*')
  .order('date', { ascending: true })
```

#### Stripe

```typescript
import { createPaymentIntent } from '@/lib/stripe'

// Example: Create a payment intent
const { clientSecret } = await createPaymentIntent({
  amount: 2000, // $20.00
  currency: 'usd',
  metadata: { ticketId: 'abc123' }
})
```

#### TicketNetwork

```typescript
import { searchEvents, useEventDetails } from '@/lib/ticketnetwork'

// Example with direct API call
const events = await searchEvents({ 
  keyword: 'concert', 
  cityName: 'New York' 
})

// Example with React Query hook
const { data: eventDetails, isLoading } = useEventDetails(eventId)
```

## Testing

### Mock Data

The application includes a comprehensive mock data system for TicketNetwork API responses. This allows for development and testing without API credentials.

To use mock data:

1. Leave TicketNetwork API credentials blank in the `.env` file
2. The application will automatically use mock data for all TicketNetwork API calls
3. Mock events, venues, categories, and tickets are generated with realistic data

### API Testing

For testing with real APIs:

1. Stripe: Use test API keys and [Stripe test cards](https://stripe.com/docs/testing)
2. TicketNetwork: Use the sandbox environment with test credentials
3. Supabase: Use your development/staging database

## Troubleshooting

### Common Issues

#### API Connection Problems

- Check environment variables are set correctly
- Verify network connectivity
- Check browser console for detailed error messages

#### Authentication Issues

- Clear browser local storage to reset authentication state
- Verify Supabase credentials are correct
- Check user permissions in Supabase dashboard

#### Mock Data Not Working

- Verify TicketNetwork API credentials are either missing or set to placeholder values
- Check console logs for "TicketNetwork running with MOCK data" message

## Deployment

### Lovable Platform

The project is set up to deploy via the Lovable platform:

1. Visit [Lovable](https://lovable.dev/projects/dd3bf116-e5e4-4193-a39b-6906893f9c7d)
2. Click on Share -> Publish

### Custom Domain (Netlify)

For custom domain deployment:

1. Build the project: `npm run build`
2. Deploy the `dist` directory to Netlify
3. Configure your custom domain in Netlify settings

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

For support or questions, please contact the project maintainers.
