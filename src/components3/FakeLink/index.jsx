import React from 'react';
import { Link } from 'react-router-dom';

function FakeLink(props) {

  const { typeRender, ...rest } = props

  if (typeRender === 'a') {
    return <a tabIndex="0" {...rest}>{rest.children}</a>
  }
  else {
    return <Link {...rest}>{rest.children}</Link>
  } 
}

export default FakeLink
