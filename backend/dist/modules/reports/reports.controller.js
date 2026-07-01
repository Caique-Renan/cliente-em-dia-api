"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const reports_schema_1 = require("./reports.schema");
class ReportsController {
    async getOverview(req, res) {
        const companyId = req.user.activeCompanyId;
        const rawQuery = reports_schema_1.overviewQuerySchema.parse(req.query);
        const period = (0, reports_schema_1.resolvePeriod)(rawQuery);
        const overview = await reports_service_1.reportsService.getOverview(companyId, period);
        return res.json(overview);
    }
}
exports.ReportsController = ReportsController;
exports.reportsController = new ReportsController();
