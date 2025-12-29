/**
 * Airwallex API Service
 * =====================
 * Handles authentication and API calls to Airwallex for card issuing.
 * Credentials are loaded from the database Settings table.
 */

import { prisma } from '@/server/prisma';

// API Base URLs
const API_BASE_URLS = {
  demo: 'https://api-demo.airwallex.com',
  prod: 'https://api.airwallex.com',
} as const;

// Token cache (includes settings hash to invalidate on credential change)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
let cachedSettingsHash: string | null = null;

// Settings type from database
interface AirwallexSettings {
  airwallexClientId: string;
  airwallexApiKey: string;
  airwallexEnv: string;
  airwallexCardholderId: string;
}

/**
 * Gets Airwallex settings from the database
 * @param requireCardholderId - Whether to require cardholder ID (not needed for listing cardholders)
 */
async function getSettings(
  requireCardholderId = true,
): Promise<AirwallexSettings> {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    throw new Error(
      'Airwallex settings not configured. Please go to Settings to configure your API credentials.',
    );
  }

  if (!settings.airwallexClientId) {
    throw new Error(
      'Airwallex Client ID not configured. Please go to Settings to add it.',
    );
  }
  if (!settings.airwallexApiKey) {
    throw new Error(
      'Airwallex API Key not configured. Please go to Settings to add it.',
    );
  }
  if (requireCardholderId && !settings.airwallexCardholderId) {
    throw new Error(
      'Airwallex Cardholder ID not configured. Please go to Settings to add it.',
    );
  }

  return {
    airwallexClientId: settings.airwallexClientId,
    airwallexApiKey: settings.airwallexApiKey,
    airwallexEnv: settings.airwallexEnv,
    airwallexCardholderId: settings.airwallexCardholderId,
  };
}

/**
 * Creates a simple hash of settings to detect changes
 */
function hashSettings(settings: AirwallexSettings): string {
  return `${settings.airwallexClientId}:${settings.airwallexApiKey}:${settings.airwallexEnv}`;
}

/**
 * Gets the API base URL based on environment
 */
function getBaseUrl(env: string): string {
  return API_BASE_URLS[env as keyof typeof API_BASE_URLS] || API_BASE_URLS.demo;
}

/**
 * Authenticates with Airwallex and returns a bearer token
 * @param requireCardholderId - Whether to require cardholder ID in settings validation
 */
async function authenticate(requireCardholderId = true): Promise<{
  token: string;
  settings: AirwallexSettings;
}> {
  const settings = await getSettings(requireCardholderId);
  const settingsHash = hashSettings(settings);

  // Invalidate cache if settings changed
  if (cachedSettingsHash !== settingsHash) {
    cachedToken = null;
    tokenExpiry = null;
    cachedSettingsHash = settingsHash;
  }

  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return { token: cachedToken, settings };
  }

  const response = await fetch(
    `${getBaseUrl(settings.airwallexEnv)}/api/v1/authentication/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': settings.airwallexClientId,
        'x-api-key': settings.airwallexApiKey,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airwallex authentication failed: ${error}`);
  }

  const data = (await response.json()) as {
    token: string;
    expires_at: string;
  };

  cachedToken = data.token;
  tokenExpiry = new Date(data.expires_at).getTime();

  return { token: cachedToken, settings };
}

