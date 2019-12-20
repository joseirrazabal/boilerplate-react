import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import Badge from './';

it('render badge without required properties', () => {
  const stub = sinon.stub(console, 'error');
  mount(<Badge />);

  expect(stub.calledOnce).to.equal(true);
  expect(stub.calledWithExactly('Warning: Failed prop type: The prop `type` is marked as required in `Badge`, but its value is `undefined`.\n    in Badge (at Badge.test.js:9)')).to.equal(true);

  console.error.restore();
});

it('render simple text badge', () => {
  const wrapper = shallow(<Badge type="text" label="Hello" />);
  expect(wrapper.contains('Hello')).to.equal(true);
});

it('render text badge with styles', () => {
  const wrapper = mount(<Badge type="text" label="Hello" style={{backgroundColor: '#f00'}} />);
  expect(wrapper.props().style).to.deep.equal({backgroundColor: '#f00'});
});

it('render simple image badge', () => {
  const src = "https://clarovideocdn2-a.akamaihd.net/pregeneracion/cms/apa/531eed59e4b050ea818ae755/hbo_icon.png";
  const wrapper = shallow(<Badge type="image" src={src} />);
  expect(wrapper.contains(<img src={ src } alt="badge" />)).to.equal(true);
});

it('render image badge with styles', () => {
  const src = "https://clarovideocdn2-a.akamaihd.net/pregeneracion/cms/apa/531eed59e4b050ea818ae755/hbo_icon.png";
  const wrapper = mount(<Badge type="image" src={src} style={{width: '96px'}} />);
  expect(wrapper.contains(<img src={ src } alt="badge" />)).to.equal(true);
  expect(wrapper.props().style).to.deep.equal({width: '96px'});
});
