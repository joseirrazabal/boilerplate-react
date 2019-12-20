import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Avatar = (props) => {
	if(typeof(props.handlerFunction) == 'function') {
		return (
		  <a
        id={props.id}
        onClick={props.handlerFunction.bind(this)}
        //className="avatar icon icon-profile focusable" href="javascript:void(0)"
        className="icon icon-setting focusable" href="javascript:void(0)"
      >
        {/*<img src={props.avatarImage}/>*/}
      </a>
    );
	}
	else if(props.href) { 
    return (
      <div id={props.id} className="avatar">
        <Link
          className="focusable"
          to={props.href}
          data-sn-up={props.focusUp}
        >
          <img src={props.avatarImage} />
        </Link>
      </div>
    )
	}
	else return (<div className="avatar"> <img src={props.avatarImage} /></div>);

}

Avatar.propTypes = {
  id: PropTypes.string,
  href: PropTypes.string,
  focusUp: PropTypes.string,
	avatarImage: PropTypes.string,
  handlerFunction: PropTypes.func,
}

Avatar.defaultProps = {
  id: '',
  href: '',
  focusUp: '',
	avatarImage: 'https://www.clarovideo.com/webclient/sk_core/images/placeholder_avatar.png',
  handlerFunction: null,
}

export default Avatar;
