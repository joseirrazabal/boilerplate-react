import React from 'react';
import Asset from "../../requests/apa/Asset";

function focusHandler(focusHandlerCallBack, data) {
  if(window.setResumeData)
    window.setResumeData(data);
  return (typeof focusHandlerCallBack === 'function')
    ? focusHandlerCallBack(data)
    : null;
}

function keyUpHandler(keyUpHandlerCallBack, props) {
  return (typeof keyUpHandlerCallBack === 'function')
    ? keyUpHandlerCallBack(props)
    : null;
}

function keyDownHandler(e, keyDownHandlerCallBack, params) {
  return (typeof keyDownHandlerCallBack === 'function')
    ? keyDownHandlerCallBack(e, params)
    : null;
}

function getPlaceholder(type) {
  let placeholder = null;

  switch (type) {
    case 'highlight':
      placeholder = Asset.get('asset_placeholder_highlight', '/images/placeholder_highlight.png');
      break;
    case 'landscape':
      placeholder = Asset.get('asset_placeholder_landscape', '/images/placeholder_landscape.png');
      break;
    case 'portrait':
      placeholder = Asset.get('asset_placeholder_portrait', '/images/placeholder_portrait.png');
      break;
    case 'user-profile':
    case 'user-info':
      placeholder = Asset.get('placeholder_talent_movie', '/images/placeholder_talent_movie.png');
      break;
    case 'cd':
    case 'square':
    case 'circle':
      placeholder = Asset.get('asset_placeholder_square', '/images/placeholder_square.png');
      break;
    case 'actor':
      placeholder = Asset.get('talent_placeholder_actor', '/images/placeholder_talent_actor.png');
      break;
    case 'producer':
      placeholder = Asset.get('talent_placeholder_productor', '/images/placeholder_talent_productor.png');
      break;
    case 'talent':
      placeholder = Asset.get('talent_placeholder_musica', '/images/placeholder_talent_musica.png');
      break;
    case 'narrator':
    case 'voice':
      placeholder = Asset.get('talent_placeholder_voz', '/images/placeholder_talent_voz.png');
      break;
    case 'director':
      placeholder = Asset.get('talent_placeholder_director', '/images/placeholder_talent_director.png');
      break;
    case 'writer':
      placeholder = Asset.get('talent_placeholder_escritor', '/images/placeholder_talent_escritor.png');
      break;
    default:
      placeholder = Asset.get('asset_placeholder_landscape', '/images/placeholder_landscape.png');
  }

  return placeholder;
}

function getUri(href, group_id, data) {
  href = data.href || href;
    //todos this is no real fix for TV  node
  if(data.live_enabled=='1')
    href='/player/'+group_id;
  return href || `/vcard/${group_id || ''}`;
}

function createSibling(sibling) {
  const siblingComponent = (
    <div className="placeholder-container">
      <div className="sibling-wrapper">
        <div className="card-placeholder"
             style={{backgroundImage: `url(${this.getPlaceholder('portrait')})`}}
             alt="placeholder"/>
        <img className="card-cover" src={sibling}/>
      </div>
      <div className="arrow-right" />
    </div>
  );

  return (sibling)
    ? siblingComponent
    : null;
}

function createTitle(title, roleName) {
  const titleComponent = (
    <div className="card-title">
      {title}
      {roleName}
    </div>
  );

  return (title.length)
    ? titleComponent
    : null;
}

function createLabel(label) {
  const span = (
    <div className="card-label" dangerouslySetInnerHTML={{ __html: label }}/>
);

  return (label.length)
    ? span
    : null;
}

export default {
  getPlaceholder,
  getUri,

  createSibling,
  createTitle,
  createLabel,

  focusHandler,
  keyUpHandler,
  keyDownHandler
};
