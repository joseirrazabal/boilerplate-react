import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ButtonOld from '../Button/oldIndex';
import Translator from '../../requests/apa/Translator';
import './episodeSelection.css';


class Seasons extends Component {
  
  constructor(){
    super();
    this.outTime = null;
  }

  static propTypes = {
    seasons: PropTypes.arrayOf(PropTypes.object).isRequired,
    seasonSelected: PropTypes.string.isRequired,
    handleSeasonClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    seasons: [],
    seasonSelected: "1",
    handleSeasonClick: () => {},
  };

  handleNavigate = (item) => {
    let position = item * 180;
    [...document.querySelectorAll('.vcard-seasons')].map( currentValue => {
      currentValue.style.marginLeft = `-${position}px`;
    });
  }


  componentDidMount(){
    const { seasons, seasonSelected } = this.props;

    let seasonPosition = null;
    
    seasons.map((item, index)=>{
      if(item.number === seasonSelected){
        seasonPosition = index;
      }
    });

    if(seasonPosition === -1) return;

    [...document.querySelectorAll(`.button-season-${seasonSelected}`)].map( currentValue => {
      currentValue.classList.add("show-button", "btn-s-active");
    });

    this.handleNavigate(seasonPosition);
  }

  render() {
    const { seasons, seasonSelected, handleSeasonClick } = this.props;
    return (
      <div className="v-card-season-container" 
      onFocus={()=>{

        [...document.querySelectorAll('.button-mask')].map( currentValue => {
          currentValue.classList.add("button-mask-animate");
        });

        [...document.querySelectorAll('.vcard-seasons > a')].map( currentValue => {
          currentValue.classList.add("show-button");
        });
        clearTimeout(this.outTime);

      }} 
      onBlur={()=>{
        let currentIndex = null;

        let modal = document.getElementsByClassName("modal-container");
        let visibleModal = false;
        if(modal && modal[0]){
          visibleModal = true;
        }
        let btnSelector = visibleModal ? '.modal-container .vcard-seasons > a': '.vcard-seasons > a';

        this.outTime = setTimeout(()=>{

          [...document.querySelectorAll('.button-mask')].map( currentValue => {
            currentValue.classList.remove("button-mask-animate");
          });
          [...document.querySelectorAll(btnSelector)].map( (currentValue, index) => {
            if(currentValue.className.indexOf('btn-s-active') === -1){
              currentValue.classList.remove("show-button");
            } else {
              currentIndex = index
            }
          });
          this.handleNavigate(currentIndex);
          
        }, 500);

      }}
      >
        <div className="button-mask" style={{zIndex: 0}}></div>
        <div className="vcard-seasons">
          {
            seasons.map((season, index) => {
              const fontWeight = season.number === seasonSelected ? "bold" : "normal";
              return (
                <ButtonOld
                  style={{ fontWeight }}
                  key={season.number}
                  text={`${Translator.get('season', 'Temporada')} ${season.number}`}
                  className={`button-season-${season.number}`}
                  onClick={() => {
                    [...document.querySelectorAll('.vcard-seasons > a')].map( currentValue => {
                      currentValue.classList.remove("btn-s-active");
                    });

                    [...document.querySelectorAll(`.button-season-${season.number}`)].map( currentValue => {
                      currentValue.classList.add("btn-s-active");
                    });

                    handleSeasonClick(season.number);
                  }}
                  onFocus={() => {
                    this.handleNavigate(index);
                  }}
                />
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Seasons
