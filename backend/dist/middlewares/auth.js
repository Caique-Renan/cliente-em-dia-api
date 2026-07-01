"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireActiveCompany = requireActiveCompany;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Token missing' });
    }
    const [, token] = authHeader.split(' ');
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = payload;
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
}
function requireActiveCompany(req, res, next) {
    if (!req.user || !req.user.activeCompanyId) {
        return res.status(403).json({ error: 'Forbidden', message: 'Active company required' });
    }
    return next();
}
