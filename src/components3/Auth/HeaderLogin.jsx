import React from "react";
import { connect } from 'react-redux';
// Styles
import Translator from './../../requests/apa/Translator';
import "./styles/headerLogin.css";

class HeaderLogin extends React.Component {

    render() {
      //console.log("datos", this.props.name.url.showUrlProps)
    return (
        <header className="header-login">
          <img className="logo-login" src={require("../Header/Logo_Claro.png")} alt="Claro Logo"/>
          <div>
              <h2 className="title-login">{this.props.name.url.showUrlProps === "/search" ? null : `${window.location.href.includes("/login") === true ? Translator.get('net_usuario', 'Login') : Translator.get('net_login_recuperar', 'esqueceu a senha')}`}</h2>
          </div>
        </header>
    )
}
}

const mapStateToProps = state => ({ name: state });
export default connect(mapStateToProps, null)(HeaderLogin)