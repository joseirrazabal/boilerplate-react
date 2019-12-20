import React from 'react';
import { mount } from 'enzyme';
import ModalWrapper from '../ModalWrapper';
import Focus from '../../Focus';
import { Provider } from 'react-redux';
import store from '../../../store'

const onFocus = () => { }
const props = {
    buttonsAlign: 'vertical',
    asset: 'https://cdn2.iconfinder.com/data/icons/flat-ui-free/234/Retina-Ready.png',
    title: 'dlaskjdlaksjdasd',
    content: 'alksjdlaksjdlkasjdlakjsjdlaslkd',
    buttons: [
        {
            content: 'Botton',
            props: {
                onFocus
            }
        }
    ]
}

const wrapper = mount(
    <Provider store={store} >
        <Focus>
            <ModalWrapper {...props} />
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

it('should have vertical buttons', () => {
    const verticalButtons = wrapper.find('.modal-buttons-vertical');
    expect(verticalButtons.length == 1).toBe(true);
});