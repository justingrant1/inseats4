# InSeats - Electronic Ticket Management System

InSeats is a modern ticket selling and management platform with robust electronic ticket delivery capabilities.

## Features

- Buy and sell tickets for events
- Electronic ticket delivery via email and mobile wallets
- QR code/barcode-based ticket validation
- User account management and ticket history
- Mobile-optimized design

## Recent Updates: Ticket Delivery System

The platform now includes enhanced ticket delivery features:

### Electronic Ticket Display
- New dedicated page for viewing electronic tickets (`/tickets/:orderId`)
- Interactive ticket UI with tabs for details, barcode, and actions
- Support for multiple tickets within a single order

### Delivery Options
- Email delivery: Send tickets to any email address
- Wallet integration: Add tickets to Apple Wallet or Google Pay
- Print-ready ticket format

### Webhook Processing
- Real-time ticket status updates via webhook events
- Support for the following webhook events:
  - `ticket.delivered`: Ticket successfully delivered
  - `ticket.delivery_failed`: Delivery failure notification
  - `ticket.wallet_generated`: Wallet pass generation complete
  - `ticket.barcode_updated`: New barcode issued for a ticket

### Database Schema
- Enhanced ticket tables with delivery status tracking
- Order webhook logs for audit trail
- Delivery timestamps and methods

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **APIs**: Stripe (payments), TicketVault (ticket delivery), TicketNetwork (inventory)

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
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TICKETVAULT_API_KEY=your-ticketvault-api-key
VITE_TICKETVAULT_API_SECRET=your-ticketvault-api-secret
VITE_TICKETVAULT_ENVIRONMENT=sandbox
```

## Deployment

The application can be deployed to any static hosting service. The backend is handled by Supabase.

1. Build the production bundle: `npm run build`
2. Deploy the contents of the `dist` directory
3. Ensure Edge Functions are deployed: `supabase functions deploy webhooks`

## License

Copyright © 2025 InSeats Inc. All rights reserved.
