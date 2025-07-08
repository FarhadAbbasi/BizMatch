# BizMatch

A Tinder-style B2B matchmaking app that connects businesses for partnerships, collaborations, and client acquisition.

## Features

- Gmail and LinkedIn OAuth authentication
- Business profile creation and management
- Swipe-based matching system
- Filter businesses by industry, location, services, and tags
- Basic profile analytics (view count)
- LinkedIn integration for easy profile creation
- Real-time match notifications (coming soon)

## Tech Stack

- **Frontend**: Expo (React Native), TypeScript, TailwindCSS (NativeWind)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: Zustand with Immer
- **Authentication**: Supabase Auth (Email + OAuth)

## Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI
- Supabase CLI

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
REDIRECT_URI=your_redirect_uri
```

2. Install dependencies:

```bash
npm install
```

## Running the App

1. Start the development server:

```bash
npm run dev
```

2. Open the app:
   - iOS: Press 'i' in the terminal or run `npm run ios`
   - Android: Press 'a' in the terminal or run `npm run android`
   - Web: Press 'w' in the terminal or run `npm run web`

## Supabase Setup

1. Start Supabase locally:

```bash
supabase start
```

2. Apply migrations:

```bash
supabase db reset
```

3. Deploy Edge Functions:

```bash
supabase functions deploy create_like
```

## Project Structure

```
bizmatch/
├── app.json             # Expo configuration
├── App.tsx             # Root component
├── assets/             # Images and assets
├── navigation/         # React Navigation setup
├── screens/           # Screen components
│   ├── auth/         # Authentication screens
│   ├── Swiper.tsx    # Main swiper screen
│   └── ...
├── services/         # API services
├── stores/           # Zustand stores
└── supabase/        # Supabase configuration
    ├── migrations/  # Database migrations
    └── functions/   # Edge Functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 