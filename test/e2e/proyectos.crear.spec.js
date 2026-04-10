const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const { dismissAlertIfPresent, registerSuiteHooks } = require('./helpers/suiteSetup');

describe('Frontend e2e proyectos - crear', function () {
  this.timeout(60000);

  const ctx = {};
  registerSuiteHooks(ctx);

  it('crea un proyecto nuevo', async function () {
    ctx.apiServer.login();
    await ctx.driver.get(`${ctx.baseUrl}/index.html`);
    await dismissAlertIfPresent(ctx.driver);
    await ctx.driver.sleep(300);
    
    await ctx.driver.findElement(By.id('nombreProyecto')).sendKeys('Proyecto Automatizado');
    await ctx.driver.sleep(1000);

    await ctx.driver.findElement(By.id('empresaConstructora')).sendKeys('Empresa QA');
    await ctx.driver.sleep(1000);
    await ctx.driver.findElement(By.id('ubicacionProyecto')).sendKeys('Valparaiso');
    await ctx.driver.sleep(1000);
    await ctx.driver.findElement(By.id('velViento')).sendKeys('125');
    await ctx.driver.sleep(1000);
    await ctx.driver.findElement(By.id('tempPromedio')).sendKeys('22');
    await ctx.driver.sleep(1000);
    await ctx.driver.findElement(By.id('presionAtm')).sendKeys('760');
    await ctx.driver.sleep(1000);

    const submitButton = await ctx.driver.findElement(By.id('btnProjectSubmit'));
    await ctx.driver.executeScript('arguments[0].scrollIntoView({block: "center"});', submitButton);
    await ctx.driver.executeScript('arguments[0].click();', submitButton);

    await ctx.driver.wait(async () => {
      const currentUrl = await ctx.driver.getCurrentUrl();
      return currentUrl.includes('/dashboard.html');
    }, 10000);

    const projectConfig = await ctx.driver.executeScript(
      "return JSON.parse(window.localStorage.getItem('projectConfig') || '{}');"
    );

    expect(projectConfig.nombre).to.equal('Proyecto Automatizado');
    expect(projectConfig.empresa).to.equal('Empresa QA');
    expect(projectConfig.ubicacion).to.equal('Valparaiso');
  });
});
