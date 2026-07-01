"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res, next) {
        try {
            const registerSchema = zod_1.z.object({
                name: zod_1.z.string().min(2),
                email: zod_1.z.string().email(),
                password: zod_1.z.string().min(6),
                companyName: zod_1.z.string().min(2),
            });
            const data = registerSchema.parse(req.body);
            const result = await authService.register(data);
            return res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const loginSchema = zod_1.z.object({
                email: zod_1.z.string().email(),
                password: zod_1.z.string(),
            });
            const data = loginSchema.parse(req.body);
            const result = await authService.login(data);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async selectCompany(req, res, next) {
        try {
            const selectCompanySchema = zod_1.z.object({
                companyId: zod_1.z.string().uuid(),
            });
            const { companyId } = selectCompanySchema.parse(req.body);
            const userId = req.user.userId;
            const result = await authService.selectCompany(userId, companyId);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async me(req, res, next) {
        try {
            const userId = req.user.userId;
            const activeCompanyId = req.user.activeCompanyId; // Pode ser undefined no primeiro token
            const result = await authService.me(userId, activeCompanyId);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
