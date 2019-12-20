import './../__mocks__/setup';
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Epg from "./../index";

it('render with default props', () => {
  const wrapper = shallow(<Epg/>);
  expect(wrapper.find('.epg-main')).to.have.length(1);
  expect(wrapper.find('.epg-schedule')).to.have.length(1);
  expect(wrapper.find('.epg-schedule-container')).to.have.length(1);
  expect(wrapper.find('.epg-channels-container')).to.have.length(1);
  expect(wrapper.find('.epg-events-container')).to.have.length(1);
});
