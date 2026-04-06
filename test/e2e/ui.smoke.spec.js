const path = require('path');
const fs = require('fs');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const addContext = require('mochawesome/addContext');
const { createChromeDriver } = require('./helpers/webdriver');
const { createStaticServer } = require('./helpers/staticServer');
const { createMockApiServer } = require('./helpers/mockApiServer');

const artifactsDir = path.resolve(__dirname, '../artifacts/e2e');

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

describe('Frontend e2e auth y proyectos', function () {
  this.timeout(60000);

  const frontendPublicDir = path.resolve(__dirname, '../../frontend/public');

  let staticServer;
  let apiServer;
  let driver;
  let baseUrl;

  before(async function () {
    ensureArtifactsDir();
    apiServer = createMockApiServer();
    await apiServer.listen(4008);

    const requestedPort = Number(process.env.E2E_PORT || 3010);
    staticServer = createStaticServer(frontendPublicDir);
    const effectivePort = await staticServer.listen(requestedPort);
    baseUrl = process.env.E2E_BASE_URL || `http://localhost:${effectivePort}`;

    driver = await createChromeDriver();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
    if (staticServer) {
      await staticServer.close();
    }
    if (apiServer) {
      await apiServer.close();
    }
  });

  beforeEach(async function () {
    apiServer.reset();
    await dismissAlertIfPresent(driver);
    await driver.get(`${baseUrl}/index.html`);
    await dismissAlertIfPresent(driver);
    await driver.manage().deleteAllCookies();
    await driver.executeScript('try { window.localStorage.clear(); window.sessionStorage.clear(); } catch (e) {}');
    await dismissAlertIfPresent(driver);
  });

  afterEach(async function () {
    if (!driver) return;

    const shouldCapture = this.currentTest.state === 'failed' || process.env.E2E_CAPTURE_ALL === 'true';
    if (!shouldCapture) return;

    const testName = safeFileName(this.currentTest.fullTitle());
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = `${timestamp}_${testName}`;
    const screenshotPath = path.join(artifactsDir, `${prefix}.png`);
    const htmlPath = path.join(artifactsDir, `${prefix}.html`);

    try {
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, screenshot, 'base64');

      const pageSource = await driver.getPageSource();
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

  it('inicia sesion correctamente', async function () {
    await driver.get(`${baseUrl}/index.html`);

    const activateButton = await driver.wait(until.elementLocated(By.id('craneActivate')), 10000);
    await activateButton.click();

    const loginForm = await driver.wait(until.elementLocated(By.id('loginForm')), 10000);
    await driver.wait(async () => {
      const className = await loginForm.getAttribute('class');
      return className.includes('active');
    }, 10000);

    const buttonText = await activateButton.getText();
    expect(normalizeText(buttonText)).to.include('GRUA ACTIVA');

    await driver.executeScript("window.onGoogleCredential({ credential: 'fake-google-token' });");
    await dismissAlertIfPresent(driver);

    await driver.wait(async () => {
      const display = await driver.executeScript(
        "return window.getComputedStyle(document.getElementById('mainContent')).display;"
      );
      return display !== 'none';
    }, 10000);
    await dismissAlertIfPresent(driver);

    const userEmail = await driver.findElement(By.id('userEmail')).getText();
    expect(userEmail).to.equal('e2e@puntalink.local');
  });

  it('carga un proyecto desde la lista', async function () {
    apiServer.login();
    await driver.get(`${baseUrl}/index.html`);
    await dismissAlertIfPresent(driver);

    await driver.executeAsyncScript(
      "const done = arguments[0];" +
      "import('./js/index.js').then((m) => m.loadProjectById('u-e2e-1', 101)).then(() => done(true)).catch((e) => done(String(e)));"
    );

    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/dashboard.html');
    }, 10000);

    const projectConfig = await driver.executeScript(
      "return JSON.parse(window.localStorage.getItem('projectConfig') || '{}');"
    );
    expect(projectConfig.pid).to.equal(101);
    expect(projectConfig.nombre).to.equal('Proyecto E2E Base');
  });

  it('crea un proyecto nuevo', async function () {
    apiServer.login();
    await driver.get(`${baseUrl}/index.html`);
    await dismissAlertIfPresent(driver);

    await driver.findElement(By.id('nombreProyecto')).sendKeys('Proyecto Automatizado');
    await driver.findElement(By.id('empresaConstructora')).sendKeys('Empresa QA');
    await driver.findElement(By.id('ubicacionProyecto')).sendKeys('Valparaiso');
    await driver.findElement(By.id('velViento')).sendKeys('125');
    await driver.findElement(By.id('tempPromedio')).sendKeys('22');
    await driver.findElement(By.id('presionAtm')).sendKeys('760');

    const submitButton = await driver.findElement(By.id('btnProjectSubmit'));
    await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', submitButton);
    await driver.executeScript('arguments[0].click();', submitButton);

    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/dashboard.html');
    }, 10000);

    const projectConfig = await driver.executeScript(
      "return JSON.parse(window.localStorage.getItem('projectConfig') || '{}');"
    );

    expect(projectConfig.nombre).to.equal('Proyecto Automatizado');
    expect(projectConfig.empresa).to.equal('Empresa QA');
    expect(projectConfig.ubicacion).to.equal('Valparaiso');
  });

  it('carga dashboard y renderiza el bloque principal', async function () {
    await driver.get(`${baseUrl}/dashboard.html`);

    await driver.wait(until.elementLocated(By.id('projectNameHeader')), 10000);

    const heading = await driver.findElement(By.id('projectNameHeader')).getText();
    const uploadButton = await driver.findElement(By.id('btnUploadTxt')).getText();

    expect(normalizeText(heading)).to.equal('Informacion del Proyecto');
    expect(uploadButton.toLowerCase()).to.include('subir y procesar txt');
  });
});
