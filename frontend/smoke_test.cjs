const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("1. Navegando para o Dashboard");
  await page.goto('http://localhost:5173');
  
  // Login if necessary
  if (await page.isVisible('input[type="email"]')) {
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', '123456');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
  }

  // Dashboard check
  console.log("Verificando Dashboard API calls");
  let reportsOverviewCalled = 0;
  let otherCalls = 0;
  
  page.on('request', request => {
    if (request.url().includes('/reports/overview')) reportsOverviewCalled++;
    else if (request.url().includes('/customers') && request.method() === 'GET') otherCalls++;
  });

  await page.reload();
  await page.waitForTimeout(2000);

  console.log(`Chamadas para /reports/overview: ${reportsOverviewCalled}`);
  console.log(`Outras chamadas de lista (ex: /customers): ${otherCalls}`);

  console.log("Verificando se os cards do dashboard aparecem...");
  const hasClientes = await page.isVisible('text=Clientes');
  const hasAtendimentos = await page.isVisible('text=Atendimentos');
  const hasOrcamentos = await page.isVisible('text=Orçamentos em aberto');
  const hasFollowUps = await page.isVisible('text=Follow-ups');
  console.log(`Cards carregados: Clientes=${hasClientes}, Atendimentos=${hasAtendimentos}, Orçamentos=${hasOrcamentos}, Follow-ups=${hasFollowUps}`);

  console.log("Clicando em 'Ver relatório completo'");
  await page.click('text=Ver relatório completo');
  await page.waitForURL('**/reports');
  
  console.log("Página /reports carregada");
  const isReports = await page.isVisible('h1:has-text("Relatórios")');
  console.log(`Título da página Relatórios visível: ${isReports}`);

  console.log("Testando presets...");
  await page.click('button:has-text("Hoje")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("30 dias")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Personalizado")');
  await page.waitForTimeout(500);

  console.log("Testando período invertido");
  await page.fill('input[type="date"]:nth-of-type(1)', '2026-06-30');
  await page.fill('input[type="date"]:nth-of-type(2)', '2026-06-01');
  
  await page.click('button:has-text("Aplicar")');
  await page.waitForTimeout(1000);
  
  const hasError = await page.isVisible('text=dateFrom deve ser anterior a dateTo');
  console.log(`Erro controlado exibido: ${hasError}`);

  console.log("Fechando navegador");
  await browser.close();
})();
