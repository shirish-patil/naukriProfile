const { setWorldConstructor, World } = require('@cucumber/cucumber');

// Custom World: shared state passed to every step via `this`.
class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  log(msg) {
    const ts = new Date().toISOString();
    // Attaches to the Cucumber report AND prints to console.
    this.attach(`[${ts}] ${msg}`);
    // eslint-disable-next-line no-console
    console.log(`[${ts}] ${msg}`);
  }

  // Persist the current logged-in session so future runs skip login/2FA.
  async saveSession() {
    const storagePath = process.env.STORAGE_STATE || 'auth/storageState.json';
    await this.context.storageState({ path: storagePath });
    this.log(`Session saved to ${storagePath}`);
  }
}

setWorldConstructor(CustomWorld);
