import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../../store'
import Focus from '../../Focus';
import ModalAction from '../ModalAction';

const channel = { id: '746478', proveedor_name: "FOX" };
const examplePurchaseButtons = [{
    content: 'Boton action',
    props: {
        onClick: (e) => console.log('evento en un purchase'),
    }
}];
const modalProps = {
    proveedorName: channel.proveedor_name,
    buttons: examplePurchaseButtons,
    callback: () => console.log('cb....')
}

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <ModalAction {...modalProps} />
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

it('should have content', () => {
    const content = wrapper.find('.modal-content');
    expect(content.length == 1).toBe(true);
});

it('should not have title', () => {
    const title = wrapper.find('.modal-title');
    expect(title.length == 0).toBe(true);
});
