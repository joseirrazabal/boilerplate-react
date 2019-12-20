import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router'
import { expect } from 'chai';
import { mount } from 'enzyme';
import { SpecialRibbon } from '../index';

const sibling = {
  index: 0,
  cover: 'https://clarovideocdn1-a.akamaihd.net/PELICULAS/SPIDERMAN2002/EXPORTACION_WEB/SS/SPIDERMAN2002_v-200x300.jpg',
  group_id: '012',
};
const regular = [
  {
    index: 0,
    cover: 'https://clarovideocdn3-a.akamaihd.net/PELICULAS/SPIDERMAN22004/EXPORTACION_WEB/SS/SPIDERMAN22004_h-675x380.jpg',
    group_id: '012',
    sibling: null
  },
  {
    index: 1,
    cover: 'https://clarovideocdn3-a.akamaihd.net/PELICULAS/ATONEMENT/EXPORTACION_WEB/SS/ATONEMENT_h-675x380.jpg',
    group_id: '123',
    sibling: null
  },
  {
    index: 2,
    cover: 'https://clarovideocdn0-a.akamaihd.net/SERIES/GUARDIANSOFTHEGALAXY-01-01-00/EXPORTACION_WEB/SS/GUARDIANSOFTHEGALAXY-01-01-00_h-675x380.jpg',
    group_id: '234',
    sibling: null
  },
  {
    index: 3,
    cover: 'https://clarovideocdn0-a.akamaihd.net/HBO/SERIES/GAMEOFTHRONES-07-07-00/EXPORTACION_WEB/SS/GAMEOFTHRONES-07-07-00_h-675x380.jpg',
    group_id: '345',
    sibling: null
  },
  {
    index: 4,
    cover: 'https://clarovideocdn6-a.akamaihd.net/FOX/SERIES/THEWHITEPRINCESS-01-01-00/EXPORTACION_WEB/SS/THEWHITEPRINCESS-01-01-00_h-675x380.jpg',
    group_id: '456',
    sibling: null
  }
];
const oneToOne = [
  {
    index: 0,
    cover: 'https://clarovideocdn3-a.akamaihd.net/PELICULAS/SPIDERMAN22004/EXPORTACION_WEB/SS/SPIDERMAN22004_h-675x380.jpg',
    group_id: '012',
    sibling: 'https://clarovideocdn1-a.akamaihd.net/PELICULAS/SPIDERMAN2002/EXPORTACION_WEB/SS/SPIDERMAN2002_v-200x300.jpg'
  },
  {
    index: 1,
    cover: 'https://clarovideocdn3-a.akamaihd.net/PELICULAS/ATONEMENT/EXPORTACION_WEB/SS/ATONEMENT_h-675x380.jpg',
    group_id: '123',
    sibling: 'https://clarovideocdn0-a.akamaihd.net/SERIES/GUARDIANSOFTHEGALAXY-01-01-00/EXPORTACION_WEB/SS/GUARDIANSOFTHEGALAXY-01-01-00_v-200x300.jpg'
  },
  {
    index: 2,
    cover: 'https://clarovideocdn0-a.akamaihd.net/SERIES/GUARDIANSOFTHEGALAXY-01-01-00/EXPORTACION_WEB/SS/GUARDIANSOFTHEGALAXY-01-01-00_h-675x380.jpg',
    group_id: '234',
    sibling: 'https://clarovideocdn3-a.akamaihd.net/PELICULAS/HANNA2011/EXPORTACION_WEB/SS/HANNA2011_v-200x300.jpg'
  },
  {
    index: 3,
    cover: 'https://clarovideocdn0-a.akamaihd.net/HBO/SERIES/GAMEOFTHRONES-07-07-00/EXPORTACION_WEB/SS/GAMEOFTHRONES-07-07-00_h-675x380.jpg',
    group_id: '345',
    sibling: 'https://clarovideocdn0-a.akamaihd.net/HBO/SERIES/GAMEOFTHRONES-07-07-00/EXPORTACION_WEB/SS/GAMEOFTHRONES-07-07-00_v-200x300.jpg'
  },
  {
    index: 4,
    cover: 'https://clarovideocdn6-a.akamaihd.net/FOX/SERIES/THEWHITEPRINCESS-01-01-00/EXPORTACION_WEB/SS/THEWHITEPRINCESS-01-01-00_h-675x380.jpg',
    group_id: '456',
    sibling: 'https://clarovideocdn2-a.akamaihd.net/FOX/SERIES/FALSEFLAG-01-01-00/EXPORTACION_WEB/SS/FALSEFLAG-01-01-00_v-200x300.jpg'
  }
];

it('regular without title', () => {
  const wrapper = mount(<MemoryRouter><SpecialRibbon items={regular} /></MemoryRouter>);

  const title = wrapper.find('.special-ribbon .special-ribbon-title');
  const ribbon = wrapper.find('.special-ribbon .ribbon');

  expect(title.length).to.equal(0);
  expect(ribbon.length).to.equal(1);
});

it('regular with title', () => {
  const wrapper = mount(<MemoryRouter><SpecialRibbon title="title" items={regular} /></MemoryRouter>);

  const title = wrapper.find('.special-ribbon .special-ribbon-title');
  const ribbon = wrapper.find('.special-ribbon .ribbon');

  expect(title.length).to.equal(1);
  expect(ribbon.length).to.equal(1);
});

it('one to one', () => {
  const wrapper = mount(<MemoryRouter><SpecialRibbon title="Ribbon one to one" items={oneToOne} /></MemoryRouter>);

  const title = <div className="special-ribbon-title">Ribbon one to one</div>;
  const ribbon = wrapper.find('.special-ribbon .ribbon');
  const cards = wrapper.find('.card.double');

  expect(wrapper.contains(title)).to.equal(true);
  expect(ribbon.length).to.equal(1);
  expect(cards.length).to.equal(4);
});

it('one to many', () => {
  const wrapper = mount(<MemoryRouter><SpecialRibbon title="Ribbon one to many" sibling={sibling} items={regular} /></MemoryRouter>);

  const title = <div className="special-ribbon-title">Ribbon one to many</div>;
  const siblingC = wrapper.find('.special-ribbon .special-ribbon-sibling');
  const ribbon = wrapper.find('.special-ribbon .ribbon');

  expect(wrapper.contains(title)).to.equal(true);
  expect(siblingC.length).to.equal(1);
  expect(ribbon.length).to.equal(1);
});
