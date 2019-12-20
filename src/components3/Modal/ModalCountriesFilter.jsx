import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';

const ModalCountriesFilter = (props) => {
  const buttons = props.menuItems.map((country, index) => {
    return (
      {
        content: country.name,
        props: {
          onClick: (e) => {
            props.setCountryTitle(country);
            props.onSelectFilter(country);
            props.toggleListCountryFilter();
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

export default withOnClose(ModalCountriesFilter);
