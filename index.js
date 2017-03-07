/* jshint node: true */
'use strict';

const Funnel = require('broccoli-funnel');
const chalk  = require('chalk');

// We import these to merge the instrumentation options into the base classes
// we do this instead of overriding the core commands because other high profile
// addons such as ember-cordova, ember-cli-nwjs, and ember-electron have had to override
const serveCommand = require('ember-cli/lib/commands/serve');
const buildCommand = require('ember-cli/lib/commands/build');
const testCommand = require('ember-cli/lib/commands/test');

function hasOption(options, name) {
  for (let i = 0, l = options.length; i < l; i++) {
    if (options[i].name === name) {
      return true;
    }
  }
  return false;
}

function patchCommand(command, newOption) {
  const options = command.prototype.availableOptions;

  if (!hasOption(options, newOption.name)) {
    options.push(newOption);
  }
}

function assert(msg, test) {
  if (!test) {
    throw new Error(msg);
  }
}

module.exports = {
  name: 'ember-heimdall',

  _isInstrumented: null,
  isInstrumented: function() {
    if (this._isInstrumented !== null) {
      return this._isInstrumented;
    }

    let INSTRUMENT_HEIMDALL = process.argv.indexOf('--instrument') !== -1;

    if (INSTRUMENT_HEIMDALL) {
      this.ui.writeLine(chalk.yellow(
          'Heimdall.js will be included in your build output and instrumentation will not be stripped.'
        ));
    }

    this._isInstrumented = INSTRUMENT_HEIMDALL;
    return INSTRUMENT_HEIMDALL;
  },

  includedCommands: function() {
    patchCommand(serveCommand, { name: 'instrument', type: Boolean, default: false });
    patchCommand(buildCommand, { name: 'instrument', type: Boolean, default: false });
    patchCommand(testCommand, { name: 'instrument', type: Boolean, default: false });
  },

  included: function() {
    if (this.isInstrumented()) {
      assert(`Cannot use ember-heimdall with this version of ember-cli`, typeof this.import === 'function');

      this.import('vendor/heimdalljs/heimdalljs.iife.js', { prepend: true });
    }
  },

  treeForVendor: function() {
    if (this.isInstrumented()) {
      var heimdallTree = new Funnel('node_modules/heimdalljs/dist', {
        destDir: 'heimdalljs'
      });

      return heimdallTree;
    }
  },

  isDevelopingAddon: function() {
    return false;
  }
};
