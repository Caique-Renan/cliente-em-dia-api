"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRoutes = void 0;
const express_1 = require("express");
const messages_controller_1 = require("./messages.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
exports.messagesRoutes = router;
router.use(auth_1.requireAuth, auth_1.requireActiveCompany);
// Message Templates
router.get('/message-templates', messages_controller_1.messagesController.listTemplates);
router.get('/message-templates/:id', messages_controller_1.messagesController.getTemplate);
router.post('/message-templates', messages_controller_1.messagesController.createTemplate);
router.patch('/message-templates/:id', messages_controller_1.messagesController.updateTemplate);
router.patch('/message-templates/:id/status', messages_controller_1.messagesController.updateTemplateStatus);
router.post('/message-templates/preview', messages_controller_1.messagesController.previewMessage); // I'll use a route without :id if they want to preview without template, but they asked for /message-templates/:id/preview or generic. Let's make it generic or with id.
// Logs
router.post('/message-logs', messages_controller_1.messagesController.createLog);
