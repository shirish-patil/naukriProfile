const path = require('path');
const { BasePage } = require('./BasePage');

// Handles navigating to the profile and re-uploading the resume,
// which bumps the "profile last updated" timestamp recruiters sort by.
class ProfilePage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://www.naukri.com/mnjuser/profile';

    // The hidden <input type=file> used by the "Update resume" widget.
    this.resumeFileInput = [
      '#attachCV',
      'input#attachCV',
      'input[type="file"][name="attachCV"]',
      'input[type="file"]'
    ];

    // Text that confirms the upload succeeded.
    this.successToast = [
      'text=/successfully/i',
      '.updateOn',                       // shows "Resume updated on <date>"
      'text=/resume has been successfully uploaded/i',
      'text=/uploaded successfully/i'
    ];
  }

  async open() {
    await this.goto(this.url);
    // Profile page is client-rendered; wait for the resume section anchor.
    await this.page.waitForTimeout(3000);
  }

  /** Confirm we actually landed on the profile page (session valid). */
  async isOnProfile() {
    return this.page.url().includes('/mnjuser/profile');
  }

  /**
   * Upload the resume file. Playwright can set files directly on the
   * hidden input without needing to click the visible button.
   * @param {string} cvPath absolute or project-relative path
   */
  async uploadResume(cvPath) {
    const absolute = path.isAbsolute(cvPath)
      ? cvPath
      : path.resolve(process.cwd(), cvPath);

    // Scroll toward the resume section so lazy-loaded widgets mount.
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await this.page.waitForTimeout(1500);

    const input = await this.firstPresent(this.resumeFileInput);
    await input.setInputFiles(absolute);

    // Naukri processes the upload asynchronously.
    await this.page.waitForTimeout(6000);
  }

  /** Returns true if a success indicator is visible after upload. */
  async isUploadSuccessful() {
    for (const sel of this.successToast) {
      const loc = this.page.locator(sel).first();
      try {
        if (await loc.isVisible()) return true;
      } catch (_) { /* ignore */ }
    }
    // Fallback: check the "updated on today" text in the resume header.
    const updatedText = this.page.locator('.lastUpdate, .updateOn, .resumeUpload').first();
    return (await updatedText.count()) > 0;
  }
}

module.exports = { ProfilePage };
