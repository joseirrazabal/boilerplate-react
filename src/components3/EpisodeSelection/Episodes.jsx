import React, { Component } from 'react';
import Ribbon from '../Ribbon';
import { getBookmark } from '../../requests/loader';
import settings from '../../devices/all/settings';

class Episodes extends Component {
    constructor() {
        super();
        this.state = {
          response: '',
          loadingBookmarks: true,
          items: [],
          bookmarkError: false,
        };

        this.buildEpisodes = this.buildEpisodes.bind(this);
        this.handleErrorImg = this.handleErrorImg.bind(this);
        this.setBookmarkEpisodes = this.setBookmarkEpisodes.bind(this);
        this.setCoverImages = this.setCoverImages.bind(this);
        this.handleUpdateProgress = this.handleUpdateProgress.bind(this);
    }

    async getAllBookmarks(groupId = "") {
        return await getBookmark(groupId);
    }

    requesthandler() {
        console.log("REQUESTHANDLER EPISODES");
        let groupIdArray = this.props.episodes.map(ep => (ep.id));
        let that = this;
        this.getAllBookmarks(groupIdArray.toString()).then(function (response) {
            that.setState({ response: response.response.groups, loadingBookmarks: false })
        }).catch(function (error) {
            that.setState({ response: '', loadingBookmarks: false, bookmarkError: true })
        });
    }

    componentDidMount() {
      this.requesthandler();
      document.addEventListener(settings.update_progress, this.handleUpdateProgress);
    }

    componentWillUnmount() {
      document.removeEventListener(settings.update_progress, this.handleUpdateProgress);
    }

    handleUpdateProgress(e) {
      this.requesthandler();
      this.setBookmarkEpisodes(e);
    }

    focusElement() {
        let modal = document.getElementsByClassName("modal-container");
        let visibleModal = false;
        if(modal && modal[0]){
          visibleModal = true;
        }
        if(visibleModal){

          [...document.querySelectorAll(`.modal-container .ribbon-items .card`)].map( (currentValue, index) => {
            if(index === 0){
              const id = currentValue.getAttribute("id");
              const idLink = document.getElementById(id).children[0].children[0].getAttribute("id");
              window.SpatialNavigation.focus(`#${idLink}`);
            }
          });
        }
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.episodes) !== JSON.stringify(this.props.episodes)) {
            this.buildEpisodes();
            this.requesthandler();
        }
        console.log("MUERE EPISODES");
        this.focusElement();

        if(!this.state.loadingBookmarks) {
          this.checkBookmarkEpisodes();
        }
    }   

    componentWillMount(){
        this.buildEpisodes();
        console.log("NACE EPISODES");
    }

    handleErrorImg(image_frames, image_still) {
      return new Promise(resolve => {
        let image = new Image();
        image.src = image_frames;
        image.onerror = function () {
          resolve(image_still);
        };
        image.onload = function () {
          resolve(image_frames);
        };
      })
    }

    checkBookmarkEpisodes() {
      const { response, items } = this.state;
      const haveBookmarks = response.length > 0 && items.length > 0;

      if(haveBookmarks) {
        this.setBookmarkEpisodes();
      } else if(response.length === 0) {
        this.setCoverImages();
      }
    }

    setCoverImages() {
      this.setState({
        loadingBookmarks: true,
        items: this.state.items.map(ep => Object.assign({}, ep, {
          cover: ep.image_still && ep.image_still.indexOf && ep.image_still.indexOf('?') == -1 ? ep.image_still + '?size&imwidth=286' : ep.image_still + '&size&imwidth=286',
        })),
      });
    }

  setBookmarkEpisodes(e) {    
      let cover = null;
    
      const items= this.state.items.map(async ep => {
        const responseBookmark = this.state.response.find(bookmark => bookmark.id == ep.id);
        let image_still = ep.image_still && ep.image_still.indexOf && ep.image_still.indexOf('?') == -1 ? ep.image_still + '?size&imwidth=286' : ep.image_still + '&size&imwidth=286';
                
        //FIX para mostar el progress actualizado viniendo de reproduccion
        if (e && e.detail && e.detail.videoid && e.detail.progress) {
          if (e.detail.videoid == ep.id) {
            ep.data.bookmark = e.detail.progress;
            return Object.assign({}, ep, {
              bookmark: e.detail.progress
            });
          }
        }

        if (responseBookmark) {
          let bookmark = responseBookmark.vistime && responseBookmark.vistime.last.progress || 0;
          let time_progress = responseBookmark.vistime && responseBookmark.vistime.last.time || '00:00:00';
          let image_frames = responseBookmark.image_frames;
          time_progress = time_progress.replace(':', 'h-').replace(':', 'm-');
          image_frames = image_frames.replace('00h-00m-00', time_progress);
          cover = await this.handleErrorImg(image_frames, image_still);

          if (ep.data) {
            ep.data.bookmark = bookmark;
          }

          return Object.assign({}, ep, {
            bookmark,
            time_progress,
            cover,
            image_frames,
            image_still,            
          });
        }

        return Object.assign({}, ep, {
          cover: image_still,
        });
      });

    Promise.all(items).then(dataItems => {
        this.setState({
          loadingBookmarks: true,
          items: dataItems,
        });
      });
    }

    buildEpisodes() {
      this.setState({
        items: this.props.episodes.map(ep => {
          return {
            id: ep.id,
            episode: ep.episode_number,
            title: `${ep.episode_number}. ${ep.title_episode}`,
            proveedor_name: ep.proveedor_name,
            format_types: ep.format_types,
            live_enabled: ep.live_enabled,
            current: ep.current ? true : false,
            clickHandler: () => { this.props.handleEpisodeClick(ep) },            
            cover: null,
            image_still: ep.image_still,
            data: ep
          }
        }),
      });
    }

    render() {
        const items = this.state.items;

        return (
            <div className="vcard-seasons-carousel">
                <Ribbon
                  type="landscape"
                  visibleNumber={this.props.visibleEpisodes}
                  hideInnerTitle={true}
                  items={items}
                />
            </div>
        )
    }
}

export default Episodes
