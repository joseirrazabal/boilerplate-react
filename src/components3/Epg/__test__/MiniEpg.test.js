import React from 'react';
import { Router } from 'react-router-dom';
import { mount } from 'enzyme';
import Focus from '../../Focus';
import MiniEpg from '../MiniEpg';
import EpgGrid from '../index';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const wrapper = mount(
    <Focus>
        <Router history={history} >
            <MiniEpg history={history} />
        </Router>
    </Focus>
);


it('renders without crashing', () => {
    expect(wrapper);
});

it('should have a header', () => {
    const header = wrapper.find('.mini-epg-header');
    expect(header.length == 1).toBe(true);
});

it('should have a Epg wrapper', () => {
    const div = wrapper.find('.epg-wrapper');
    expect(div.length == 1).toBe(true);
});

it('should have color codes', () => {
    const div = wrapper.find('.color-codes');
    expect(div.length == 1).toBe(true);
});
