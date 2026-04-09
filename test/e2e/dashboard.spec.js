const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const { normalizeText, registerSuiteHooks } = require('./helpers/suiteSetup');

describe('Frontend e2e dashboard', function () {
  this.timeout(60000);

  const ctx = {};
  registerSuiteHooks(ctx);

  it('carga dashboard y renderiza el bloque principal', async function () {
    await ctx.driver.get(`${ctx.baseUrl}/dashboard.html`);

    await ctx.driver.wait(until.elementLocated(By.id('projectNameHeader')), 10000);

    const heading = await ctx.driver.findElement(By.id('projectNameHeader')).getText();
    const uploadButton = await ctx.driver.findElement(By.id('btnUploadTxt')).getText();

    expect(normalizeText(heading)).to.equal('Informacion del Proyecto');
    expect(uploadButton.toLowerCase()).to.include('subir y procesar txt');
  });
});
