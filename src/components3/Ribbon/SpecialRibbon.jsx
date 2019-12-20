import "./styles/special-ribbon.css";
import React from "react";
import PropTypes from "prop-types";

import Card from "./../Card";
import Ribbon, { RibbonPropTypes } from "./";


const getTitle = title => {
  const titleContainer = (
    <div
      className="special-ribbon-title"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );

  return title;
};

const getSibling = item => {
  //console.log ("[SpecialRibbon] getSibbling", item);
  const siblingContainer = (
    <div className="special-ribbon-sibling">
      <div className="special-ribbon-sibling-container">
        <Card {...item} type="portrait" focusable={false} />
      </div>
      {/* <div className="arrow-right" /> */}
    </div>
  );

  return item ? siblingContainer : null;
};

const getRibbon = props => {
  const ribbonContainer = (
    <div className="special-ribbon-carousel">
      <Ribbon {...props} title={""} carruselTitle={props.title} />
    </div>
  );

  return props ? ribbonContainer : null;
};

const SpecialRibbon = props => {
  if (props.items && props.items.length < 1) return null;
  const sibling = props.sibling;
  console.log('ESTOS SON LOS NODOS >>>>>>', sibling)
  if (sibling) {
    const ribbonClassName = `special-ribbon ${props.sibling
      ? "one-to-many"
      : ""}`;

    return (
      <div className={ribbonClassName}>
        {getTitle(props.title)}
        {/* getSibling(props.sibling) */}
        {getRibbon(props)}
      </div>
    );
  }
  return (
    <div>
       <p style={{margin: 0, fontWeight: 500, textTransform: 'lowercase'}} dangerouslySetInnerHTML={{ __html: getTitle(props.title) }} />
      {getRibbon(props)}
    </div>
  );
};

const propTypes = Object.assign(
  {
    title: PropTypes.string,
    sibling: PropTypes.object,
    items: PropTypes.array
  },
  RibbonPropTypes
);

SpecialRibbon.propTypes = propTypes;

SpecialRibbon.defaultProps = {
  title: null,
  sibling: null,
  items: null
};

export default SpecialRibbon;