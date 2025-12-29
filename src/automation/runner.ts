/**
 * Playwright Automation Runner
 * ============================
 * Utility for running Playwright automation scripts with output capture
 */

import {
  chromium,
  type Browser,
  type Page,
  type BrowserContext,
} from 'playwright';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface RunnerOptions {
  headless?: boolean;
  slowMo?: number;
  authEmail?: string; // Email to load saved auth state for
}

export interface RunResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface AirwallexConfig {
  email: string;
  password: string;
  cardAmount: number;
  numberOfCards: number;
  dryRun?: boolean;
}

/**
 * Creates a new browser instance for automation
 */
export async function createBrowser(
  options: RunnerOptions = {},
): Promise<Browser> {
  return chromium.launch({
    headless: options.headless ?? false, // Default to headed for debugging
    slowMo: options.slowMo ?? 0,
  });
}

/**
 * Gets the directory for storing auth state files
 */
function getAuthDir(): string {
  const authDir = join(process.cwd(), '.auth');
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
  }
  return authDir;
}

/**
 * Gets the auth state file path for a specific email
 */
function getAuthStatePath(email: string): string {
  const hash = createHash('md5').update(email).digest('hex').slice(0, 8);
  return join(getAuthDir(), `airwallex-${hash}.json`);
}

/**
 * Checks if valid auth state exists for the given email
 */
function hasValidAuthState(email: string): boolean {
  const authPath = getAuthStatePath(email);
  if (!existsSync(authPath)) {
    return false;
  }
  // Check if file is less than 24 hours old
  const stats = require('fs').statSync(authPath);
  const ageMs = Date.now() - stats.mtimeMs;
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
  return ageMs < maxAgeMs;
}

/**
 * Saves the browser context storage state for future sessions
 */
async function saveAuthState(
  context: BrowserContext,
  email: string,
): Promise<void> {
  const authPath = getAuthStatePath(email);
  await context.storageState({ path: authPath });
}

/**
 * Creates a new browser context with default settings
 * Optionally loads saved auth state if available
 */
export async function createContext(
  browser: Browser,
  authEmail?: string,
): Promise<BrowserContext> {
  const contextOptions: Parameters<Browser['newContext']>[0] = {
    viewport: { width: 1280, height: 720 },
  };

  // Try to load saved auth state if email is provided
  if (authEmail && hasValidAuthState(authEmail)) {
    const authPath = getAuthStatePath(authEmail);
    contextOptions.storageState = authPath;
  }

  return browser.newContext(contextOptions);
}

/**
 * Creates a new page in the given context
 */
export async function createPage(context: BrowserContext): Promise<Page> {
  return context.newPage();
}

/**
 * Output collector for capturing console logs during automation
 */
export class OutputCollector {
  private logs: string[] = [];

