# Playwright Automation Tool

A local automation tool built with Next.js, tRPC, Prisma, and Playwright. Run browser automation scripts with a web UI for managing configurations and viewing output.

## Features

- **Web UI Dashboard** - Manage configurations and view run history
- **Playwright Integration** - Browser automation with full Playwright capabilities
- **SQLite Database** - Portable config and run history storage
- **Type-Safe API** - End-to-end type safety with tRPC
- **Real-time Output** - View automation logs and errors

## Tech Stack

- **Next.js 15** - React framework with App Router
- **tRPC** - Type-safe API layer
- **Prisma** - Database ORM with SQLite
- **Playwright** - Browser automation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone or copy this project to your Windows machine

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   DATABASE_URL="file:./dev.db"
   ```

4. Initialize the database:
   ```bash
   npm run prisma-push
   ```

5. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000

## Usage

### Create a Configuration

1. Go to **Configs** → **New Config**
2. Enter a name and any JSON settings your script needs
3. Save the configuration

### Run Automation

1. Open a configuration
2. Click **Run Now**
3. View the output in the run details page

### Customize Automation Scripts

Edit `src/automation/runner.ts` to modify the automation logic:

```typescript
export async function exampleScript(page: Page, collector: OutputCollector): Promise<void> {
  collector.log('Navigating to website...');
  await page.goto('https://example.com');
  
  // Your automation logic here
  await page.click('button#submit');
  
  collector.log('Done!');
}
```

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── configs/           # Config management
│   └── runs/              # Run history
├── automation/            # Playwright scripts
│   └── runner.ts          # Script execution
├── server/
│   ├── routes/
│   │   ├── config/        # Config CRUD
│   │   └── automation/    # Run scripts
│   └── trpc/              # tRPC setup
└── components/            # UI components
```

## Deployment (Windows)

For production use on Windows:

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
