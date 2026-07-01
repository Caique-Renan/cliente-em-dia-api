"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksController = exports.TasksController = void 0;
const tasks_service_1 = require("./tasks.service");
const tasks_schemas_1 = require("./tasks.schemas");
class TasksController {
    async create(req, res) {
        const data = tasks_schemas_1.createTaskSchema.parse(req.body);
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const task = await tasks_service_1.tasksService.create(companyId, userId, data);
        return res.status(201).json(task);
    }
    async list(req, res) {
        const filters = tasks_schemas_1.listTasksQuerySchema.parse(req.query);
        const companyId = req.user.activeCompanyId;
        const result = await tasks_service_1.tasksService.list(companyId, filters);
        return res.json(result);
    }
    async getById(req, res) {
        const companyId = req.user.activeCompanyId;
        const id = req.params.id;
        const task = await tasks_service_1.tasksService.getById(id, companyId);
        return res.json(task);
    }
    async update(req, res) {
        const data = tasks_schemas_1.updateTaskSchema.parse(req.body);
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const id = req.params.id;
        const task = await tasks_service_1.tasksService.update(id, companyId, userId, data);
        return res.json(task);
    }
    async updateStatus(req, res) {
        const { status } = tasks_schemas_1.updateTaskStatusSchema.parse(req.body);
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const id = req.params.id;
        const task = await tasks_service_1.tasksService.updateStatus(id, companyId, userId, status);
        return res.json(task);
    }
    async complete(req, res) {
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const id = req.params.id;
        const task = await tasks_service_1.tasksService.complete(id, companyId, userId);
        return res.json(task);
    }
}
exports.TasksController = TasksController;
exports.tasksController = new TasksController();
