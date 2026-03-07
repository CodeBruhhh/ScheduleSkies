# Schedule Skies - Next.js with React and Supabase

A modern travel planning application built with **Next.js**, **React**, and **Supabase** backend.

## Tech Stack

- **Frontend**: React 18, Next.js 14
- **Backend**: Next.js API Routes with Supabase
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS

## Project Structure

```
schedule-skies/
├── pages/
│   ├── api/
│   │   ├── health.js          # Health check endpoint
│   │   └── trips.js           # Trips API routes (GET, POST)
│   ├── index.js               # Home page
│   ├── plan.js                # Trip planning page
│   └── _app.js                # Next.js app wrapper
├── components/
│   ├── Navbar.jsx             # Navigation bar
│   ├── Hero.jsx               # Hero section
│   └── Features.jsx           # Features section
├── lib/
│   └── supabaseClient.js      # Supabase client initialization
├── styles/
│   ├── globals.css            # Global styles
│   ├── navbar.css             # Navbar styles
│   ├── hero.css               # Hero styles
│   ├── features.css           # Features styles
│   └── plan.css               # Plan page styles
├── public/                    # Static assets
├── package.json               # Dependencies
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript config
├── .env.local                 # Environment variables
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (free tier at [supabase.com](https://supabase.com))

### 1. Setup Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a `trips` table with the following schema:
   ```sql
   CREATE TABLE trips (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     destination TEXT NOT NULL,
     departureDate DATE NOT NULL,
     returnDate DATE NOT NULL,
     passengers INT NOT NULL,
     createdAt TIMESTAMP DEFAULT NOW()
   );
   ```
3. Get your credentials from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Health Check
- **GET** `/api/health` - Health check endpoint

### Trips
- **GET** `/api/trips` - Fetch all trips
- **POST** `/api/trips` - Create a new trip

## Components

### Navbar
Navigation component with links to different sections of the app.

### Hero
Landing section with call-to-action button.

### Features
Displays key features of Schedule Skies.

### PlanTrip (Page)
Form for users to create a new trip with destination, dates, and passenger count.

## Features

- ✅ Server-side rendering with Next.js
- ✅ React components for UI
- ✅ Supabase database integration
- ✅ API routes for backend logic
- ✅ Responsive design
- ✅ Environment variable configuration

## Next Steps

- [ ] Implement user authentication (Supabase Auth)
- [ ] Add weather API integration (OpenWeatherMap, WeatherAPI)
- [ ] Add traffic prediction service (Google Maps, OpenRouteService)
- [ ] Create detailed trip recommendations page
- [ ] Add real-time collaboration features
- [ ] Deploy to Vercel or another hosting platform

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is compatible with any platform that supports Node.js and Next.js (Netlify, AWS, etc.)

## Database Schema

### trips table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| destination | TEXT | Trip destination |
| departureDate | DATE | Departure date |
| returnDate | DATE | Return date |
| passengers | INT | Number of passengers |
| createdAt | TIMESTAMP | Creation timestamp |

## Contributing

Feel free to submit issues and enhancement requests!

## License

(Add your preferred license)

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- Project Documentation:
  - Team_7_SRS.pdf - Requirements Specification
  - Team_7_STD.pdf - System Design Document
  - Team_7_SPMP.pdf - Project Management Plan
