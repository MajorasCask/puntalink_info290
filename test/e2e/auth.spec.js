const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const { dismissAlertIfPresent, normalizeText, registerSuiteHooks } = require('./helpers/suiteSetup');

describe('Frontend e2e auth', function () {
  this.timeout(60000);

  const ctx = {};
  registerSuiteHooks(ctx);

  it('inicia sesion correctamente', async function () {
    await ctx.driver.get(`${ctx.baseUrl}/index.html`);

    const activateButton = await ctx.driver.wait(until.elementLocated(By.id('craneActivate')), 10000);
    await activateButton.click();

    const loginForm = await ctx.driver.wait(until.elementLocated(By.id('loginForm')), 10000);
    await ctx.driver.wait(async () => {
      const className = await loginForm.getAttribute('class');
      return className.includes('active');
    }, 10000);

    const buttonText = await activateButton.getText();
    expect(normalizeText(buttonText)).to.include('GRUA ACTIVA');

    await ctx.driver.executeScript("window.onGoogleCredential({ credential: 'fake-google-token' });");
    await dismissAlertIfPresent(ctx.driver);

    await ctx.driver.wait(async () => {
      const display = await ctx.driver.executeScript(
        "return window.getComputedStyle(document.getElementById('mainContent')).display;"
      );
      return display !== 'none';
    }, 10000);
    await dismissAlertIfPresent(ctx.driver);

    const userEmail = await ctx.driver.findElement(By.id('userEmail')).getText();
    expect(userEmail).to.equal('e2e@puntalink.local');
  });
});
