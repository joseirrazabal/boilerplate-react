import '../../components/Epg/__mocks__/setup'
import { expect } from 'chai';
import sinon from 'sinon';

import AkamaiTracker from './AkamaiTracker';

it('Create a new instance', () => {
  const tracker = new AkamaiTracker();
  sinon.assert.match(tracker.plugin, null);
  sinon.assert.match(tracker.callbacks, {});
});


it('Create a new instance and get device id', () => {
  const tracker = new AkamaiTracker();
  console.error(tracker.getDeviceId());
});
