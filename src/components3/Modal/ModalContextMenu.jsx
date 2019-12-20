import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';

const ModalContextMenu = (props) => {
  const buttons = props.menuItems.map((item, index) => {
    return (
      {
        content: item.title,
        props: {
          onClick: (e) => {
            item.action();
            if(item.type !== "artistsModal"){
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

export default withOnClose(ModalContextMenu);
