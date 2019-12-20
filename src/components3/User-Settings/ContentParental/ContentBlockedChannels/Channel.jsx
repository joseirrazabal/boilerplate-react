import React, { Component } from 'react';

class Channel extends Component{
    constructor() {
        super();
    }

    getProps() {
        let props = {
          'onFocus': () => { this.props.focusHandler(this.props.data) },
          'onClick': () => { this.props.keyActions(this) }
        };

        return props;
    }

    componentDidMount() {
        window.SpatialNavigation.makeFocusable();
    }

    render(){
        const props = this.getProps();

        return (
          <a href="javascript:void(0)" {...props} id={this.props.id} style={this.props.style} className="focusable channel">
            {this.props.channel && this.props.channel !== '' &&
              <div className="channel-number">
                {this.props.channel}
              </div>
            }
                <div className="onfocus-channel">
                    <div>
                        <i className="fa fa-lock" aria-hidden="true"></i> Desbloquear
                    </div>

                </div>
            </a>
        );
    }
}

export default Channel;
