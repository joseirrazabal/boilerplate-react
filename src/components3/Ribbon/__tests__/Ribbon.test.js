import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router'
import { expect } from 'chai';
import { mount } from 'enzyme';
import Ribbon from '../index';

const items = [
  { id: 0, group_id:"123", cover: 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg'},
  { id: 1, group_id:"234", cover: 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg'},
  { id: 2, group_id:"345", cover: 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg'},
  { id: 3, group_id:"456", cover: 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg'},
  { id: 4, group_id:"567", cover: 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg'},
  { id: 5, group_id:"678", cover: 'https://clarovideocdn7-a.akamaihd.net/FOX/PELICULAS/FOXFAMILY/EXPORTACION_WEB/SS/FOXFAMILY_h-290x163.jpg'},
];

it('render only with required properties (items)', () => {
  const wrapper = mount(<Ribbon items={[]} />);
  expect(wrapper.find('.ribbon')).to.have.length(1);
});

it('render with custom id', () => {
  const wrapper = mount(<Ribbon items={[]} id="id-demo" />);
  expect(wrapper.props().id).to.equal('id-demo');
});

it('render with custom class name', () => {
  const wrapper = mount(<Ribbon items={[]} className="class-name-demo" />);
  expect(wrapper.props().className).to.equal('class-name-demo');
});

it('render with type property', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Ribbon items={[]} type="highlight" />, div);
});

it('render with title property', () => {
  const wrapper = mount(<Ribbon items={[]} title="Title" />);
  const title = <div className="ribbon-title">Title</div>;
  expect(wrapper.contains(title)).to.equal(true);
});

it('render with arrows property', () => {
  const wrapper = mount(<Ribbon items={[]} arrows={true} />);
  expect(wrapper.find('.ribbon-arrow-left').length).to.equal(1);
  expect(wrapper.find('.ribbon-arrow-right').length).to.equal(1);
});

it('render with items and visibleNumber property', () => {
  const wrapper = mount(<MemoryRouter><Ribbon items={items} visibleNumber={3} /></MemoryRouter>);
  expect(wrapper.find('.card').length).to.equal(3);
});
