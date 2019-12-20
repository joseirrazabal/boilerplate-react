import "./styles/epgHeader.css";
import React from "react";
import PropTypes from "prop-types";
import Translator from "./../../requests/apa/Translator";
import DeviceStorage from "../DeviceStorage/DeviceStorage";

const contentButton = props => {
  const text = Translator.get("tv_channels_title", "Canales")

  return (
    <div>
      <span className="color-ball yellow" />
      {text}
    </div>
  );
};

const EpgHeader = props => {
  const config_remote_control =
    DeviceStorage.getItem("config_remote_control") !== "simple" ? true : false;

  return (
    <div className={`epg-header ${props.className}`}>
      <div className="epg-header-container">
        {/*  <div className="epg-header-title">{ props.title }</div> */}
        <ul className="color-codes">
          {config_remote_control ? (
            <div
              onClick={props.redHandler}
              className="color-code-item"
            >
              <span className="color-ball red" />{" "}
              {props.type !== "GUIDE" ? Translator.get("net_guia_completa", "Mini-guía en pantalla") : Translator.get("net_mini_guia", "Mini-guía en pantalla")}
            </div>
          ) : null}
          {/* config_remote_control ? (
            <div
              onClick={props.greenHandler}
              className="color-code-item"
            >
              <span className="color-ball green" />{" "}
              {Translator.get(
                "net_cambiar_idioma",
                "Idioma"
              )}
            </div>
          ) : null */}
          {!config_remote_control ? (
            <div
              className="color-code-item">
              <span>
                Manten presionado <span className="clv-btn">OK</span> para más
                opciones
              </span>
            </div>
          ) : (
            <div
              onClick={props.yellowHandler}
              className="color-code-item"
            >
              {contentButton(props)}
            </div>
          )}
          {config_remote_control ? (
            <div
            onClick={props.blueHandler}
            className="color-code-item"
            >
              <span className="color-ball blue" />{" "}
              {Translator.get("net_menu", "Menú")}
            </div>

          ) : null}
        </ul>
      </div>
    </div>
  );
};

EpgHeader.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  title: PropTypes.string,
  yellowHandler: PropTypes.func,
  yellowContent: PropTypes.element.isRequired,
  greenHandler: PropTypes.func,
  greenContent: PropTypes.element.isRequired,
  redHandler: PropTypes.func,
  contentHandler: PropTypes.func,
  contentBtn: PropTypes.element.isRequired
};

EpgHeader.defaultProps = {
  className: '',
  type: 'MINI',
  title: "",
  yellowHandler: null,
  redHandler: null,
  greenHandler: null,
  contentHandler: null
};

export default EpgHeader;
