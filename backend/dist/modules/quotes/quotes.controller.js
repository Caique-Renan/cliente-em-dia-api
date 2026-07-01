"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotesController = exports.QuotesController = void 0;
const quotes_service_1 = require("./quotes.service");
const quotes_schemas_1 = require("./quotes.schemas");
class QuotesController {
    async create(req, res) {
        const data = quotes_schemas_1.createQuoteSchema.parse(req.body);
        const companyId = req.user.activeCompanyId;
        const createdById = req.user.userId;
        const quote = await quotes_service_1.quotesService.create({
            ...data,
            companyId,
            createdById,
        });
        return res.status(201).json(quote);
    }
    async list(req, res) {
        const filters = quotes_schemas_1.listQuotesQuerySchema.parse(req.query);
        const companyId = req.user.activeCompanyId;
        const result = await quotes_service_1.quotesService.list(companyId, filters);
        return res.json(result);
    }
    async findById(req, res) {
        const companyId = req.user.activeCompanyId;
        const id = req.params.id;
        const quote = await quotes_service_1.quotesService.findById(companyId, id);
        return res.json(quote);
    }
    async update(req, res) {
        const data = quotes_schemas_1.updateQuoteSchema.parse(req.body);
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const id = req.params.id;
        const quote = await quotes_service_1.quotesService.update({
            ...data,
            id,
            companyId,
            userId,
        });
        return res.json(quote);
    }
    async updateStatus(req, res) {
        const { status } = quotes_schemas_1.updateQuoteStatusSchema.parse(req.body);
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const id = req.params.id;
        const quote = await quotes_service_1.quotesService.updateStatus(companyId, id, status, userId);
        return res.json(quote);
    }
}
exports.QuotesController = QuotesController;
exports.quotesController = new QuotesController();
