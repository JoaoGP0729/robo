const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 6;

app.use(express.static(path.join(__dirname, 'public')));

// Configurar o EJS como view engine
app.set('view engine', 'ejs');

// Configurar o body-parser para lidar com dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/screenshot', async (req, res) => {
  const { cpf } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto('https://c6.c6consig.com.br/WebAutorizador/Login/AC.UI.LOGIN.aspx?FISession=860277dc86d4');

    await page.type('input[name="EUsuario$CAMPO"]', '36337154878_000248',{delay: 5});
    await page.type('input[name="ESenha$CAMPO"]', 'Jra#2023',{delay: 5});

    await page.waitForSelector('#lnkEntrar');
    await page.click('#lnkEntrar');

    try {
        await page.waitForSelector('.container-fluid', { timeout: 60000 });
    } catch (error) {
        console.error('Falha ao aguardar o seletor .container-fluid:', error);
    }
    
    const containerFluidDiv = await page.$('.container-fluid'); // Select the element
    await containerFluidDiv.click(); // Click on the element

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForSelector('a#WFP2010_PWCDPRPS'); // Aguarda o elemento estar presente na página
    const propostaConsignadoLink = await page.$('a#WFP2010_PWCDPRPS'); // Seleciona o elemento "Proposta Consignado"
    await propostaConsignadoLink.click(); // Clica no elemento "Proposta Consignado"

    await page.waitForSelector('select[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$cboTipoOperacao$CAMPO"]', 'Refinanciamento');
    await page.select('select[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$cboTipoOperacao$CAMPO"]', 'Refinanciamento');

    await page.waitForSelector('select[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$cboTipoProduto$CAMPO"]', '0002');
    await page.select('select[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$cboTipoProduto$CAMPO"]', '0002');

    await page.waitForSelector('select[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$cboGrupoConvenio$CAMPO"]', '5');
    await page.select('select[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$cboGrupoConvenio$CAMPO"]', '5');

    await page.type('input[name="ctl00$Cph$UcPrp$FIJN1$JnDadosIniciais$UcDIni$txtCPF$CAMPO"]', cpf); // Alterado de CPF para cpf

    await page.keyboard.press('Tab');

    await page.waitForSelector('tr.header th'); // Aguarda até que pelo menos um elemento <th> dentro de <tr class="header"> esteja presente
    const headerThs = await page.$$('tr.header th'); // Obtém todos os elementos <th> dentro de <tr class="header">

    // Por exemplo, vamos clicar no segundo <th> com o texto "Cliente"
    await headerThs[1].click();
    await page.waitForTimeout(8000);
    // Realiza a pressão das teclas 'Tab' e 'Enter'
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.click('td > a#btAtuListaContratos_txt');
    await page.waitForTimeout(5000);

    const nomeDoArquivo = path.join(__dirname, 'public', `screenshot_${cpf}.png`);


    await page.screenshot({ path: nomeDoArquivo });
    await page.waitForTimeout(3000);
    await page.click('#ctl00_lk_Sair');
    await page.waitForTimeout(3000);
    await browser.close();
    console.log(`Consulta realizada com sucesso`);
    res.render('screenshot', { screenshotName: nomeDoArquivo });
} catch (error) {
  console.error(error);
  res.status(500).send('Ocorreu um erro ao tirar a screenshot.');
} 

});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});







