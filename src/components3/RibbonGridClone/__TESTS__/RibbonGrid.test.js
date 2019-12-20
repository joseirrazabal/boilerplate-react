import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import RibbonGrid from './../';

it('render only with required properties (url_ribbons)', () => {
  const wrapper = mount(<RibbonGrid url_ribbons={[]} />);
  expect(wrapper.find('.ribbongrid-wrapper')).to.have.length(1);
});
