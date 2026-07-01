import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de demonstração...');

  // 1. Usuário Demo e Empresa
  const passwordHash = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@clienteemdia.com' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@clienteemdia.com',
      passwordHash,
      companies: {
        create: {
          role: 'OWNER',
          company: {
            create: {
              name: 'Empresa Demo Ltda',
            }
          }
        }
      }
    },
    include: {
      companies: {
        include: {
          company: true
        }
      }
    }
  });

  const companyId = user.companies[0].companyId;
  const userId = user.id;

  console.log(`Usuário e empresa criados! Email: demo@clienteemdia.com / Senha: demo123`);

  // Limpar dados anteriores para evitar duplicação em múltiplos runs
  await prisma.messageLog.deleteMany({ where: { companyId } });
  await prisma.messageTemplate.deleteMany({ where: { companyId } });
  await prisma.quoteItem.deleteMany({ where: { quote: { companyId } } });
  await prisma.quote.deleteMany({ where: { companyId } });
  await prisma.task.deleteMany({ where: { companyId } });
  await prisma.attendance.deleteMany({ where: { companyId } });
  await prisma.customer.deleteMany({ where: { companyId } });

  // 2. Clientes
  const c1 = await prisma.customer.create({
    data: { companyId, name: 'João Silva', email: 'joao@example.com', phone: '5511999991111' }
  });
  const c2 = await prisma.customer.create({
    data: { companyId, name: 'Maria Souza', email: 'maria@example.com', phone: '5511999992222' }
  });
  const c3 = await prisma.customer.create({
    data: { companyId, name: 'Carlos Ferreira', document: '12345678909' }
  });

  // 3. Atendimentos
  const a1 = await prisma.attendance.create({
    data: {
      companyId, createdById: userId, customerId: c1.id,
      title: 'Interesse em Serviço de Consultoria',
      status: 'NEGOTIATION',
      potentialValueCents: 500000,
    }
  });

  const a2 = await prisma.attendance.create({
    data: {
      companyId, createdById: userId, customerId: c2.id,
      title: 'Manutenção Preventiva',
      status: 'WAITING_CUSTOMER',
    }
  });

  // 4. Tarefas (Follow-ups)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.task.create({
    data: {
      companyId, createdById: userId, customerId: c1.id, attendanceId: a1.id,
      title: 'Ligar para confirmar proposta',
      status: 'TODO',
      dueDate: tomorrow
    }
  });

  await prisma.task.create({
    data: {
      companyId, createdById: userId, customerId: c2.id, attendanceId: a2.id,
      title: 'Enviar documentação',
      status: 'TODO',
      dueDate: yesterday // Atrasada de propósito
    }
  });

  // 5. Orçamentos
  const quote1 = await prisma.quote.create({
    data: {
      companyId, createdById: userId, customerId: c1.id, attendanceId: a1.id,
      title: 'Proposta Comercial - Consultoria',
      status: 'SENT',
      totalValueCents: 500000,
      items: {
        create: [
          { description: 'Consultoria Estratégica (40h)', quantity: 1, unitPriceCents: 500000, totalPriceCents: 500000 }
        ]
      }
    }
  });

  await prisma.quote.create({
    data: {
      companyId, createdById: userId, customerId: c3.id,
      title: 'Desenvolvimento de Website',
      status: 'ACCEPTED',
      totalValueCents: 1200000,
      acceptedAt: new Date(),
      items: {
        create: [
          { description: 'Website Institucional', quantity: 1, unitPriceCents: 1200000, totalPriceCents: 1200000 }
        ]
      }
    }
  });

  // 6. Templates de Mensagem
  await prisma.messageTemplate.create({
    data: {
      companyId, title: 'Apresentação Inicial',
      content: 'Olá {{customerName}}, tudo bem? Sou o consultor responsável pelo seu atendimento. Como posso te ajudar hoje?'
    }
  });

  await prisma.messageTemplate.create({
    data: {
      companyId, title: 'Envio de Orçamento',
      content: 'Olá {{customerName}}, o orçamento "{{quoteTitle}}" no valor de {{quoteTotal}} já está disponível para sua análise.'
    }
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
