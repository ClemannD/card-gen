/**
 * List Cards Procedure
 * ====================
 * Returns all cards from the database with pagination and sorting
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';

export const listCardsProcedure = publicProcedure
  .input(
    z
      .object({
        page: z.number().min(0).default(0),
        pageSize: z.number().min(1).max(100).default(50),
        sortBy: z
          .enum(['createdAt', 'nickname', 'expiryYear'])
          .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        status: z.enum(['active', 'frozen', 'cancelled']).optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    const page = input?.page ?? 0;
    const pageSize = input?.pageSize ?? 50;
    const sortBy = input?.sortBy ?? 'createdAt';
    const sortOrder = input?.sortOrder ?? 'desc';
    const status = input?.status;

    const where = status ? { status } : {};

    const [cards, total] = await Promise.all([
      ctx.db.card.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      ctx.db.card.count({ where }),
    ]);

    return {
      cards,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

