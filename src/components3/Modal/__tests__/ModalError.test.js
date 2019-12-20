import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import ModalError from '../ModalError';

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <ModalError />
        </Focus>
    </Provider>
);

it('renders without crashing', () => {
    expect(wrapper);
});

it('should have one button', () => {
    const buttons = wrapper.find('.modal-button');
    expect(buttons.length == 1).toBe(true);
});

it('should have asset', () => {
    const content = wrapper.find('.modal-asset');
    expect(content.length == 1).toBe(true);
});

it('should have content', () => {
    const content = wrapper.find('.modal-content');
    expect(content.length == 1).toBe(true);
});

it('should have title', () => {
    const title = wrapper.find('.modal-title');
    expect(title.length == 1).toBe(true);
});
