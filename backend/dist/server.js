"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
const auth_routes_1 = require("./modules/auth/auth.routes");
const customers_routes_1 = require("./modules/customers/customers.routes");
const attendances_routes_1 = require("./modules/attendances/attendances.routes");
const tasks_routes_1 = require("./modules/tasks/tasks.routes");
const quotes_routes_1 = require("./modules/quotes/quotes.routes");
const messages_routes_1 = require("./modules/messages/messages.routes");
const reports_routes_1 = require("./modules/reports/reports.routes");
// Registar rotas de módulos
app.use('/auth', auth_routes_1.authRoutes);
app.use('/customers', customers_routes_1.customersRoutes);
app.use('/attendances', attendances_routes_1.attendancesRoutes);
app.use('/tasks', tasks_routes_1.tasksRoutes);
app.use('/quotes', quotes_routes_1.quotesRoutes);
app.use('/', messages_routes_1.messagesRoutes);
app.use('/reports', reports_routes_1.reportsRoutes);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(env_1.env.PORT, () => {
    console.log(`🚀 HTTP Server running on http://localhost:${env_1.env.PORT}`);
});
