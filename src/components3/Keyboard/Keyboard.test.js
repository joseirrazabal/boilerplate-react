import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import Focus from './../Focus';
import Keyboard from './Keyboard';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const input = <div>Hello</div>;
  ReactDOM.render(<Keyboard inputNode={input}/>, div);
});

it('has buttons', () => {
  const input = <div>Hello</div>;
  const wrapper = mount(<Keyboard inputNode={input} />);
  const btnsLength = wrapper.find('.kbd-btn.focusable.keyboard-letter').length;

  expect(btnsLength > 0);
});

it('change layout', () => {
  const input = <div>Hello</div>;
  const wrapper = mount(<Focus><Keyboard inputNode={input} /></Focus>);

  wrapper.find('.kbd-btn.keyboard-layouts-first').simulate('click');
  const firstLetter = wrapper.find('.kbd-btn.focusable.keyboard-letter');

  expect(firstLetter.first().props().children).to.equal('A');
});
