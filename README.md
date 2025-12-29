# Card Generator

A card generation tool built with Next.js, tRPC, Prisma, and Airwallex API. Create virtual cards programmatically with a web UI.

## Features

- **Web UI Dashboard** - Create and manage virtual cards
- **Airwallex API Integration** - Direct API integration for card creation
- **SQLite Database** - Portable card storage
- **Type-Safe API** - End-to-end type safety with tRPC
- **Card Management** - View and manage created cards

## Tech Stack

- **Next.js 15** - React framework with App Router
- **tRPC** - Type-safe API layer
- **Prisma** - Database ORM with SQLite
- **Airwallex API** - Card issuing API
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18+ ([Download here](https://nodejs.org/))
- npm (included with Node.js)
- Airwallex API credentials (optional - can be configured later in Settings)

### Quick Start (Windows) 🪟

**One-click setup and run:**

1. Double-click `run-windows.bat` (or right-click `run-windows.ps1` → Run with PowerShell)

The script will automatically:
- ✅ Check for Node.js installation
- ✅ Install all dependencies
- ✅ Create `.env` file with default settings
- ✅ Initialize the database
- ✅ Start the development server

2. Open http://localhost:3000 in your browser

**That's it!** The app is now running. Press `Ctrl+C` in the terminal to stop.

**Troubleshooting:** If the window closes too quickly or you encounter errors, check the `run-log.txt` file in the project directory for detailed logs.

**For production builds on Windows:** Double-click `build-windows.bat` to build and run in production mode.

### Manual Installation (All Platforms)

1. Clone or copy this project

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   DATABASE_URL="file:./prisma/dev.db"
   NODE_ENV=development
   PORT=3000
   ```

4. Initialize the database:
   ```bash
   npm run prisma-generate
   npm run prisma-push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

7. Configure Airwallex API credentials in Settings (optional - can be done later)

## Usage

### Configure API Settings

1. Go to **Settings**
2. Enter your Airwallex Client ID, API Key, Environment, and Cardholder ID
3. Save the settings

### Create Cards

1. Go to **Cards** → **New Card**
2. Enter the number of cards to create
3. Optionally set a nickname prefix and transaction limit
4. Click **Create Cards**

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── cards/             # Card management
│   └── settings/          # Settings
├── server/
│   ├── routes/
│   │   ├── cards/         # Card CRUD
│   │   ├── settings/      # Settings management
│   │   └── services/      # Airwallex API service
│   └── trpc/              # tRPC setup
└── components/            # UI components
```

## Production Deployment

For production use:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Access at http://localhost:3000

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma-push` - Push schema changes to database
- `npm run lint` - Run linter
