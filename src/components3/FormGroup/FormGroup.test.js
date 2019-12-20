import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import FormGroup from './';
import focusSetting from './../Focus/settings';

it('render FormGroup without required properties', () => {
  const indexRequiredMsg = 'Warning: Failed prop type: The prop `id` is marked as required in `FormGroup`, but its value is `undefined`.\n    in FormGroup (at FormGroup.test.js:12)';
  const stub = sinon.stub(console, 'error');

  mount(<FormGroup />);

  expect(stub.calledWithExactly(indexRequiredMsg)).to.equal(true);

  console.error.restore();
});

it('render FormGroup only with required properties (id)', () => {
  const wrapper = shallow(<FormGroup id="demo-id" />);
  expect(wrapper.contains(<input type="text" id="demo-id" className="form-group-input" value=""/>)).to.equal(true);
});

it('testing if the component have focusable class name', () => {
  const wrapper = shallow(<FormGroup id="demo-id" />);
  expect(wrapper.find(focusSetting.selector)).to.have.length(1);
});

it('render FormGroup with custom class name', () => {
  const className = "demo-class";
  const wrapper = mount(<FormGroup id="demo-id" className={className} />);
  expect(wrapper.find(`.${className}`)).to.have.length(1);
});

it('render FormGroup with label', () => {
  const label = <div className="form-group-label">Hello world</div>;
  const wrapper = shallow(<FormGroup id="demo-id" label="Hello world"/>);
  expect(wrapper.contains(label)).to.equal(true);
});

it('render FormGroup with placeholder', () => {
  const placeholder = <div className="form-group-placeholder">Hello world</div>;
  const wrapper = shallow(<FormGroup id="demo-id" placeholder="Hello world"/>);
  expect(wrapper.contains(placeholder)).to.equal(true);
});

it('render FormGroup with value', () => {
  const value = <div className="form-group-text">Hello world</div>;
  const wrapper = shallow(<FormGroup id="demo-id" value="Hello world"/>);
  expect(wrapper.contains(value)).to.equal(true);

  // TODO test that input field have value
});

it('render FormGroup with message', () => {
  const message = <div className="form-group-msg">Hello world</div>;
  const wrapper = shallow(<FormGroup id="demo-id" message="Hello world"/>);
  expect(wrapper.contains(message)).to.equal(true);
});

it('onFocused test', () => {
  const onFocus = sinon.spy();
  const wrapper = shallow(<FormGroup id="demo-id" onFocused={onFocus}/>);

  wrapper.simulate('click');

  expect(onFocus).to.have.property('callCount', 1);
});

it('onChange test', () => {
  const onChange = sinon.spy();
  const wrapper = shallow(<FormGroup id="demo-id" onChange={onChange}/>);

  expect(onChange).to.have.property('callCount', 0);

  wrapper.setProps({ value: "hello world" });

  expect(onChange).to.have.property('callCount', 1);
});

