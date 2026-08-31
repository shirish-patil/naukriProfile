const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const fs = require('fs');
const { LoginPage } = require('../pages/LoginPage');
const { ProfilePage } = require('../pages/ProfilePage');

Given('I have a valid Naukri session', async function () {
  // The browser context was created in hooks.js with the saved storageState
  // if it exists. If not (or it expired), log in fresh using .env credentials.
  this.loginPage = new LoginPage(this.page);
  this.profilePage = new ProfilePage(this.page);

  await this.profilePage.open();

  if (!(await this.profilePage.isOnProfile())) {
    this.log('No valid session detected — logging in with credentials from .env');
    const email = process.env.NAUKRI_EMAIL;
    const password = process.env.NAUKRI_PASSWORD;
    assert(email && password, 'NAUKRI_EMAIL and NAUKRI_PASSWORD must be set in .env');

    await this.loginPage.login(email, password);
    assert(await this.loginPage.isLoggedIn(), 'Login failed — check credentials or complete 2FA once via `npm run login`');

    // Persist the fresh session for next time.
    await this.saveSession();
  } else {
    this.log('Existing session is valid — skipping login');
  }
});

When('I navigate to the Naukri homepage', async function () {
  await this.profilePage.goto('https://www.naukri.com/');
});

When('I open the profile section', async function () {
  await this.profilePage.open();
  assert(await this.profilePage.isOnProfile(), 'Could not reach the profile page');
});

When('I upload my CV from the configured location', async function () {
  const cvPath = process.env.CV_PATH || 'cv/resume.pdf';
  assert(fs.existsSync(cvPath), `CV file not found at "${cvPath}". Add your resume and set CV_PATH in .env`);
  await this.profilePage.uploadResume(cvPath);
});

Then('the profile should be updated successfully', async function () {
  const ok = await this.profilePage.isUploadSuccessful();
  assert(ok, 'Could not confirm the resume upload succeeded — see screenshot in screenshots/');
  this.log('Profile updated successfully.');
});
