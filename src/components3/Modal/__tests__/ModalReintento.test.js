import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import ModalReintento from '../ModalReintento';

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <ModalReintento />
        </Focus>
    </Provider>
);

it('renders without crashing', () => {
    expect(wrapper);
});

it('should have two buttons', () => {
    const buttons = wrapper.find('.modal-button');
    expect(buttons.length == 2).toBe(true);
});

it('should have content', () => {
    const content = wrapper.find('.modal-content');
    expect(content.length == 1).toBe(true);
});

it('should have title', () => {
    const title = wrapper.find('.modal-title');
    expect(title.length == 1).toBe(true);
});
