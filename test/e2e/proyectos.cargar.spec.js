const { expect } = require('chai');
const { dismissAlertIfPresent, registerSuiteHooks } = require('./helpers/suiteSetup');

describe('Frontend e2e proyectos - cargar', function () {
  this.timeout(60000);

  const ctx = {};
  registerSuiteHooks(ctx);

  it('carga un proyecto desde la lista', async function () {
    ctx.apiServer.login();
    await ctx.driver.get(`${ctx.baseUrl}/index.html`);
    await dismissAlertIfPresent(ctx.driver);

    await ctx.driver.executeAsyncScript(
      "const done = arguments[0];" +
      "import('./js/index.js').then((m) => m.loadProjectById('u-e2e-1', 101)).then(() => done(true)).catch((e) => done(String(e)));"
    );

    await ctx.driver.wait(async () => {
      const currentUrl = await ctx.driver.getCurrentUrl();
      return currentUrl.includes('/dashboard.html');
    }, 10000);

    const projectConfig = await ctx.driver.executeScript(
      "return JSON.parse(window.localStorage.getItem('projectConfig') || '{}');"
    );

    expect(projectConfig.pid).to.equal(101);
    expect(projectConfig.nombre).to.equal('Proyecto E2E Base');
  });
});
