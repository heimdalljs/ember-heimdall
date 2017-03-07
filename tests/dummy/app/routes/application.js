/* global heimdall */
import Ember from 'ember';
import RSVP from 'rsvp';

const {
  Promise
} = RSVP;

const {
  Route
} = Ember;

function isTesting() {
  return Ember.testing;
}

export default Route.extend({
  model() {
    let token = heimdall.start('dummy:application-route:model');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ foo: 'bar' });
        heimdall.stop(token);
      }, isTesting() ? 0 : 160);
    });
  }
});