/**
 * Makes an authenticated request to the Airwallex API
 * @param requireCardholderId - Whether to require cardholder ID in settings validation
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireCardholderId = true,
): Promise<{ data: T; settings: AirwallexSettings }> {
  const { token, settings } = await authenticate(requireCardholderId);

  const response = await fetch(
    `${getBaseUrl(settings.airwallexEnv)}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airwallex API error (${response.status}): ${error}`);
  }

  return { data: (await response.json()) as T, settings };
}

// Type definitions for Airwallex API responses
export interface CreateCardRequest {
  cardholder_id: string;
  request_id?: string;
  created_by?: string;
  is_personalized?: boolean;
  form_factor: 'VIRTUAL' | 'PHYSICAL';
  program: {
    purpose: 'COMMERCIAL' | 'CONSUMER';
    type?: 'CREDIT' | 'DEBIT' | 'PREPAID';
  };
  purpose: 'ONLINE_PURCHASING' | 'TRAVEL' | 'SUBSCRIPTION' | 'OTHER';
  nick_name?: string;
  authorization_controls?: {
    allowed_transaction_count?: 'SINGLE' | 'MULTIPLE';
    transaction_limits?: {
      currency: string;
      limits: Array<{
        amount: number;
        interval:
          | 'PER_TRANSACTION'
          | 'DAILY'
          | 'WEEKLY'
          | 'MONTHLY'
          | 'YEARLY'
          | 'ALL_TIME';
      }>;
    };
  };
  activate_on_issue?: boolean;
}

export interface CreateCardResponse {
  card_id: string;
  card_status: string;
  nick_name?: string;
  created_at: string;
}

export interface SensitiveCardDetails {
  card_number: string;
  cvv: string;
  expiry_month: number;
  expiry_year: number;
  name_on_card: string;
}

export interface ListCardsResponse {
  items: Array<{
    card_id: string;
    card_status: string;
    nick_name?: string;
    created_at: string;
    form_factor: string;
  }>;
  has_more: boolean;
}

export interface Cardholder {
  cardholder_id: string;
  individual?: {
    first_name: string;
    last_name: string;
    date_of_birth?: string;
  };
  email?: string;
  status: string;
  created_at: string;
}

export interface ListCardholdersResponse {
  items: Cardholder[];
  has_more: boolean;
}

/**
 * Creates a new virtual card
 */
export async function createCard(
  nickname?: string,
  transactionLimit = 15000,
): Promise<CreateCardResponse> {
  const { settings } = await authenticate();

  const request: CreateCardRequest = {
    cardholder_id: settings.airwallexCardholderId,
    request_id: crypto.randomUUID(),
    created_by: 'API',
    is_personalized: false,
    form_factor: 'VIRTUAL',
    program: {
      purpose: 'COMMERCIAL',
    },

    purpose: 'ONLINE_PURCHASING',
    authorization_controls: {
      allowed_transaction_count: 'MULTIPLE',
      transaction_limits: {
        currency: 'CAD',
        limits: [
          {
            amount: transactionLimit,
            interval: 'PER_TRANSACTION',
          },
        ],
      },
    },
  };

  if (nickname) {
    request.nick_name = nickname;
  }

  const { data } = await apiRequest<CreateCardResponse>(
    '/api/v1/issuing/cards/create',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return data;
}

/**
 * Gets sensitive card details (card number, CVV, expiry)
 */
export async function getSensitiveCardDetails(
  cardId: string,
): Promise<SensitiveCardDetails> {
  const { data } = await apiRequest<SensitiveCardDetails>(
    `/api/v1/issuing/cards/${cardId}/details`,
    {
      method: 'GET',
    },
  );

  return data;
}

/**
 * Lists all cards from Airwallex
 */
export async function listAirwallexCards(
  pageNum = 0,
  pageSize = 50,
): Promise<ListCardsResponse> {
  const { data } = await apiRequest<ListCardsResponse>(
    `/api/v1/issuing/cards?page_num=${pageNum}&page_size=${pageSize}`,
    {
      method: 'GET',
    },
  );

  return data;
}

/**
 * Lists all cardholders from Airwallex
 * Note: Does not require cardholder ID to be configured (used to help users find it)
 */
export async function listCardholders(
  pageNum = 0,
  pageSize = 50,
): Promise<ListCardholdersResponse> {
  const { data } = await apiRequest<ListCardholdersResponse>(
    `/api/v1/issuing/cardholders?page_num=${pageNum}&page_size=${pageSize}`,
    { method: 'GET' },
    false, // Don't require cardholder ID - we're listing to help user find it
  );

  return data;
}

/**
 * Creates multiple cards and returns their details
 */
export async function createMultipleCards(
  count: number,
  nicknameGenerator: (index: number) => string,
): Promise<
  Array<{
    cardId: string;
    nickname: string;
    details: SensitiveCardDetails;
  }>
> {
  const results: Array<{
    cardId: string;
    nickname: string;
    details: SensitiveCardDetails;
  }> = [];

  for (let i = 0; i < count; i++) {
    const nickname = nicknameGenerator(i);

    // Create the card
    const card = await createCard(nickname);

    // Get sensitive details
    const details = await getSensitiveCardDetails(card.card_id);

    results.push({
      cardId: card.card_id,
      nickname: nickname,
      details,
    });
  }

  return results;
}
