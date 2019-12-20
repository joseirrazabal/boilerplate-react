import './captcha.css'
import '../../assets/css/simple-line-icons.css';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ShowCaptchaTask from '../../requests/tasks/user/ShowCaptchaTask';

import focusSettings from './../Focus/settings';
import FormGroup from './../FormGroup';


class Captcha extends Component {
    constructor(props) {
        super(props);

        this.state = {
            urlImg: this.getCaptchaImg()
        };
        
        this.setCaptchaImg = this.setCaptchaImg.bind(this);
    }

    getCaptchaImg() {
        const showCaptchaTask = new ShowCaptchaTask();
        const urlImg = `${showCaptchaTask.getImageUrl()}&rnd=${Math.random()}`;
        return urlImg;
    }

    setCaptchaImg() {
        const showCaptchaTask = new ShowCaptchaTask();
        const urlImg = `${showCaptchaTask.getImageUrl()}&rnd=${Math.random()}`;
        this.setState({ urlImg: urlImg});
    }

    componentDidMount() {
        window.SpatialNavigation.makeFocusable();
    }

    render() {
        return (
            <div className="captcha">
                <div className="title">
                    <span>{this.props.title}</span>
                </div>
                <div className="form">
                    <FormGroup
                        id="input-captcha"
                        placeholder={this.props.placeHolder}
                        onFocused={() => {
                            this.props.focusedHandler(this.props.id);
                        }}
                        error={this.props.error}
                        value={this.props.value}
                        onChange={(text = '') => {
                            this.props.changeTextHandler
                        }}
                    />
                    <span className="icon-refresh refresh-btn focusable" onClick={this.setCaptchaImg}/>
                    <img src={this.state.urlImg ? this.state.urlImg: ''} alt="captcha" />
                </div>
            </div>              
        )
    }
}

Captcha.propTypes = {
    id:PropTypes.string.isRequired,
    captchaImg: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    title: PropTypes.string,
    focusedHandler: PropTypes.func,
    changeTextHandler: PropTypes.func,
    changeCaptchaHandler: PropTypes.func,    
};

Captcha.defaultProps = {
    captchaImg: '',
    placeHolder: 'Captcha', 
    title: 'Escribe los caracteres que ves en la imagen',
    focusedHandler: null,
    changeTextHandler: null,
    changeCaptchaHandler: null,
};

export default Captcha;

