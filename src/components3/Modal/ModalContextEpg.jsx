import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';

const ModalContextEpg = (props) => {
  const menu = props.menuItems.filter((item) => (item.visible === 1));
  const buttons = menu.map((item, index) => {
    return (
      {
        content: item.title,
        props: {
          onClick: (e) => {
            item.action();
            if(item.type === "exitModal"){
              props.handleClose(e, props.toggleVisibilityStatus);
            }
          },
        },
        extraClass: 'music-filter-btn'
      }
    );
  });

  const p = {
    title: props.title,
    buttons,
    buttonsAlign: 'vertical',
    extraClass: 'music-filter'
  };

  return <ModalWrapper {...p} />;
}

export default withOnClose(ModalContextEpg);
