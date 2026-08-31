// Cucumber configuration. Run with `npm run update`.
module.exports = {
  default: {
    require: [
      'src/support/**/*.js',
      'src/steps/**/*.js'
    ],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'summary',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: { snippetInterface: 'async-await' },
    // Retry once on failure to ride out transient network/UI hiccups.
    retry: 1,
    // Default per-step timeout is set in src/support/world.js hooks.
  }
};
