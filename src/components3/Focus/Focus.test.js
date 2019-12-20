import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import Focus from './';

it('validate that focus library exists in dom', () => {
  expect(window.SpatialNavigation).to.be.an('object');
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Focus />, div);
});

it('render with children', () => {
  const wrapper = shallow(<Focus><h1>Hello world</h1></Focus>);
  expect(wrapper.contains(<h1>Hello world</h1>)).to.equal(true);
});
