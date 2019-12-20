import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getAppConfig from '../../config/appConfig';
import Asset from './../../requests/apa/Asset';
import DeviceStorage from '../DeviceStorage/DeviceStorage';

//const config = getAppConfig();


const config_remote_control = (DeviceStorage.getItem('config_remote_control') !== 'simple') ? true : false ;

class CoverImage extends Component {

  shouldComponentUpdate(nextProps) {
    const differentCovers = this.props.image !== nextProps.image;
    return differentCovers;
  }
  render() {
    const contentProps = this.props.contentProps;
    const { image, imagePlaceholder, classComponent, type } = this.props;
    const multipleImages = image instanceof Array && image.length > 1;
    const imgRender = (imgs) => {
      if (multipleImages) {
        const defaults = Array(4 - imgs.length).fill(imagePlaceholder);
        const images = [...imgs, ...defaults];
        return images.map((img, index) => (
          <img
            src={img}
            onError={(e) => {
              e.target.src = imagePlaceholder;
            }}
            className="mCS_img_loaded music_images_cover"
            key={index}
            role="presentation"
          />
        ));
      }

      //if not multipleImages
      let img = Array.isArray(imgs) ? imgs[0] : imgs;
      if (img && img.indexOf('CancionesIdentificadas') > -1) img = Asset.get('songs_identified');
      if (img === undefined || img.indexOf('ph_artistas.svg') > -1) img = imagePlaceholder;

      return (
        <img
          src={img}
          onError={(e) => {
            const el = e.target;
            el.src = imagePlaceholder;
          }}
          className={`mCS_img_loaded ${classComponent}`}
          role="presentation"
        />
      );
    };

    const overlayButtons = (contentProps) => {
      if(contentProps){
        let overlayId =`card-${contentProps.id}`;
        let favId =`fav-${contentProps.id}`;

        if (contentProps.musicData){
          overlayId = `card-${contentProps.music_class}-${contentProps.musicData.id}`;
          favId =`fav-${contentProps.music_class}-${contentProps.musicData.id}`;
        }
        if (
          (contentProps.type === 'radio' && contentProps.artistRadio) ||
          (contentProps.type === 'radio' && contentProps.genre))
          return '';

        let blueButton = <div className="play-overlay control-overlay">
          <div className="fa fa-play" /><br/>
          { config_remote_control ?
            <span className={`color-ball blue`}></span>
            : null
          }
        </div>;

        let yellowButton = "";
        let classFav = "";
        if(contentProps.type === 'playlist'){
          if(contentProps.isUserPlaylist === false ||
            (contentProps.isUserPlaylist === undefined && contentProps.isFollowing !== undefined) ){
            classFav = contentProps.isFollowing?'fa-bookmark favorited' : 'fa-bookmark';
            yellowButton = <div className="follow-overlay control-overlay">
              <div className={`fa ${classFav}`} id={`${favId}`} /><br/>
              { config_remote_control ?
                <span className={`color-ball yellow`}></span>
                : null
              }
            </div>;
          }
        } else if(contentProps.type === 'album' || contentProps.type === 'radio' || contentProps.type === 'artist'){
          classFav = contentProps.isFavorite?'fa-heart favorited' : 'fa-heart';
          yellowButton = <div className="follow-overlay control-overlay">
            <div className={`fa ${classFav}` } id={`${favId}`}/><br/>
            { config_remote_control ?
              <span className={`color-ball yellow`}></span>
              : null
            }
          </div>;
        }

        const greenButton =  <div className="more-overlay control-overlay">
          <div className="fa fa-ellipsis-v" /><br/>
          { config_remote_control ?
            <span className={`color-ball green`}></span>
            : null
          }
        </div>

        let classCircle = '';
        if(contentProps.type === 'artist' || contentProps.type === 'radios'){
          classCircle='card-focus-container'
        }

        return <div className={`card-overlay ${classCircle}`} id={overlayId}>
          {(contentProps.type!=='artist' && contentProps.type!=='radios')?blueButton:''}
          {contentProps.subType!=='stvRadio'?yellowButton:''}
          {!contentProps.musicData && contentProps.type!=='radio' && contentProps.type !=='artist'?
            greenButton : ''}
        </div>
      }
      else return '';
    };
    return (
      <div className={`card-placeholder ${type} ${type === 'circle' ? 'noBack': ''}`}
           alt="Cover Image">
        {imgRender(image)}
          {overlayButtons(contentProps)}
        </div>
    );
  };
}

CoverImage.propTypes = {
  type: PropTypes.string.isRequired,
  image: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]),
  isDetail: PropTypes.bool,
  isMobile: PropTypes.bool,
  imagePlaceholder: PropTypes.string,
  classComponent: PropTypes.string,
  contentProps: PropTypes.object
};

export default CoverImage;
