class ConsoleReporter {
  constructor(options = {}) {
    this.options = options;
    this.consoleLogs = {};
  }

  onBegin(config, suite) {
    console.log('Starting tests with console log capture...');
  }

  onTestBegin(test) {
    this.consoleLogs[test.title] = [];
  }

  onConsoleMessage(test, message) {
    if (!this.consoleLogs[test.title]) {
      this.consoleLogs[test.title] = [];
    }
    this.consoleLogs[test.title].push({
      type: message.type(),
      text: message.text(),
      timestamp: new Date().toISOString()
    });
  }

  onTestEnd(test, result) {
    if (this.consoleLogs[test.title]?.length) {
      console.log(`\n--- Console logs for "${test.title}" ---`);
      this.consoleLogs[test.title].forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
      console.log('--- End of console logs ---\n');
    }
  }

  onEnd(result) {
    // Generate a JSON report of all console logs
    const fs = require('fs');
    const path = require('path');
    
    const reportDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportDir, 'console-logs.json'),
      JSON.stringify(this.consoleLogs, null, 2)
    );
    
    console.log(`Console logs report saved to ${path.join(reportDir, 'console-logs.json')}`);
  }
}

module.exports = ConsoleReporter;
