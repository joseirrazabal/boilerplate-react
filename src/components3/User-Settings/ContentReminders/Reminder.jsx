import React, { Component } from 'react';

class Reminder extends Component {
    constructor() {
        super();
    }

    getProps() {
        let props = {
          'onFocus': () => {
                let childs = document.querySelector('#frameReminders').childNodes;
                let parentBottom = document.querySelector("#frameReminders").getBoundingClientRect().bottom;
                let lastChildTop = childs[childs.length-1].getBoundingClientRect().top;

                //rotando flecha en dirección para mover el cursor si hay elementos visibles en una direccion u otra al llegar al final de ambas direcciones.
                if (lastChildTop < parentBottom) {
                    if ( document.querySelector('.flecha') ) document.querySelector('.flecha').classList.add('rotar-flecha');
                }else {
                    if ( document.querySelector('.flecha') ) document.querySelector('.flecha').classList.remove('rotar-flecha');
                }

                this.props.focusHandler(this.props.data);
          }
        };

        return props;
    }

    render() {
        const props = this.getProps();

        return (
            <div {...props} id={ this.props.id } data-channel-group-id={this.props.channel_group_id} className="reminder focusable x">
                <img src={ this.props.img }></img>
                <div className="info">
                    <p>
                        { this.props.title } <br/>
                        <span>{ this.props.channel }</span>
                    </p>
                </div>
                <div className="schedule">
                    <p>{ this.props.schedule }</p>
                </div>
            </div>
        );
    }
}

export default Reminder;
