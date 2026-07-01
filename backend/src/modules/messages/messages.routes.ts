import { Router } from 'express';
import { messagesController } from './messages.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';
const router = Router();

router.use(requireAuth, requireActiveCompany);

// Message Templates
router.get('/message-templates', messagesController.listTemplates);
router.get('/message-templates/:id', messagesController.getTemplate);
router.post('/message-templates', messagesController.createTemplate);
router.patch('/message-templates/:id', messagesController.updateTemplate);
router.patch('/message-templates/:id/status', messagesController.updateTemplateStatus);
router.post('/message-templates/preview', messagesController.previewMessage); // I'll use a route without :id if they want to preview without template, but they asked for /message-templates/:id/preview or generic. Let's make it generic or with id.

// Logs
router.post('/message-logs', messagesController.createLog);

export { router as messagesRoutes };
