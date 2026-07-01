"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendancesController = void 0;
const attendances_service_1 = require("./attendances.service");
const attendances_schemas_1 = require("./attendances.schemas");
exports.attendancesController = {
    async list(req, res) {
        const companyId = req.user.activeCompanyId;
        const query = attendances_schemas_1.listAttendancesQuerySchema.parse(req.query);
        const result = await attendances_service_1.attendancesService.list({
            companyId,
            ...query,
        });
        res.json(result);
    },
    async getById(req, res) {
        const companyId = req.user.activeCompanyId;
        const { id } = req.params;
        const attendance = await attendances_service_1.attendancesService.findById(companyId, id);
        res.json(attendance);
    },
    async create(req, res) {
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const data = attendances_schemas_1.createAttendanceSchema.parse(req.body);
        const attendance = await attendances_service_1.attendancesService.create({
            companyId,
            createdById: userId,
            ...data,
        });
        res.status(201).json(attendance);
    },
    async update(req, res) {
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const { id } = req.params;
        const data = attendances_schemas_1.updateAttendanceSchema.parse(req.body);
        const attendance = await attendances_service_1.attendancesService.update({
            companyId,
            id: id,
            ...data,
        }, userId);
        res.json(attendance);
    },
    async updateStatus(req, res) {
        const companyId = req.user.activeCompanyId;
        const userId = req.user.userId;
        const { id } = req.params;
        const { status, lossReason } = attendances_schemas_1.updateAttendanceStatusSchema.parse(req.body);
        const attendance = await attendances_service_1.attendancesService.updateStatus(companyId, id, status, userId, lossReason);
        res.json(attendance);
    },
};
