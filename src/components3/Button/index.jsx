import React from "react"
import PropTypes from "prop-types"
import focusSettings from "../Focus/settings"

// Material Components
import { withStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"

// Styles
import "./button.css"

const defaultOrder = ["icon"];

const FocusableButton = withStyles({
  root: {
    width: 100,
    "&:hover": {
      borderColor: "#FFFFFF"
    },
    "&:active": {
      boxShadow: "none",
      borderColor: "#FFFFFF"
    },

    "&:focus": {
      background: '#47536b',
      fontWeight: 500,
      boxSizing: 'border-box',
      transition: 'box-shadow 0.15s ease-in',
      boxShadow: '0 0 0 5px rgba(71, 83, 107, 1)',
    }
  }
})(Button);

const ButtonComponent = ({
  leftText,
  text,
  textBottom,
  href,
  rightText,
  className,
  iconClassName,
  FocusState,
  colorCode,
  color,
  width,
  style,
  onClick,
  onFocus,
  iconElement,
  order,
  focusable,
  focusDown
}) => {
  const orderElements = order ? order : defaultOrder;
  const children = [];
  if (iconElement) {
    children["icon"] = iconElement;
  } else {
    children["icon"] = iconClassName ? <i className={iconClassName} /> : null;
  }
  children["color"] = colorCode ? (
    <span className={`color-ball ${colorCode}`} />
  ) : null;
  className = className ? className : "";
  children["text"] = text;
  //children["textBottom"] = textBottom;
  //children["left-text"] = leftText;
  //children["right-text"] = rightText;
  focusable = typeof focusable === "undefined" ? true : focusable;

  return (
      <FocusableButton
      variant="contained"
      color={color}
      href={href}
      disableRipple
      disableFocusRipple={FocusState}
      size="medium"
      style={{style, width}}
      focusVisible
      className={`btn-generic ${focusable ? focusSettings.className : ""} action ${className}`}
      onClick={onClick}
      onFocus={onFocus}
      data-sn-down={focusDown ? focusDown : undefined}
    >
      {orderElements.map((item, index) => (
        <span className={item + "-button"} key={index}>
          {children[item]}
        </span>
      ))}
      {text}
      <p style={{
      margin: 0,
      position: 'absolute',
      top: 55,
      fontSize: 16,
      textTransform: 'lowercase'
    }}>{textBottom}</p>
    </FocusableButton>

  );
};
ButtonComponent.propTypes = {
  style: PropTypes.string,
  width: PropTypes.number,
  color: PropTypes.string,
  FocusState: PropTypes.bool,
  href: PropTypes,
  text: PropTypes.string
};
ButtonComponent.defaultProps = {
  color: "primary",
  href: "javascript:void(0)",
  FocusState: false,
  text: ''
};
export default ButtonComponent;
