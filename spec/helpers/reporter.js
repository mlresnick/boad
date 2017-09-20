/* eslint-env jasmine */

'use strict';

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.getEnv().clearReporters(); // remove default reporter logs
// add jasmine-spec-reporter
jasmine.getEnv().addReporter(new SpecReporter({
  spec: { displayPending: true, displayStacktrace: true },
}));
