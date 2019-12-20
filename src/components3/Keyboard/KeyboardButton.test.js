import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import sinon from 'sinon';
import KeyboardButton from './KeyboardButton';
import focusSetting from './../Focus/settings';

it('render button without required properties', () => {
  const onClickRequiredMsg = 'Warning: Failed prop type: The prop `onClick` is marked as required in `KeyboardButton`, but its value is `undefined`.\n    in KeyboardButton (at KeyboardButton.test.js:13)';
  const valueRequiredMsg = 'Warning: Failed prop type: The prop `onClick` is marked as required in `KeyboardButton`, but its value is `undefined`.\n    in KeyboardButton (at KeyboardButton.test.js:13)';
  const stub = sinon.stub(console, 'error');

  const wrapper = mount(<KeyboardButton />);

  expect(stub.calledWithExactly(onClickRequiredMsg)).to.equal(true);

  wrapper.setProps({ onClick: () => {} });

  expect(stub.calledWithExactly(valueRequiredMsg)).to.equal(true);

  console.error.restore();
});

it('render button only with required properties (value, onClick)', () => {
  const wrapper = shallow(<KeyboardButton value="Hello world" onclick={() => {}} />);
  expect(wrapper.contains("Hello world")).to.equal(true);
});

it('testing if the component have focusable class name', () => {
  const wrapper = shallow(<KeyboardButton value="Hello world" onclick={() => {}} />);
  expect(wrapper.find(focusSetting.selector)).to.have.length(1);
});

it('render with text value', () => {
  const wrapper = shallow(<KeyboardButton value="Button text" onclick={() => {}} />);
  expect(wrapper.contains("Button text")).to.equal(true);
});

it('render with node value', () => {
  const node = <img />;
  const wrapper = shallow(<KeyboardButton value={node} onclick={() => {}} />);
  expect(wrapper.contains(node)).to.equal(true);
});

it('render with custom class name', () => {
  const className = "demo-class";
  const wrapper = mount(<KeyboardButton className={className} value="" onclick={() => {}} />);
  expect(wrapper.node.props).to.have.property('className', className);
});

it('button disabled', () => {
  const wrapper = shallow(<KeyboardButton isDisabled={true} value="" onclick={() => {}} />);
  expect(wrapper.find(`.${focusSetting.nonfocusable}`)).to.have.length(1);
});

it('clickHandler test', () => {
  const onClick = sinon.spy();
  const wrapper = shallow(<KeyboardButton value="" onClick={onClick}/>);
  wrapper.find('.focusable').simulate('click');

  expect(onClick).to.have.property('callCount', 1);
});
