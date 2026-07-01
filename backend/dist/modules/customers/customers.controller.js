"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const customers_service_1 = require("./customers.service");
const customers_schemas_1 = require("./customers.schemas");
const AppError_1 = require("../../errors/AppError");
class CustomersController {
    customersService;
    constructor() {
        this.customersService = new customers_service_1.CustomersService();
        this.create = this.create.bind(this);
        this.list = this.list.bind(this);
        this.findById = this.findById.bind(this);
        this.update = this.update.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
    }
    async create(req, res, next) {
        try {
            const data = customers_schemas_1.createCustomerSchema.parse(req.body);
            const companyId = req.user?.activeCompanyId;
            const userId = req.user?.userId;
            if (!companyId || !userId) {
                throw new AppError_1.AppError('Contexto de empresa ou usuário não encontrado', 403);
            }
            const customer = await this.customersService.create(data, companyId, userId);
            res.status(201).json(customer);
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const filters = customers_schemas_1.listCustomersQuerySchema.parse(req.query);
            const companyId = req.user?.activeCompanyId;
            if (!companyId) {
                throw new AppError_1.AppError('Contexto de empresa não encontrado', 403);
            }
            const result = await this.customersService.list(companyId, filters);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const id = req.params.id;
            const companyId = req.user?.activeCompanyId;
            if (!companyId) {
                throw new AppError_1.AppError('Contexto de empresa não encontrado', 403);
            }
            const customer = await this.customersService.findById(id, companyId);
            res.json(customer);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = customers_schemas_1.updateCustomerSchema.parse(req.body);
            const companyId = req.user?.activeCompanyId;
            const userId = req.user?.userId;
            if (!companyId || !userId) {
                throw new AppError_1.AppError('Contexto de empresa ou usuário não encontrado', 403);
            }
            const customer = await this.customersService.update(id, data, companyId, userId);
            res.json(customer);
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const id = req.params.id;
            const { status } = customers_schemas_1.updateCustomerStatusSchema.parse(req.body);
            const companyId = req.user?.activeCompanyId;
            const userId = req.user?.userId;
            if (!companyId || !userId) {
                throw new AppError_1.AppError('Contexto de empresa ou usuário não encontrado', 403);
            }
            const customer = await this.customersService.updateStatus(id, status, companyId, userId);
            res.json(customer);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CustomersController = CustomersController;
