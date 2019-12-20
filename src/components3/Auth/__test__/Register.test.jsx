import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import Register from '../Register';

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <Register />
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

it('should have one button', () => {
    const buttons = wrapper.find('button');
    expect(buttons.length == 1).toBe(true);
});

it('should have one checkbox', () => {
    const div = wrapper.find('.form-group-value-checkbox');
    expect(div.length == 1).toBe(true);
});

it('should have two password fields', () => {
    const div = wrapper.find('.form-group-value-password');
    expect(div.length == 2).toBe(true);
});

it('should have three text fields', () => {
    const div = wrapper.find('.form-group-value-text');
    expect(div.length == 4).toBe(true);
});

it('should have secure text', () => {
    const div = wrapper.find('.secure-msg');
    expect(div.length == 1).toBe(true);
});
