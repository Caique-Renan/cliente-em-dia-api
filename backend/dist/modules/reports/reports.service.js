"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = void 0;
const prisma_1 = require("../../config/prisma");
class ReportsService {
    async getOverview(companyId, period) {
        const { from, to } = period;
        const now = new Date();
        // Today boundaries (for dueToday)
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        const [
        // Customers
        totalCustomers, newCustomersInPeriod, 
        // Attendances
        totalAttendances, openAttendances, wonAttendances, lostAttendances, attendancesByStatus, 
        // Tasks (current state)
        pendingTasks, overdueTasks, dueTodayTasks, completedTasksInPeriod, 
        // Quotes (state)
        quotesByStatus, 
        // Messages (period)
        messagesByAction,] = await Promise.all([
            // --- CUSTOMERS ---
            // total: current state
            prisma_1.prisma.customer.count({ where: { companyId } }),
            // newInPeriod: period filter
            prisma_1.prisma.customer.count({
                where: { companyId, createdAt: { gte: from, lte: to } },
            }),
            // --- ATTENDANCES ---
            // total: current state
            prisma_1.prisma.attendance.count({ where: { companyId } }),
            // open: current state (not closed)
            prisma_1.prisma.attendance.count({
                where: { companyId, status: { notIn: ['WON', 'LOST', 'CANCELED'] } },
            }),
            // won: current state
            prisma_1.prisma.attendance.count({ where: { companyId, status: 'WON' } }),
            // lost: current state
            prisma_1.prisma.attendance.count({ where: { companyId, status: 'LOST' } }),
            // byStatus: current state grouped
            prisma_1.prisma.attendance.groupBy({
                by: ['status'],
                where: { companyId },
                _count: { _all: true },
            }),
            // --- TASKS ---
            // pending: current state (TODO + IN_PROGRESS)
            prisma_1.prisma.task.count({
                where: { companyId, status: { in: ['TODO', 'IN_PROGRESS'] } },
            }),
            // overdue: current state (dueDate < now, not done/canceled)
            prisma_1.prisma.task.count({
                where: {
                    companyId,
                    dueDate: { lt: now },
                    status: { notIn: ['DONE', 'CANCELED'] },
                },
            }),
            // dueToday: current state
            prisma_1.prisma.task.count({
                where: {
                    companyId,
                    dueDate: { gte: todayStart, lte: todayEnd },
                    status: { notIn: ['DONE', 'CANCELED'] },
                },
            }),
            // completedInPeriod: period filter (completedAt or updatedAt)
            prisma_1.prisma.task.count({
                where: {
                    companyId,
                    status: 'DONE',
                    completedAt: { gte: from, lte: to },
                },
            }),
            // --- QUOTES by status (current state) ---
            prisma_1.prisma.quote.groupBy({
                by: ['status'],
                where: { companyId },
                _count: { _all: true },
                _sum: { totalValueCents: true },
            }),
            // --- MESSAGES (period filter) ---
            prisma_1.prisma.messageLog.groupBy({
                by: ['action'],
                where: { companyId, createdAt: { gte: from, lte: to } },
                _count: { _all: true },
            }),
        ]);
        // --- QUOTES: aggregate from groupBy result ---
        const quotesMap = Object.fromEntries(quotesByStatus.map(q => [q.status, { count: q._count._all, valueCents: q._sum.totalValueCents ?? 0 }]));
        const qDraft = quotesMap['DRAFT'] ?? { count: 0, valueCents: 0 };
        const qSent = quotesMap['SENT'] ?? { count: 0, valueCents: 0 };
        const qAccepted = quotesMap['ACCEPTED'] ?? { count: 0, valueCents: 0 };
        const qRejected = quotesMap['REJECTED'] ?? { count: 0, valueCents: 0 };
        const qExpired = quotesMap['EXPIRED'] ?? { count: 0, valueCents: 0 };
        const openQuotes = qDraft.count + qSent.count;
        const openValueCents = qDraft.valueCents + qSent.valueCents;
        const totalQuotes = openQuotes + qAccepted.count + qRejected.count + qExpired.count;
        // Accepted value filtered by period using acceptedAt
        const acceptedInPeriod = await prisma_1.prisma.quote.aggregate({
            where: {
                companyId,
                status: 'ACCEPTED',
                acceptedAt: { gte: from, lte: to },
            },
            _sum: { totalValueCents: true },
            _count: { _all: true },
        });
        const acceptedValueCents = acceptedInPeriod._sum.totalValueCents ?? 0;
        const acceptedCount = acceptedInPeriod._count._all ?? 0;
        // conversionRate: accepted / (accepted + rejected) in current state
        const decisioned = qAccepted.count + qRejected.count;
        const conversionRate = decisioned > 0
            ? Math.round((qAccepted.count / decisioned) * 100 * 10) / 10
            : 0;
        // --- MESSAGES aggregate ---
        const msgMap = Object.fromEntries(messagesByAction.map(m => [m.action, m._count._all]));
        const copied = msgMap['COPIED'] ?? 0;
        const whatsappOpened = msgMap['OPENED_WHATSAPP'] ?? 0;
        const totalMessages = copied + whatsappOpened + (msgMap['MANUAL_NOTE'] ?? 0);
        return {
            period: {
                from: from.toISOString(),
                to: to.toISOString(),
            },
            customers: {
                total: totalCustomers,
                newInPeriod: newCustomersInPeriod,
            },
            attendances: {
                total: totalAttendances,
                open: openAttendances,
                won: wonAttendances,
                lost: lostAttendances,
                byStatus: attendancesByStatus.map(a => ({
                    status: a.status,
                    count: a._count._all,
                })),
            },
            tasks: {
                pending: pendingTasks,
                overdue: overdueTasks,
                dueToday: dueTodayTasks,
                completedInPeriod: completedTasksInPeriod,
            },
            quotes: {
                total: totalQuotes,
                open: openQuotes,
                accepted: qAccepted.count,
                rejected: qRejected.count,
                expired: qExpired.count,
                openValueCents: openValueCents,
                acceptedValueCents: acceptedValueCents,
                conversionRate,
                byStatus: quotesByStatus.map(q => ({
                    status: q.status,
                    count: q._count._all,
                    totalValueCents: q._sum.totalValueCents ?? 0,
                })),
            },
            messages: {
                copied,
                whatsappOpened,
                total: totalMessages,
                byAction: messagesByAction.map(m => ({
                    action: m.action,
                    count: m._count._all,
                })),
            },
        };
    }
}
exports.ReportsService = ReportsService;
exports.reportsService = new ReportsService();
