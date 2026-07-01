import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../errors/AppError';

export class AuthService {
  async register(data: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Creates the user, the company, and the linkage all in one transaction
    const user = await prisma.user.create({
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

    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

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

  async login(data: any) {
    const user = await prisma.user.findUnique({
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
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('User is not active', 403);
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

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

  async selectCompany(userId: string, companyId: string) {
    const companyUser = await prisma.companyUser.findUnique({
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
      throw new AppError('User does not belong to this company', 403);
    }

    if (companyUser.status !== 'ACTIVE' || companyUser.company.status !== 'ACTIVE') {
      throw new AppError('Company or User is not active', 403);
    }

    const token = jwt.sign(
      {
        userId,
        activeCompanyId: companyId,
        role: companyUser.role,
      },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      activeCompany: {
        id: companyUser.company.id,
        name: companyUser.company.name,
        role: companyUser.role,
      },
      token,
    };
  }

  async me(userId: string, activeCompanyId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let activeCompany = null;
    if (activeCompanyId) {
      const companyUser = await prisma.companyUser.findUnique({
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
