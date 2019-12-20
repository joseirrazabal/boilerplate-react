import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';


const ModalCitiesFilter = (props) => {
  const buttons = props.menuItems.map((city, index) => {
    return (
      {
        content: city.nameCity,
        props: {
          onClick: (e) => {
            props.setCityTitle(city);
            props.onSelectFilter(city);
            props.toggleListCityFilter();
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

export default withOnClose(ModalCitiesFilter);
