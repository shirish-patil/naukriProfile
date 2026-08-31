const { BasePage } = require('./BasePage');

// Handles logging into Naukri when no saved session exists (or it expired).
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://www.naukri.com/nlogin/login';

    // Multiple candidate selectors — Naukri changes these occasionally.
    this.emailInput = ['#usernameField', 'input[placeholder*="Email"]', 'input[type="text"][name="email"]'];
    this.passwordInput = ['#passwordField', 'input[type="password"]', 'input[placeholder*="password" i]'];
    this.loginButton = ['button[type="submit"]', 'button:has-text("Login")', '.loginButton'];
  }

  async open() {
    await this.goto(this.url);
  }

  async login(email, password) {
    await this.open();
    const emailEl = await this.firstVisible(this.emailInput);
    await emailEl.fill(email);

    const passEl = await this.firstVisible(this.passwordInput);
    await passEl.fill(password);

    const btn = await this.firstVisible(this.loginButton);
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded').catch(() => {}),
      btn.click()
    ]);

    // Give Naukri time to redirect to the logged-in dashboard.
    await this.page.waitForTimeout(4000);
  }

  /** True once we've reached a logged-in area (profile/homepage). */
  async isLoggedIn() {
    const url = this.page.url();
    if (url.includes('/mnjuser/') || url.includes('naukri.com/mynaukri')) return true;
    // Fallback: presence of the logged-in nav avatar.
    const avatar = this.page.locator('.nI-gNb-drawer__bars, .view-profile-wrapper, [title="My Naukri"]').first();
    return (await avatar.count()) > 0;
  }
}

module.exports = { LoginPage };
