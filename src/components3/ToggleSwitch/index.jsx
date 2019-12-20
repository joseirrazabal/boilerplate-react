import './toggleSwitch.css';
import React, { Component } from 'react';


class ToggleSwitch extends Component {
    componentDidMount() {
        window.SpatialNavigation.makeFocusable();
    }

    onClickHandler(id) {
        this.props.onChange();
    }

    onFocusHandler(id) {
        if(id === 'switch_canales' || id === 'switch_contenidos'){
            let elements = document.getElementsByClassName('scroller-container');
            elements[0].scrollTop = 0;
        }
    }

    render() {
        return (
            <a onFocus={() => {this.onFocusHandler(this.props.id);}} onClick={ (e) => { this.onClickHandler(this.props.id) } } href="javascript:void(0)" id={this.props.id} className="switch focusable label">
                <input ref={"check_"+this.props.id} name={this.props.id} type="checkbox"/>
                <span className="slider round"></span>
            </a>
        );
    }
}

export default ToggleSwitch;
