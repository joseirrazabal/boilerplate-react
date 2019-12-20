import React from 'react';
import { Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import PasswordReminder from '../PasswordReminder';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <Router history={history} >
                <PasswordReminder history={history} />
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

it('should have a leyend', () => {
    const leyend = wrapper.find('p');
    expect(leyend.length == 1).toBe(true);
});

it('should have two buttons', () => {
    const buttons = wrapper.find('button');
    expect(buttons.length == 2).toBe(true);
});

it('should have two text fields', () => {
    const div = wrapper.find('.form-group-value-text');
    expect(div.length == 2).toBe(true);
});


it('should have a captcha img', () => {
    const img = wrapper.find('.captcha img');
    expect(img.length == 1).toBe(true);
});

it('should have a refresh captcha button', () => {
    const refreshCaptcha = wrapper.find('.captcha .icon-refresh');
    expect(refreshCaptcha.length == 1).toBe(true);
});
