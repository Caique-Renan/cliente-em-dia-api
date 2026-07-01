"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const env_1 = require("../../config/env");
const AppError_1 = require("../../errors/AppError");
class AuthService {
    async register(data) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new AppError_1.AppError('User already exists', 400);
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        // Creates the user, the company, and the linkage all in one transaction
        const user = await prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                companies: {
                    create: {
                        role: 'OWNER',
                        company: {
                            create: {
                                name: data.companyName,
                            },
                        },
                    },
                },
            },
            include: {
                companies: {
                    include: {
                        company: true,
                    },
                },
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, { expiresIn: '1d' });
        const companies = user.companies.map((cu) => ({
            id: cu.company.id,
            name: cu.company.name,
            role: cu.role,
        }));
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            companies,
            token,
        };
    }
    async login(data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            include: {
                companies: {
                    where: {
                        status: 'ACTIVE',
                        company: { status: 'ACTIVE' },
                    },
                    include: {
                        company: true,
                    },
                },
            },
        });
        if (!user) {
            throw new AppError_1.AppError('Invalid credentials', 401);
        }
        if (user.status !== 'ACTIVE') {
            throw new AppError_1.AppError('User is not active', 403);
        }
        const validPassword = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!validPassword) {
            throw new AppError_1.AppError('Invalid credentials', 401);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, { expiresIn: '1d' });
        const companies = user.companies.map((cu) => ({
            id: cu.company.id,
            name: cu.company.name,
            role: cu.role,
        }));
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            companies,
            token,
        };
    }
    async selectCompany(userId, companyId) {
        const companyUser = await prisma_1.prisma.companyUser.findUnique({
            where: {
                companyId_userId: {
                    companyId,
                    userId,
                },
            },
            include: {
                company: true,
            },
        });
        if (!companyUser) {
            throw new AppError_1.AppError('User does not belong to this company', 403);
        }
        if (companyUser.status !== 'ACTIVE' || companyUser.company.status !== 'ACTIVE') {
            throw new AppError_1.AppError('Company or User is not active', 403);
        }
        const token = jsonwebtoken_1.default.sign({
            userId,
            activeCompanyId: companyId,
            role: companyUser.role,
        }, env_1.env.JWT_SECRET, { expiresIn: '1d' });
        return {
            activeCompany: {
                id: companyUser.company.id,
                name: companyUser.company.name,
                role: companyUser.role,
            },
            token,
        };
    }
    async me(userId, activeCompanyId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        if (!user) {
            throw new AppError_1.AppError('User not found', 404);
        }
        let activeCompany = null;
        if (activeCompanyId) {
            const companyUser = await prisma_1.prisma.companyUser.findUnique({
                where: {
                    companyId_userId: {
                        companyId: activeCompanyId,
                        userId,
                    },
                },
                include: { company: true },
            });
            if (companyUser && companyUser.status === 'ACTIVE' && companyUser.company.status === 'ACTIVE') {
                activeCompany = {
                    id: companyUser.company.id,
                    name: companyUser.company.name,
                    role: companyUser.role,
                };
            }
        }
        return {
            user,
            activeCompany,
        };
    }
}
exports.AuthService = AuthService;
