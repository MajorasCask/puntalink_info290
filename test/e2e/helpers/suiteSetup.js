const path = require('path');
const fs = require('fs');
const addContext = require('mochawesome/addContext');
const { createChromeDriver } = require('./webdriver');
const { createStaticServer } = require('./staticServer');
const { createMockApiServer } = require('./mockApiServer');

const artifactsDir = path.resolve(__dirname, '../../artifacts/e2e');
const frontendPublicDir = path.resolve(__dirname, '../../../frontend/public');

function safeFileName(value) {
  return (value || 'test')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function ensureArtifactsDir() {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function dismissAlertIfPresent(driver) {
  try {
    const alert = await driver.switchTo().alert();
    const text = await alert.getText();
    await alert.accept();
    return text;
  } catch (err) {
    return null;
  }
}

function registerSuiteHooks(ctx) {
  before(async function () {
    ensureArtifactsDir();

    ctx.apiServer = createMockApiServer();
    await ctx.apiServer.listen(4008);

    const requestedPort = Number(process.env.E2E_PORT || 3010);
    ctx.staticServer = createStaticServer(frontendPublicDir);
    const effectivePort = await ctx.staticServer.listen(requestedPort);
    ctx.baseUrl = process.env.E2E_BASE_URL || `http://localhost:${effectivePort}`;

    ctx.driver = await createChromeDriver();
  });

  after(async function () {
    if (ctx.driver) {
      await ctx.driver.quit();
    }
    if (ctx.staticServer) {
      await ctx.staticServer.close();
    }
    if (ctx.apiServer) {
      await ctx.apiServer.close();
    }
  });

  beforeEach(async function () {
    ctx.apiServer.reset();
    await dismissAlertIfPresent(ctx.driver);
    await ctx.driver.get(`${ctx.baseUrl}/index.html`);
    await dismissAlertIfPresent(ctx.driver);
    await ctx.driver.manage().deleteAllCookies();
    await ctx.driver.executeScript('try { window.localStorage.clear(); window.sessionStorage.clear(); } catch (e) {}');
    await dismissAlertIfPresent(ctx.driver);
  });

  afterEach(async function () {
    if (!ctx.driver) return;

    const shouldCapture = this.currentTest.state === 'failed' || process.env.E2E_CAPTURE_ALL === 'true';
    if (!shouldCapture) return;

    const testName = safeFileName(this.currentTest.fullTitle());
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = `${timestamp}_${testName}`;
    const screenshotPath = path.join(artifactsDir, `${prefix}.png`);
    const htmlPath = path.join(artifactsDir, `${prefix}.html`);

    try {
      const screenshot = await ctx.driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, screenshot, 'base64');

      const pageSource = await ctx.driver.getPageSource();
      fs.writeFileSync(htmlPath, pageSource, 'utf8');

      addContext(this, {
        title: 'Screenshot',
        value: path.relative(process.cwd(), screenshotPath).replace(/\\/g, '/')
      });
      addContext(this, {
        title: 'Page source',
        value: path.relative(process.cwd(), htmlPath).replace(/\\/g, '/')
      });
    } catch (err) {
      // No interrumpe el test si falla la captura de evidencia.
    }
  });
}

module.exports = {
  dismissAlertIfPresent,
  normalizeText,
  registerSuiteHooks
};
