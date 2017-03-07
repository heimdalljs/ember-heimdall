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

function patchCommand(command, newOption) {
  command.prototype.availableOptions.push(newOption);
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

    let INSTRUMENT_HEIMDALL = false;
    let args = process.argv;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--instrument') {
        INSTRUMENT_HEIMDALL = true;
        break;
      }
    }

    if (INSTRUMENT_HEIMDALL) {
      this.ui.writeln(chalk.yellow(
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
