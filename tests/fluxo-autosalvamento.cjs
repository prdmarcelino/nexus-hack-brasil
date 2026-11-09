const { chromium } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');
const assert = require('node:assert/strict');
(async () => {
 const client = createClient(process.env.TEST_URL, process.env.TEST_KEY, {auth:{persistSession:false}});
 const email=process.env.TEST_EMAIL, password='TesteSeguro-123456789!';
 const signup=await client.auth.signUp({email,password}); if(signup.error||!signup.data.session) throw new Error('Não foi possível criar usuário de teste.');
 const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'});
 async function conectar(){const context=await browser.newContext();const page=await context.newPage();await page.goto('http://localhost:3000/conta');await page.getByLabel('E-mail').fill(email);await page.getByLabel('Senha').fill(password);await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.getByText('Conta conectada').first().waitFor();await page.goto('http://localhost:3000/patrimonio');await page.getByText('Dados salvos no banco local.').waitFor();return {page,context}}
 async function adicionar(page,nome){await page.getByRole('button',{name:'Adicionar patrimônio'}).click();await page.getByLabel('Nome',{exact:true}).fill(nome);await page.getByLabel('Valor estimado (R$)').fill('1000');await page.getByLabel('Data da avaliação').fill('2026-11-09');await page.getByRole('button',{name:'Adicionar item'}).click();await page.getByText(nome,{exact:true}).waitFor()}
 try {const a=await conectar();await adicionar(a.page,'Bem inicial teste');try { await a.page.getByText('Dados salvos no banco local.').waitFor({timeout:20000}); } catch(e) { console.log('Estado:',await a.page.locator('.demo-note').innerText()); throw e; } await a.page.reload();await a.page.getByText('Bem inicial teste',{exact:true}).waitFor(); console.log('Login, salvamento e recarga: OK');
 const b=await conectar();await adicionar(a.page,'Adição sessão A');await a.page.getByText('Dados salvos no banco local.').waitFor({timeout:20000});await adicionar(b.page,'Adição sessão B');await b.page.getByText('Os dados foram alterados em outra sessão.',{exact:false}).waitFor({timeout:20000});const resultado=await client.from('patrimonio_usuario').select('bens').eq('usuario_id',signup.data.user.id).single();assert.equal(resultado.error,null);assert.equal(resultado.data.bens.some(x=>x.nome==='Adição sessão A'),true);assert.equal(resultado.data.bens.some(x=>x.nome==='Adição sessão B'),false);console.log('Conflito entre sessões sem sobrescrita: OK');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
