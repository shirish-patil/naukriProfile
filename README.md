# Naukri Auto-Update

Automatically refresh your Naukri.com profile every day by re-uploading your resume — which bumps your "profile last updated" timestamp so you rank higher in recruiter searches.

Built with **Playwright + Cucumber (BDD)** using the **Page Object Model**.

## How it works

1. Reuses a saved login session (`auth/storageState.json`) so it does **not** need your password or 2FA on every run.
2. Navigates to Naukri, opens your profile.
3. Re-uploads the CV stored in this project.
4. Verifies the update succeeded (screenshot saved on any failure).

## Project structure

```
naukriProfile/
├── features/
│   └── update-profile.feature        # BDD scenario (Gherkin)
├── src/
│   ├── pages/                        # Page Object Model
│   │   ├── BasePage.js
│   │   ├── LoginPage.js
│   │   └── ProfilePage.js
│   ├── steps/
│   │   └── update-profile.steps.js   # Step definitions
│   └── support/
│       ├── world.js                  # Shared context
│       └── hooks.js                  # Browser + session lifecycle
├── scripts/
│   └── setup-session.js              # One-time login helper (npm run login)
├── cv/                               # Put your resume here
├── auth/                             # Saved session (auto-created)
├── reports/                          # HTML/JSON test reports
├── screenshots/                      # Failure screenshots
├── logs/                             # Daily run logs
├── run-daily.sh                      # Scheduler wrapper
├── com.shirish.naukri-update.plist   # macOS daily schedule
├── cucumber.js
├── package.json
└── .env                              # Your secrets (create from .env.example)
```

## Setup (one time)

Requires Node.js 18+.

```bash
# 1. Install dependencies + the Chromium browser
npm install
npx playwright install chromium

# 2. Configure your details
cp .env.example .env
#    then edit .env:  NAUKRI_EMAIL, NAUKRI_PASSWORD, CV_PATH

# 3. Add your resume
#    Put resume.pdf (or .docx) into the cv/ folder and make sure
#    CV_PATH in .env points to it.

# 4. Create your saved login session (opens a browser once).
#    Log in, complete any OTP/2FA, then press ENTER in the terminal.
npm run login
```

## Run it manually

```bash
npm run update           # headless (normal daily mode)
npm run update:headed    # watch the browser do it
```

An HTML report is written to `reports/cucumber-report.html`.

## Schedule it daily (macOS)

The included `launchd` job runs it every day at 9:30 AM.

```bash
# Edit the time inside com.shirish.naukri-update.plist if you like (Hour/Minute).
cp com.shirish.naukri-update.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.shirish.naukri-update.plist
```

Check it's registered:

```bash
launchctl list | grep naukri
```

To stop it:

```bash
launchctl unload ~/Library/LaunchAgents/com.shirish.naukri-update.plist
```

Daily output goes to `logs/run.log`.

### ⚠️ Crucial Path Adjustments for Daily Scheduling
If you clone this project, you **must** update the absolute paths in the scheduler files to match your own macOS user and directory structure:

1. **In `com.shirish.naukri-update.plist`:**
   * Replace all occurrences of `/Users/shri/personalProjects/naukriProfile/` with your own absolute project directory path (e.g., `/Users/yourusername/path/to/naukriProfile/`).
2. **In `run-daily.sh`:**
   * Update the `PROJECT_DIR` variable to your cloned repository path.
   * Update the `export PATH` line to point to your local Node installation path (e.g., if you use NVM, point to your active Node version binary folder so `npm` can run in the headless launchd environment).

> Prefer cron? Add this line via `crontab -e` (runs 9:30 AM daily, adjusting the path to your script):
> `30 9 * * * /path/to/your/naukriProfile/run-daily.sh`

## About "never fails"

The framework is built to be robust — session reuse, retry-once, multiple fallback selectors, waits, and failure screenshots. But two things are outside its control:

- **Session expiry.** Naukri sessions last a while but eventually expire. When that happens, a run will fail and you just re-run `npm run login` once. (Tip: run `npm run login` every few weeks proactively.)
- **Naukri UI changes.** If they redesign the profile page, selectors in `src/pages/ProfilePage.js` may need a small update.

When a run fails, look at the latest screenshot in `screenshots/` and the tail of `logs/run.log` — the cause is almost always one of the two above.

## Security note

Your credentials live only in `.env` (git-ignored). The saved session in `auth/` is also git-ignored. Never commit these.
