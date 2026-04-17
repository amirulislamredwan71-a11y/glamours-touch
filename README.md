# Glamour's Touch

A modern e-commerce web application for beauty and cosmetic products, built with React, TypeScript, and Supabase.

## Features

- Product browsing with category filters
- Shopping cart with floating cart preview
- User authentication (login/register)
- Admin dashboard (products, orders, customers, categories)
- Bilingual support (English & Bengali)
- Responsive design with Tailwind CSS
- Smooth animations with Motion

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase
- **Routing:** React Router DOM v7
- **i18n:** i18next (EN + BN)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/amirulislamredwan71-a11y/glamours-touch.git
   cd glamours-touch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables — copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type check |

## Project Structure

```
src/
├── components/        # Reusable UI components
│   └── admin/         # Admin-specific components
├── hooks/             # Custom React hooks (auth, cart, UI)
├── pages/             # Page components
│   └── admin/         # Admin panel pages
├── data/              # Static product data
├── lib/               # Supabase client & utilities
├── locales/           # Translation files (en, bn)
└── types.ts           # TypeScript type definitions
```

## License

MIT
