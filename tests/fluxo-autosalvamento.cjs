const { chromium } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

async function conferirDemoNoCelular(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('navigation', { name: 'Menu principal' });
  const salvo = page.getByText('Dados salvos na sua conta.', { exact: true });
  await menu.getByRole('link', { name: 'Conta' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar cópia de segurança' }).click();
  const copia = await (await download).path();

  await page.getByRole('button', { name: 'Substituir dados exibidos por exemplo' }).click();
  await page.getByLabel('Digite EXCLUIR').fill('EXCLUIR');
  await page.getByRole('button', { name: 'Apagar e restaurar exemplo' }).click();
  await page.getByRole('alertdialog').waitFor({ state: 'hidden' });
  await salvo.waitFor();
  await menu.getByRole('link', { name: 'Visão geral' }).click();
  await page.getByText('R$ 645.000,00', { exact: true }).waitFor();
  await menu.getByRole('link', { name: 'Patrimônio' }).click();
  await page.getByText('R$ 132.000,00', { exact: true }).waitFor();
  await page.getByText('R$ 513.000,00', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Editar Apartamento', exact: true }).click();
  await page.getByLabel('Valor estimado (R$)').fill('10000000.12');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await salvo.waitFor();
  await page.reload();
  await page.getByText('R$ 10.000.000,12', { exact: false }).first().waitFor();
  await menu.getByRole('link', { name: 'Metas' }).click();
  await page.getByLabel('Cenário 1 da meta Reserva para imprevistos (R$)').fill('500');
  await page.getByText('Aproximadamente 36 meses', { exact: true }).waitFor();
  await page.getByLabel('Cenário 2 da meta Reserva para imprevistos (R$)').fill('1000');
  await page.getByText('Aproximadamente 18 meses', { exact: true }).waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    'A tela de metas deve caber na largura do celular.');

  await menu.getByRole('link', { name: 'Conta' }).click();
  await Promise.all([
    page.waitForResponse(response =>
      new URL(response.url()).pathname === '/rest/v1/patrimonio_usuario' &&
      response.request().method() === 'PATCH' && response.ok()),
    page.waitForEvent('dialog').then(dialog => dialog.accept()),
    page.getByLabel('Restaurar cópia', { exact: true }).setInputFiles(copia),
  ]);
  await salvo.waitFor();
  await menu.getByRole('link', { name: 'Patrimônio' }).click();
  await page.waitForURL('**/patrimonio');
  await page.reload();
  await page.getByText('Adição sessão A', { exact: true }).waitFor();
  console.log('Demo em 390 px, totais, simulações e restauração da cópia JSON: OK');
}

(async () => {
 const client = createClient(process.env.TEST_URL, process.env.TEST_KEY, {auth:{persistSession:false}});
 const email=process.env.TEST_EMAIL || `qa-${randomUUID()}@example.test`, password=`Teste-${randomUUID()}!`;
 const signup=await client.auth.signUp({email,password}); if(signup.error||!signup.data.session) throw new Error('Não foi possível criar usuário de teste.');
 const browser=await chromium.launch({headless:true, channel: process.platform === 'win32' ? 'msedge' : undefined});
 async function conectar(){const context=await browser.newContext();const page=await context.newPage();await page.goto('http://localhost:3000/conta');await page.getByLabel('E-mail').fill(email);await page.getByLabel('Senha').fill(password);await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.getByText('Conta conectada').first().waitFor();await page.goto('http://localhost:3000/patrimonio');await page.getByText(/Dados salvos na sua conta\.|Conta nova: ainda não há dados salvos\./).waitFor();return {page,context}}
 async function adicionar(page,nome){await page.getByRole('button',{name:'Adicionar patrimônio'}).click();await page.getByLabel('Nome',{exact:true}).fill(nome);await page.getByLabel('Valor estimado (R$)').fill('1000');await page.getByLabel('Data da avaliação').fill('2026-11-09');await page.getByRole('button',{name:'Adicionar item'}).click();await page.getByText(nome,{exact:true}).waitFor()}
 try {const a=await conectar();await adicionar(a.page,'Bem inicial teste');try { await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000}); } catch(e) { console.log('Estado:',await a.page.locator('.demo-note').innerText()); throw e; } await a.page.reload();await a.page.getByText('Bem inicial teste',{exact:true}).waitFor(); console.log('Login, salvamento e recarga: OK');
 await a.page.route('**/rest/v1/patrimonio_usuario*',async route=>{if(route.request().method()==='PATCH')await route.abort('internetdisconnected');else await route.continue()});await adicionar(a.page,'Alteração com conexão interrompida');await a.page.getByText('Falha ao salvar.',{exact:false}).waitFor({timeout:30000});await a.page.getByText('Alteração com conexão interrompida',{exact:true}).waitFor();await a.page.unroute('**/rest/v1/patrimonio_usuario*');await a.page.getByRole('button',{name:'Tentar novamente'}).click();await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000});await a.page.reload();await a.page.getByText('Alteração com conexão interrompida',{exact:true}).waitFor();console.log('Falha de conexão e nova tentativa: OK');
 await a.page.route('**/rest/v1/patrimonio_usuario*',async route=>{if(route.request().method()==='PATCH'){await route.fetch();await route.abort('failed')}else await route.continue()});await adicionar(a.page,'Resposta de salvamento perdida');await a.page.getByText('Falha ao salvar.',{exact:false}).waitFor({timeout:30000});await a.page.unroute('**/rest/v1/patrimonio_usuario*');await a.page.getByRole('button',{name:'Tentar novamente'}).click();await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000});console.log('Resposta perdida após gravação e reconciliação: OK');
 await adicionar(a.page,'Investimento FIIs');await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000});await a.page.goto('http://localhost:3000/metas');await a.page.getByLabel('Nome da meta').fill('Viagem');await a.page.getByLabel('Valor desejado (R$)').fill('2000');await a.page.getByLabel('Valor destinado de Investimento FIIs').fill('500');await a.page.getByRole('button',{name:'Criar meta'}).click();await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000});await a.page.route('**/auth/v1/logout*',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue()});await a.page.getByRole('button',{name:'Sair',exact:true}).click();await a.page.getByText('Encerrando sessão...').waitFor({timeout:1000});await a.page.getByRole('heading',{name:'Entre na sua conta'}).waitFor();await a.page.unroute('**/auth/v1/logout*');console.log('Feedback imediato durante logoff lento: OK');await a.page.goto('http://localhost:3000/conta');await a.page.getByLabel('E-mail').fill(email);await a.page.getByLabel('Senha').fill(password);await a.page.getByRole('button',{name:'Entrar',exact:true}).click();await a.page.getByText('Conta conectada').first().waitFor();await a.page.goto('http://localhost:3000/metas');await a.page.getByText('Investimento FIIs: R$ 500,00',{exact:false}).waitFor();console.log('Investimento, meta, logoff e novo login: OK');await a.page.goto('http://localhost:3000/conta');await a.page.getByRole('heading',{name:'Histórico de versões'}).waitFor();await a.page.getByRole('button',{name:'Conferir versão',exact:true}).first().click();await a.page.getByLabel('Digite RESTAURAR').fill('RESTAURAR');await a.page.getByRole('button',{name:'Restaurar versão'}).click();await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000});await a.page.goto('http://localhost:3000/metas');assert.equal(await a.page.getByText('Investimento FIIs: R$ 500,00',{exact:false}).count(),0);console.log('Restauro de versão anterior: OK');await a.page.goto('http://localhost:3000/patrimonio');
 const outraAba=await a.context.newPage();await outraAba.goto('http://localhost:3000/patrimonio');await outraAba.getByText('Bem inicial teste',{exact:true}).waitFor();await adicionar(a.page,'Sincronizado entre abas');await outraAba.getByText('Sincronizado entre abas',{exact:true}).waitFor({timeout:20000});console.log('Atualização entre abas: OK');await outraAba.close();
 const b=await conectar();await adicionar(a.page,'Adição sessão A');await a.page.getByText('Dados salvos na sua conta.').waitFor({timeout:20000});await adicionar(b.page,'Adição sessão B');await b.page.getByText('Conflito: seus dados ainda não foram salvos.',{exact:false}).waitFor({timeout:20000});const resultado=await client.from('patrimonio_usuario').select('bens').eq('usuario_id',signup.data.user.id).single();assert.equal(resultado.error,null);assert.equal(resultado.data.bens.some(x=>x.nome==='Adição sessão A'),true);assert.equal(resultado.data.bens.some(x=>x.nome==='Adição sessão B'),false);console.log('Conflito entre sessões sem sobrescrita: OK');
 await conferirDemoNoCelular(a.page);
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
