# InSeats - Electronic Ticket Management System

InSeats is a modern ticket selling and management platform with robust electronic ticket delivery capabilities.

## Features

- Buy and sell tickets for events
- Electronic ticket delivery via email and mobile wallets
- QR code/barcode-based ticket validation
- User account management and ticket history
- Mobile-optimized design
- Ticket sharing capabilities
- Developer API and portal

## Recent Updates

### Developer Portal Integration (May 2025)

The platform now includes a comprehensive Developer Portal for API access management:

- **Developer Applications**: Register and manage third-party applications
- **API Key Management**: Generate, view, and revoke API keys with specific permissions
- **Usage Metrics**: Monitor API usage and rate limiting
- **Subscription Plans**: Manage different tiers of API access
- **Admin Dashboard**: Dedicated section for administrators to manage developer resources

### Ticket Sharing System (April 2025)

A complete ticket sharing system has been implemented:

- **Multiple Sharing Methods**:
  - Email sharing with personalized messages
  - SMS sharing to mobile devices
  - Shareable links with configurable expiration
- **Access Control**: Secure sharing with expiration dates and revocation capabilities
- **Dedicated View**: Mobile-optimized shared ticket view for recipients
- **Tracking**: View counts and usage statistics for shared tickets
- **Security**: Row-level security in database to protect ticket data

### Admin Dashboard Enhancements (March 2025)

The administrative interface has been expanded with new capabilities:

- **Ticket Management**: View, validate, and manage tickets across all events
- **User Management**: Comprehensive tools for managing user accounts and permissions
- **Event Management**: Enhanced tools for creating and managing events
- **Analytics**: Improved reporting and analytics dashboard
- **System Settings**: Centralized configuration management
- **Developer Portal Access**: New section for managing developer applications and API access

### Electronic Ticket Delivery System (February 2025)

Enhanced ticket delivery features:

- **Electronic Ticket Display**: 
  - New dedicated page for viewing electronic tickets (`/tickets/:orderId`)
  - Interactive ticket UI with tabs for details, barcode, and actions
  - Support for multiple tickets within a single order

- **Delivery Options**:
  - Email delivery: Send tickets to any email address
  - Wallet integration: Add tickets to Apple Wallet or Google Pay
  - Print-ready ticket format

- **Webhook Processing**:
  - Real-time ticket status updates via webhook events
  - Support for the following webhook events:
    - `ticket.delivered`: Ticket successfully delivered
    - `ticket.delivery_failed`: Delivery failure notification
    - `ticket.wallet_generated`: Wallet pass generation complete
    - `ticket.barcode_updated`: New barcode issued for a ticket

- **Notification System**:
  - In-app notifications for ticket delivery and status changes
  - Email notifications with delivery updates
  - Webhook notification processing for external systems

### User Authentication and Profiles (January 2025)

Comprehensive user authentication and profile management:

- **Authentication Flows**:
  - Email/password registration and login
  - Social authentication options
  - Password reset and account recovery
- **User Profiles**:
  - Customizable user profiles with preferences
  - Purchase history and saved payment methods
  - Email preferences and notification settings
- **Role-Based Access Control**:
  - User roles (customer, admin, etc.)
  - Permission-based feature access
  - Admin user management tools

## Database Schema Updates

### Ticket Sharing (migration 07)
- New `ticket_shares` table for tracking shared tickets
- Secure access controls with row-level security
- Relationship modeling between users, tickets, and shares

### Webhook Events (migration 05)
- `webhook_events` table for tracking incoming webhooks
- Event processing status and history
- Integration with order and ticket status updates

### Ticket Delivery Enhancements (migration 06)
- Enhanced ticket tables with delivery status tracking
- Order webhook logs for audit trail
- Delivery timestamps and methods

### User Profiles (migration 04)
- Expanded user profile data model
- Role-based access control structures
- User preferences and settings storage

## API Integrations

### TicketNetwork Mercury API (v5)
- OAuth 2.0 authentication with token management
- Ticket group retrieval and display
- Ticket locking mechanism
- Purchase flow with address collection
- Error handling for common API issues

### TicketVault API
- Electronic ticket delivery system
- QR/barcode generation and validation
- Wallet pass creation (Apple Wallet, Google Pay)
- Email delivery tracking

### Developer Portal API
- Application registration and management
- API key generation with permission scoping
- Usage metrics and rate limiting
- Subscription management

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **APIs**: Stripe (payments), TicketVault (ticket delivery), TicketNetwork (inventory)
- **Authentication**: Supabase Auth with JWT token management
- **Real-time Updates**: Supabase Realtime for live notifications

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase CLI for local development

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Start the development server: `npm run dev`

### Environment Variables
Required environment variables:
```
# Supabase - Database & Authentication
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe - Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# TicketNetwork API Configuration
VITE_TICKETNETWORK_API_KEY=your-ticketnetwork-api-key
VITE_TICKETNETWORK_CONSUMER_KEY=your-consumer-key
VITE_TICKETNETWORK_CONSUMER_SECRET=your-consumer-secret
VITE_TICKETNETWORK_ENVIRONMENT=sandbox
VITE_TICKETNETWORK_WCID=your-wcid
VITE_TICKETNETWORK_BID=your-bid

# TicketVault API Configuration
VITE_TICKETVAULT_API_KEY=your-ticketvault-api-key
VITE_TICKETVAULT_API_SECRET=your-ticketvault-api-secret
VITE_TICKETVAULT_ENVIRONMENT=sandbox

# Webhook Configuration
VITE_WEBHOOK_SECRET=your-webhook-signing-secret

# DevPortal API Configuration
VITE_DEVPORTAL_API_URL=https://api.devportal.example.com
VITE_DEVPORTAL_API_KEY=your-devportal-api-key
VITE_DEVPORTAL_CLIENT_ID=your-client-id
VITE_DEVPORTAL_CLIENT_SECRET=your-client-secret
```

## Deployment

The application can be deployed to any static hosting service. The backend is handled by Supabase.

1. Build the production bundle: `npm run build`
2. Deploy the contents of the `dist` directory
3. Ensure Edge Functions are deployed: `supabase functions deploy webhooks`

## API Documentation

API documentation for developers is available through the Developer Portal. Once logged in as an administrator, navigate to `/admin/devportal` to access the documentation and manage API access.

## License

Copyright © 2025 InSeats Inc. All rights reserved.
