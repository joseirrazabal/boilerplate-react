import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import ModalGeneric from '../ModalGeneric';

const buttons = [
    {
        content: '1',
        props: {
            onClick: () => { }
        }
    },
    {
        content: '2',
        props: {
            onClick: () => { }
        }
    }
];
const modalProps = {
    buttons,
    buttonsAlign: 'vertical'
};


const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <ModalGeneric {...modalProps} />
        </Focus>
    </Provider>
);

it('renders without crashing', () => {
    expect(wrapper);
});

it('has at least one button', () => {
    const buttons = wrapper.find('.modal-button');
    expect(buttons.length >= 1).toBe(true);
});

it('should have two buttons', () => {
    const buttons = wrapper.find('.modal-button');
    expect(buttons.length == 2).toBe(true);
});

it('should not have content', () => {
    const content = wrapper.find('.modal-content');
    expect(content.length == 1).toBe(false);
});

it('should not have title', () => {
    const title = wrapper.find('.modal-title');
    expect(title.length == 0).toBe(true);
});
