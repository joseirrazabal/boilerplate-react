import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import PlaylistDetailGrid from './../';

it('render only with required properties', () => {
  const wrapper = mount(<PlaylistDetailGrid />);
  expect(wrapper.find('.w_detail')).to.have.length(1);
});
