"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesController = exports.MessagesController = void 0;
const messages_service_1 = require("./messages.service");
const messages_schema_1 = require("./messages.schema");
class MessagesController {
    async listTemplates(req, res) {
        const companyId = req.user.activeCompanyId;
        const templates = await messages_service_1.messagesService.listTemplates(companyId);
        return res.json({ data: templates });
    }
    async getTemplate(req, res) {
        const companyId = req.user.activeCompanyId;
        const id = req.params.id;
        const template = await messages_service_1.messagesService.findTemplateById(companyId, id);
        return res.json(template);
    }
    async createTemplate(req, res) {
        const companyId = req.user.activeCompanyId;
        const createdById = req.user.userId;
        const data = messages_schema_1.createTemplateSchema.parse(req.body);
        const template = await messages_service_1.messagesService.createTemplate(companyId, createdById, data);
        return res.status(201).json(template);
    }
    async updateTemplate(req, res) {
        const companyId = req.user.activeCompanyId;
        const id = req.params.id;
        const data = messages_schema_1.updateTemplateSchema.parse(req.body);
        const template = await messages_service_1.messagesService.updateTemplate(companyId, id, data);
        return res.json(template);
    }
    async updateTemplateStatus(req, res) {
        const companyId = req.user.activeCompanyId;
        const id = req.params.id;
        const data = messages_schema_1.updateTemplateStatusSchema.parse(req.body);
        const template = await messages_service_1.messagesService.updateTemplateStatus(companyId, id, data);
        return res.json(template);
    }
    async previewMessage(req, res) {
        const companyId = req.user.activeCompanyId;
        const data = messages_schema_1.previewMessageSchema.parse(req.body);
        const result = await messages_service_1.messagesService.previewMessage(companyId, data);
        return res.json(result);
    }
    async createLog(req, res) {
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const data = messages_schema_1.createMessageLogSchema.parse(req.body);
        const log = await messages_service_1.messagesService.createLog(companyId, userId, data);
        return res.status(201).json(log);
    }
}
exports.MessagesController = MessagesController;
exports.messagesController = new MessagesController();
