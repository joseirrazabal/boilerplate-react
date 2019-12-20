import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router'
import Special from './';


it('render Special without required properties', () => {

   const specialNameRequiredMsg = 'Warning: Failed prop type: The prop `specialName` is marked as required in `Special`, but its value is `undefined`.\n    in Special (at Special.test.js:15)';

   const stub = sinon.stub(console, 'error');

   const wrapper = mount(<MemoryRouter><Special /></MemoryRouter>);

   expect(stub.calledWithExactly(specialNameRequiredMsg)).to.equal(true);

   console.error.restore();
});

it('render only with required properties (items)', () => {
    const wrapper = mount(<MemoryRouter><Special specialName='' /></MemoryRouter>);
    expect(wrapper.find('.special')).to.have.length(1);
});


it('render only with required properties and contains Ribbon', () => {
    const wrapper = mount(<MemoryRouter><Special specialName='' /></MemoryRouter>);
    expect(wrapper.find('.ribbon-root')).to.have.length(1);
});
