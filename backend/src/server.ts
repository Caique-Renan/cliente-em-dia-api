import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import { authRoutes } from './modules/auth/auth.routes';
import { customersRoutes } from './modules/customers/customers.routes';
import { attendancesRoutes } from './modules/attendances/attendances.routes';
import { tasksRoutes } from './modules/tasks/tasks.routes';
import { quotesRoutes } from './modules/quotes/quotes.routes';
import { messagesRoutes } from './modules/messages/messages.routes';
import { reportsRoutes } from './modules/reports/reports.routes';

// Registar rotas de módulos
app.use('/auth', authRoutes);
app.use('/customers', customersRoutes);
app.use('/attendances', attendancesRoutes);
app.use('/tasks', tasksRoutes);
app.use('/quotes', quotesRoutes);
app.use('/', messagesRoutes);
app.use('/reports', reportsRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
app.listen(PORT as number, HOST, () => {
  console.log(`🚀 HTTP Server running on http://${HOST}:${PORT}`);
});
