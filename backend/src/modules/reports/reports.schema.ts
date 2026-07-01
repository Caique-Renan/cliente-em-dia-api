import { z } from 'zod';
import { AppError } from '../../errors/AppError';

export const overviewQuerySchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo:   z.string().datetime({ offset: true }).optional(),
});

export type OverviewQuery = z.infer<typeof overviewQuerySchema>;

/**
 * Resolve and validate the period, applying defaults as per spec:
 * - No params       → last 30 days
 * - Only dateFrom   → dateTo = now
 * - Only dateTo     → dateFrom = dateTo - 30 days
 * - dateFrom > dateTo → 400
 */
export function resolvePeriod(raw: OverviewQuery): { from: Date; to: Date } {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let from: Date;
  let to: Date;

  if (!raw.dateFrom && !raw.dateTo) {
    from = thirtyDaysAgo;
    to   = now;
  } else if (raw.dateFrom && !raw.dateTo) {
    from = new Date(raw.dateFrom);
    to   = now;
  } else if (!raw.dateFrom && raw.dateTo) {
    to   = new Date(raw.dateTo);
    from = new Date(to);
    from.setDate(from.getDate() - 30);
  } else {
    from = new Date(raw.dateFrom!);
    to   = new Date(raw.dateTo!);
  }

  if (from > to) {
    throw new AppError('dateFrom deve ser anterior a dateTo', 400);
  }

  return { from, to };
}
