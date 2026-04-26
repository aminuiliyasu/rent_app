# Rentify Frontend

Modern, responsive frontend for the Rentify marketplace platform built with Next.js 14, React, and Tailwind CSS.

## Features

- Modern, responsive UI design
- Authentication (Login, Register, OAuth)
- Advanced search and filtering
- Mobile-first responsive design
- Map integration for location-based search
- Real-time messaging (coming soon)
- Reviews and ratings
- User dashboards (Renter and Owner)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons
- **Maps**: React Map GL / Mapbox

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Home page
│   ├── login/          # Login page
│   ├── register/       # Register page
│   ├── search/         # Search/listings page
│   └── ...
├── components/         # React components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── ListingCard.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/                # Utilities and API
│   ├── api.ts          # Axios instance
│   └── types.ts        # TypeScript types
└── public/             # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080/api/v1)

## Features in Development

- [ ] Booking flow and checkout
- [ ] Payment integration (Stripe/Paystack)
- [ ] Real-time messaging with WebSocket
- [ ] Map view for listings
- [ ] Image upload and gallery
- [ ] Reviews and ratings UI
- [ ] Admin panel
- [ ] User profile pages
- [ ] Dashboard analytics

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Follow React best practices
4. Ensure mobile responsiveness
5. Test on multiple browsers

## License

Confidential - Rentify Platform v1.0
