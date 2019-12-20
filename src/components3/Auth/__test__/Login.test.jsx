import React from 'react';
import { Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import Login from '../Login';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <Router history={history} >
                <Login history={history} />
            </Router>
        </Focus>
    </Provider>
);


it('renders without crashing', () => {
    expect(wrapper);
});

it('should have a keyboard', () => {
    const keyboard = wrapper.find('.keyboard');
    expect(keyboard.length == 1).toBe(true);
});

it('should have a title', () => {
    const title = wrapper.find('h1');
    expect(title.length == 1).toBe(true);
});

it('should have two buttons', () => {
    const buttons = wrapper.find('button');
    expect(buttons.length == 2).toBe(true);
});

it('should have one password fields', () => {
    const div = wrapper.find('.form-group-value-password');
    expect(div.length == 1).toBe(true);
});

it('should have password reminder', () => {
    const div = wrapper.find('.password-reminder');
    expect(div.length == 1).toBe(true);
});
