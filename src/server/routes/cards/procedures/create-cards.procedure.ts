/**
 * Create Cards Procedure
 * ======================
 * Creates multiple virtual cards via Airwallex API and stores them in the database
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import {
  createCard,
  getSensitiveCardDetails,
} from '@/server/services/airwallex';

// Load name lists for random name generation
import firstNamesData from './first-names.json';
import lastNamesData from './last-names.json';

function loadNameLists(): { firstNames: string[]; lastNames: string[] } {
  return {
    firstNames: firstNamesData as string[],
    lastNames: lastNamesData as string[],
  };
}

function generateRandomName(firstNames: string[], lastNames: string[]): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

export const createCardsProcedure = publicProcedure
  .input(
    z.object({
      count: z.number().min(1).max(100),
      nicknamePrefix: z.string().optional(),
      transactionLimit: z.number().min(1).default(15000),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { firstNames, lastNames } = loadNameLists();
    const createdCards: Array<{
      id: string;
      nickname: string;
      cardNumber: string;
      cvv: string;
      expiryMonth: number;
      expiryYear: number;
      nameOnCard: string;
    }> = [];

    for (let i = 0; i < input.count; i++) {
      // Generate nickname
      const nickname = input.nicknamePrefix
        ? `${input.nicknamePrefix} ${i + 1}`
        : generateRandomName(firstNames, lastNames);

      try {
        // Create card via Airwallex API
        const card = await createCard(nickname, input.transactionLimit);

        // Get sensitive details
        const details = await getSensitiveCardDetails(card.card_id);

        // Store in database
        const dbCard = await ctx.db.card.create({
          data: {
            airwallexCardId: card.card_id,
            nickname: nickname,
            cardNumber: details.card_number,
            cvv: details.cvv,
            expiryMonth: details.expiry_month,
            expiryYear: details.expiry_year,
            nameOnCard: details.name_on_card,
            status: 'active',
          },
        });

        createdCards.push({
          id: dbCard.id,
          nickname: dbCard.nickname,
          cardNumber: dbCard.cardNumber,
          cvv: dbCard.cvv,
          expiryMonth: dbCard.expiryMonth,
          expiryYear: dbCard.expiryYear,
          nameOnCard: dbCard.nameOnCard,
        });
      } catch (error) {
        // Log error but continue with remaining cards
        console.error(`Failed to create card ${i + 1}:`, error);
        throw error;
      }
    }

    return {
      created: createdCards.length,
      cards: createdCards,
    };
  });
