import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router'
import Card from './';
import focusSetting from './../Focus/settings';

const cover = 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg';

it('render card without required properties', () => {
  const indexRequiredMsg = 'Warning: Failed prop type: The prop `index` is marked as required in `Card`, but its value is `undefined`.\n    in Card (at Card.test.js:17)';
  const coverRequiredMsg = 'Warning: Failed prop type: The prop `cover` is marked as required in `Card`, but its value is `undefined`.\n    in Card (at Card.test.js:17)';
  const nodeIdRequiredMsg = 'Warning: Failed prop type: The prop `group_id` is marked as required in `Card`, but its value is `undefined`.\n    in Card (at Card.test.js:17)';
  const stub = sinon.stub(console, 'error');

  const wrapper = mount(<MemoryRouter><Card /></MemoryRouter>);

  expect(stub.calledWithExactly(indexRequiredMsg)).to.equal(true);

  wrapper.setProps({ index: 962 });

  expect(stub.calledWithExactly(coverRequiredMsg)).to.equal(true);

  wrapper.setProps({ cover });

  expect(stub.calledWithExactly(nodeIdRequiredMsg)).to.equal(true);

  console.error.restore();
});

it('render card only with required properties (index, image)', () => {
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" />);
  expect(wrapper.contains(<img className="card-cover" src={ cover } alt="cover" />)).to.equal(true);
});

it('testing if the component have focusable class name', () => {
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" />);
  expect(wrapper.find(focusSetting.selector)).to.have.length(1);
});

it('render card with title', () => {
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" title="title demo" />);
  const title = <div className="card-title">title demo</div>;
  expect(wrapper.contains(title)).to.equal(true);
});

it('render card with label', () => {
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" label="label demo" />);
  const label = <div className="card-label">label demo</div>;
  expect(wrapper.contains(label)).to.equal(true);
});

it('render card with custom class name', () => {
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" className="custom-class-name" />);
  expect(wrapper.find('.custom-class-name')).to.have.length(1);
});

it('render card with invalid type property', () => {
  const invalidType = 'Warning: Failed prop type: Invalid prop `type` of value `invalid` supplied to `Card`, expected one of ["portrait","landscape","highlight","user-profile","cd","channel","infinite", "circle"].\n    in Card (at Card.test.js:63)';
  const stub = sinon.stub(console, 'error');

  mount(<MemoryRouter><Card index={962} cover={cover} group_id="123" type="invalid" /></MemoryRouter>);

  expect(stub.calledWithExactly(invalidType)).to.equal(true);

  console.error.restore();
});

it('render card with defined type', () => {
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" />);
  expect(wrapper.find('.landscape')).to.have.length(1);

  wrapper.setProps({ type: 'portrait' });
  expect(wrapper.find('.portrait')).to.have.length(1);
});

it('render card with badges aligned to left', () => {
  const align = 'left';
  const badges = [{type: 'text', label: 'demo'}];
  const wrapper = render(<MemoryRouter><Card index={962} cover={cover} group_id="123" badgesAlign={align} badges={badges} /></MemoryRouter>);

  expect(wrapper.find('.badge-container.left').length).to.equal(1);
  expect(wrapper.find('.badge-text').length).to.equal(1);
  expect(wrapper.find('.badge-text').text()).to.contain('demo');
});

it('render card with badges aligned to right', () => {
  const align = 'right';
  const badges = [{type: 'text', label: 'demo'}];
  const wrapper = render(<MemoryRouter><Card index={962} cover={cover} group_id="123" badgesAlign={align} badges={badges} /></MemoryRouter>);

  expect(wrapper.find('.badge-container.right').length).to.equal(1);
  expect(wrapper.find('.badge-text').length).to.equal(1);
  expect(wrapper.find('.badge-text').text()).to.contain('demo');
});

it('render card with ribbon behavior', () => {
  const id = 'first-item';
  const wrapper = mount(<MemoryRouter><Card index={962} cover={cover} group_id="123" id={id} ribbon={true} firstItem={true}/></MemoryRouter>);

  expect(wrapper.find('#first-item').length).to.equal(1);
  expect(wrapper.find(`[data-sn-left]`).length).to.equal(1);
  expect(wrapper.find('[data-sn-left]').html().indexOf(`data-sn-left="#${id}"`) >= 0).to.equal(true);
  expect(wrapper.find(`[data-sn-right]`).length).to.equal(1);
  expect(wrapper.find('[data-sn-right]').html().indexOf(`data-sn-right="#${id}"`) >= 0).to.equal(true);
});

it('with href property', () => {
  const wrapper = mount(<MemoryRouter><Card index={962} cover={cover} group_id="123" href="/uri/demo" /></MemoryRouter>);
  expect(wrapper.find('[href="/uri/demo"]').html().indexOf('/uri/demo') >= 0).to.equal(true);
});

it('with sibling', () => {
  const card = {
    index: 0,
    cover: cover,
    group_id: '012',
    sibling: cover
  };

  const wrapper = mount(<MemoryRouter><Card {...card} /></MemoryRouter>);
  const sibling = wrapper.find('.card.double .placeholder-container .card-cover');
  expect(sibling.length).to.equal(1);
});

it('clickHandler test', () => {
  const onClick = sinon.spy();
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" clickHandler={onClick}/>);
  wrapper.find('.focusable').simulate('click');

  expect(onClick).to.have.property('callCount', 1);
});

it('focusHandler test', () => {
  const onFocus = sinon.spy();
  const wrapper = shallow(<Card index={962} cover={cover} group_id="123" focusHandler={onFocus}/>);
  wrapper.find('.focusable').simulate('focus');

  expect(onFocus).to.have.property('callCount', 1);
});

it('onLoadHandler test', () => {
  const onLoad = sinon.spy();
  mount(<MemoryRouter><Card index={962} cover={cover} group_id="123" onLoadHandler={onLoad}/></MemoryRouter>);

  expect(onLoad).to.have.property('callCount', 1);
});
