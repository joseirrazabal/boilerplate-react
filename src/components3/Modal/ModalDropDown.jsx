import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';

const ModalDropDown = (props = {}) => {
   
    let parseButton = [];
    
    props.options.map((it, i) => {
        parseButton.push({
            content: it.option,
            selected: props.selected == it.value ? true : false,
            props: {
                onClick: (e) => props.handleClose(e, props.service(it.value)),
            }
        });

    })

    const p = {
        buttonsAlign: 'vertical',
        buttons: parseButton,
        scrollable: props.scrollable,
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalDropDown);