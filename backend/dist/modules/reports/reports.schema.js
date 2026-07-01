"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overviewQuerySchema = void 0;
exports.resolvePeriod = resolvePeriod;
const zod_1 = require("zod");
const AppError_1 = require("../../errors/AppError");
exports.overviewQuerySchema = zod_1.z.object({
    dateFrom: zod_1.z.string().datetime({ offset: true }).optional(),
    dateTo: zod_1.z.string().datetime({ offset: true }).optional(),
});
/**
 * Resolve and validate the period, applying defaults as per spec:
 * - No params       → last 30 days
 * - Only dateFrom   → dateTo = now
 * - Only dateTo     → dateFrom = dateTo - 30 days
 * - dateFrom > dateTo → 400
 */
function resolvePeriod(raw) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let from;
    let to;
    if (!raw.dateFrom && !raw.dateTo) {
        from = thirtyDaysAgo;
        to = now;
    }
    else if (raw.dateFrom && !raw.dateTo) {
        from = new Date(raw.dateFrom);
        to = now;
    }
    else if (!raw.dateFrom && raw.dateTo) {
        to = new Date(raw.dateTo);
        from = new Date(to);
        from.setDate(from.getDate() - 30);
    }
    else {
        from = new Date(raw.dateFrom);
        to = new Date(raw.dateTo);
    }
    if (from > to) {
        throw new AppError_1.AppError('dateFrom deve ser anterior a dateTo', 400);
    }
    return { from, to };
}
