import './configsession.css'
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ConfigSession = (props) => {
	if(typeof(props.handlerFunction) == 'function') {
		return (
			<a
				id={props.id}
				onClick={props.handlerFunction.bind(this)}
				className="configsession focusable" href="javascript:void(0)"
			>
		    	<i className="fa fa-cog" />
		    </a>
		);
	}
	else if(props.href) {
        return (
            <div id={props.id} className="configsession">
                <Link
                className="focusable"
                to={props.href}
                data-sn-up={props.focusUp}
                >
                	<i className="fa fa-cog" />
                </Link>
            </div>
        )
	}
	else return (<div className="configsession"> <i className="fa fa-cog" /></div>);
}

ConfigSession.propTypes = {
  id: PropTypes.string,
  href: PropTypes.string,
  focusUp: PropTypes.string,
  handlerFunction: PropTypes.func,
}

ConfigSession.defaultProps = {
  id: '',
  href: '',
  focusUp: '',	
  handlerFunction: null,
}

export default ConfigSession;