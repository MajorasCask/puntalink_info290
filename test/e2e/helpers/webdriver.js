const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function createChromeDriver() {
  const options = new chrome.Options();

  if (process.env.E2E_HEADFUL !== 'true') {
    options.addArguments('--headless=new');
  }

  options.addArguments('--window-size=1440,900');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--no-sandbox');
  options.addArguments('--lang=es-ES');

  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

module.exports = { createChromeDriver };
