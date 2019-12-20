import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import ModalPin from '../ModalPin';

const modalProps = {
    action: 'MP_CAMBIAR_STATUS',
    type: 'MP_STATUS_DESACTIVAR',
    callback: () => console.log('Ejecutando callback al cancelar ....'),
}

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <ModalPin {...modalProps} />
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

it('should have content', () => {
    const content = wrapper.find('.modal-content');
    expect(content.length == 1).toBe(true);
});

it('should have title', () => {
    const title = wrapper.find('.modal-title');
    expect(title.length == 1).toBe(true);
});

it('modal-children', () => {
    const title = wrapper.find('.modal-title');
    expect(title.length == 1).toBe(true);
});

