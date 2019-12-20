import React, { Component } from 'react';
import "./volume.css"

class VolumeIndicator extends Component {
        render() {
        const volumeLevel = {
          height: this.props.vol + '%'
        };
        return (
            <div>
                <div id="volume-indicator">
                    <i className="fa fa-volume-up" aria-hidden="true"></i>
                    <div className="bar-container">
                        <div className="bar">
                            <div className="fill" style={volumeLevel} ref="fill"></div>
                        </div>
                    </div>
                    <span>{this.props.vol}</span>
                </div>
                <div id="mute-indicator">
                    <i className="fa fa-volume-off" aria-hidden="true"></i> <i className="fa fa-times close-icon" aria-hidden="true"></i>
                </div>
            </div>
        );
    }
}

export default VolumeIndicator;
