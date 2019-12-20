import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';

const ModalMusicFilter = (props) => {
  const buttons = props.menuItems.map((category, index) => {
    return (
      {
        content: category.title,
        props: {
          onClick: (e) => {
            props.setGenreTitle(category);
            props.onSelectFilter(category);
            props.toggleListGenreFilter();
            props.handleClose(e, props.toggleVisibilityStatus)
          },
        },
        extraClass: 'music-filter-btn'
      }
    );
  });

  const p = {
    buttons,
    buttonsAlign: 'vertical',
    extraClass: 'music-filter'
  };

  return <ModalWrapper {...p} />;
}

export default withOnClose(ModalMusicFilter);