  log(message: string): void {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  error(message: string): void {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ERROR: ${message}`);
  }

  getOutput(): string {
    return this.logs.join('\n');
  }

  clear(): void {
    this.logs = [];
  }
}

/**
 * Loads name lists from JSON files
 */
function loadNameLists(): { firstNames: string[]; lastNames: string[] } {
  try {
    const dataDir = join(process.cwd(), 'src', 'data');
    const firstNames = JSON.parse(
      readFileSync(join(dataDir, 'first-names.json'), 'utf-8'),
    ) as string[];
    const lastNames = JSON.parse(
      readFileSync(join(dataDir, 'last-names.json'), 'utf-8'),
    ) as string[];
    return { firstNames, lastNames };
  } catch (error) {
    // Fallback names if files don't exist
    return {
      firstNames: ['John', 'Jane', 'Alex', 'Sam', 'Chris'],
      lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'],
    };
  }
}

/**
 * Generates a random name by combining a first and last name
 */
function generateRandomName(firstNames: string[], lastNames: string[]): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Runs an automation script with error handling and output capture
 */
export async function runAutomation(
  scriptFn: (page: Page, collector: OutputCollector) => Promise<void>,
  options: RunnerOptions = {},
): Promise<RunResult> {
  const collector = new OutputCollector();
  let browser: Browser | null = null;

  try {
    collector.log('Starting browser...');
    browser = await createBrowser(options);

    const context = await createContext(browser, options.authEmail);
    const page = await createPage(context);

    collector.log('Browser started, running automation...');

    // Run the actual automation script
    await scriptFn(page, collector);

    collector.log('Automation completed successfully');

    return {
      success: true,
      output: collector.getOutput(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    collector.error(errorMessage);

    return {
      success: false,
      output: collector.getOutput(),
      error: errorMessage,
    };
  } finally {
    if (browser) {
      collector.log('Closing browser...');
      await browser.close();
    }
  }
}

/**
 * Airwallex Card Creation Script
 * Creates company cards on Airwallex with configurable settings
 */
export async function airwallexCardScript(
  page: Page,
  collector: OutputCollector,
  config: AirwallexConfig,
): Promise<void> {
  const { email, password, cardAmount, numberOfCards, dryRun = false } = config;
  const { firstNames, lastNames } = loadNameLists();
  const context = page.context();

  collector.log(`Starting Airwallex card creation for ${numberOfCards} cards`);
  collector.log(`Card amount: ${cardAmount}`);
  if (dryRun) {
    collector.log('DRY RUN MODE: Will pause before final "Create Card" click');
  }

  // Check if we have saved auth state
  const hasSavedAuth = hasValidAuthState(email);
  if (hasSavedAuth) {
    collector.log('Found saved login session, attempting to restore...');
  }

  // Step 1: Navigate to Airwallex
  collector.log('Navigating to Airwallex...');
  await page.goto('https://www.airwallex.com/app/dashboard-account');

  // Step 2: Check if already logged in or need to login
  // Wait briefly to see which page we land on
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  const isOnDashboard =
    currentUrl.includes('dashboard-account') &&
    !currentUrl.includes('login') &&
    !currentUrl.includes('signin');

  // Check if "Create Card" button is visible (indicates we're logged in)
  const createCardVisible = await page
    .locator(
      'button:has-text("Create Card"), [data-testid="create-card"], a:has-text("Create Card")',
    )
    .isVisible()
    .catch(() => false);

  if (isOnDashboard && createCardVisible) {
    collector.log('Already logged in from saved session!');
  } else {
    // Need to login
    collector.log('Login required, proceeding with authentication...');

    // Wait for email input and fill credentials
    await page.waitForSelector(
      'input[type="email"], input[name="email"], input[placeholder*="email" i]',
      { timeout: 30000 },
    );
    collector.log('Entering email...');
    await page.fill(
      'input[type="email"], input[name="email"], input[placeholder*="email" i]',
      email,
    );

    // Fill password
    collector.log('Entering password...');
    await page.fill('input[type="password"], input[name="password"]', password);

    // Click login button
    collector.log('Clicking login button...');
    await page.click(
      'button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")',
    );

    // Step 3: Handle OTP - Wait for dashboard to load (user completes OTP manually)
    collector.log(
      'Waiting for dashboard to load (complete OTP if required)...',
    );
    collector.log(
      'This may take up to 5 minutes while waiting for OTP completion...',
    );

    // Wait for the "Create Card" button to appear, indicating we're on the dashboard
    // Extended timeout to allow for OTP completion
    await page.waitForSelector(
      'button:has-text("Create Card"), [data-testid="create-card"], a:has-text("Create Card")',
      {
        timeout: 300000, // 5 minutes timeout for OTP
      },
    );

    // Save auth state for future sessions
    collector.log('Saving login session for future use...');
    await saveAuthState(context, email);
    collector.log('Login session saved!');
  }

  collector.log('Dashboard loaded successfully!');

  // Step 4: Create cards in a loop
  for (let i = 0; i < numberOfCards; i++) {
    collector.log(`\n--- Creating card ${i + 1} of ${numberOfCards} ---`);

    try {
      // Click "Create Card" button
      collector.log('Clicking "Create Card" button...');
      await page.click(
        'button:has-text("Create Card"), [data-testid="create-card"], a:has-text("Create Card")',
      );

      // Wait for card creation modal/page to load
      await page.waitForTimeout(1000);

      // Click "Company card" option
      collector.log('Selecting "Company card"...');
      await page.click(
        'button:has-text("Company card"), [data-testid="company-card"], div:has-text("Company card"):not(:has(div))',
      );

      await page.waitForTimeout(1000);

      // Click the container 3 levels up from "Search by name or email" to open dropdown
      collector.log('Opening user search dropdown...');
      await page.click('//*[text()="Search by name or email"]/ancestor::*[3]');

      await page.waitForTimeout(500);

      // Select the option with the login email (React Select dropdown)
      collector.log(`Selecting user with email: ${email}...`);
      await page.click(`div[id^="react-select"]:has(p:text("${email}"))`);

      await page.waitForTimeout(500);

      // Click "Select a purpose" dropdown
      collector.log('Opening purpose dropdown...');
      await page.click(
        'div:has-text("Select a purpose"), [data-testid="purpose-select"], select[name="purpose"]',
      );

      await page.waitForTimeout(500);

      // Select "Online Purchasing"
      collector.log('Selecting "Online Purchasing"...');
      await page.click(
        'div:has-text("Online Purchasing"), li:has-text("Online Purchasing"), option:has-text("Online Purchasing")',
      );

      await page.waitForTimeout(500);

      // Generate and enter nickname
      const nickname = generateRandomName(firstNames, lastNames);
      collector.log(`Generated nickname: ${nickname}`);
      await page.fill(
        'input[placeholder*="nickname" i], input[name="nickname"], [data-testid="nickname-input"]',
        nickname,
      );

      await page.waitForTimeout(500);

      // Enter amount
      collector.log(`Entering amount: ${cardAmount}...`);
      await page.fill(
        'input[placeholder*="amount" i], input[name="amount"], [data-testid="amount-input"]',
        String(cardAmount),
      );

      await page.waitForTimeout(500);

      // Click final "Create Card" button to submit (or wait for user in dry run mode)
      if (dryRun) {
        collector.log('DRY RUN: Pausing before "Create Card" button...');
        collector.log('Please manually click "Create Card" when ready.');
        collector.log('Waiting for navigation away from create-card page...');

        // Wait for the user to manually click and for page to change
        await page.waitForURL((url) => !url.href.includes('create-card'), {
          timeout: 300000, // 5 minutes to manually review and click
        });

        collector.log('Page changed - card creation detected');
      } else {
        collector.log('Submitting card creation...');
        await page.click(
          'button:has-text("Create Card"):not([disabled]), button[type="submit"]:has-text("Create")',
        );

        // Wait for card creation to complete
        await page.waitForTimeout(3000);
      }

      collector.log(`Card ${i + 1} created successfully!`);

      // If there are more cards to create, navigate back or wait for modal to close
      if (i < numberOfCards - 1) {
        collector.log('Preparing for next card...');
        // Wait for any success modal/toast to appear and dismiss
        await page.waitForTimeout(2000);

        // Try to close any modal if present
        try {
          await page.click(
            'button:has-text("Done"), button:has-text("Close"), [data-testid="close-modal"]',
            { timeout: 3000 },
          );
        } catch {
          // Modal might auto-close, continue
        }

        await page.waitForTimeout(1000);
      }
    } catch (cardError) {
      const errorMsg =
        cardError instanceof Error ? cardError.message : String(cardError);
      collector.error(`Failed to create card ${i + 1}: ${errorMsg}`);
      collector.log('Attempting to continue with remaining cards...');

      // Try to recover by going back to dashboard
      try {
        await page.goto('https://www.airwallex.com/app/dashboard-account');
        await page.waitForSelector('button:has-text("Create Card")', {
          timeout: 30000,
        });
      } catch {
        collector.error('Failed to recover to dashboard');
      }
    }
  }

  collector.log(`\n=== Completed card creation process ===`);
  collector.log(`Attempted to create ${numberOfCards} cards`);
}

/**
 * Example automation script
 * Replace this with your actual automation logic
 */
export async function exampleScript(
  page: Page,
  collector: OutputCollector,
): Promise<void> {
  collector.log('Navigating to example.com...');
  await page.goto('https://example.com');

  collector.log('Getting page title...');
  const title = await page.title();
  collector.log(`Page title: ${title}`);

  collector.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot.png' });
  collector.log('Screenshot saved to screenshot.png');
}
