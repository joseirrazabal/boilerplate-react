import React, {Component} from "react";
import PropTypes from 'prop-types';

import Button from '../Button';
import Ribbon from '../Ribbon';
import Scrollable from '../Scrollable';
import Translator from "../../requests/apa/Translator";

class VOD extends Component {
  constructor() {
    super();

    this.state = {
      seasonIndex: null,
    };

    this.handleSeasonButtonClick = this.handleSeasonButtonClick.bind(this);
  }

  componentWillMount() {
    const {seasonIndex} = this.props;
    if(seasonIndex !== null && seasonIndex !== undefined) {
      this.setState({ seasonIndex: seasonIndex });
    }
  }

  componentDidMount() {
    window.SpatialNavigation.makeFocusable();
  }

  componentWillReceiveProps(nextProps) {
    console.log("serie receive props", nextProps);
    this.setState({ seasonIndex: nextProps.seasonIndex });
  }

  handleSeasonButtonClick(seasonIndex = 0) {
    console.log("VOD handleSeasonClick", seasonIndex);
    this.setState({ seasonIndex: seasonIndex });
  }

  render() {

    console.log("render VOD", this.props);
    console.log("render VOD", this.state);

    const seasons = this.props.seasons;
    const role = this.props.role;
    // const seasonIndex = this.state.seasonIndex;
    // const episodes = seasonIndex !== null && seasons.length > 0 ? seasons[seasonIndex].episodes : [];
    //
    // const seasonButtons = seasons ? seasons.map((season, index) => {
    //   const active = index === seasonIndex ? "active" : null;
    //     return (
    //       <Button
    //         key={ season.number }
    //         className={ active }
    //         text={`${Translator.get('season')} ${season.number}`}
    //         onClick={() => { this.handleSeasonButtonClick(index) }}
    //       />
    //     )
    //   })
    // : null;
    //
    // const seasonEpisodes = episodes.length > 0 ? episodes.map(ep => {
    //     return {
    //       id: ep.id,
    //       group_id: ep.id,
    //       title: `${ep.episode_number}. ${ep.title_episode}`,
    //       cover: ep.image_still,
    //       clickHandler: null
    //     }
    //   })
    // : null;

    const initialValue = role[0] ? role[0].talents.talent : [];
    const talentArray = role.reduce((prev, curr) => {
      return prev.concat(curr.talents.talent);
    }, initialValue);

    const talents = talentArray.map(talent => {
      return {
        id: talent.id,
        title: `${talent.name} ${talent.surname}`,
        href: `/talent/${talent.id}/${talent.fullname}`,
      };
    });

    const recommendations = this.props.recommendations ?
      this.props.recommendations.map(recommendation => {
        return {
          id: recommendation.id,
          group_id: recommendation.id,
          title: recommendation.title,
          cover: recommendation.image_small.replace('https:', 'https:'),
          proveedor_name: recommendation.proveedor_name,
          format_types: recommendation.format_types,
          live_enabled: recommendation.live_enabled
        }
      })
    : null;

    return (
      <div height={"337"}>
        {/*{*/}
          {/*seasonButtons ?*/}
            {/*<div className="vcard-seasons">*/}
              {/*{ seasonButtons }*/}
            {/*</div>*/}
          {/*: null*/}
        {/*}*/}

        {/*{*/}
          {/*seasonEpisodes ?*/}
            {/*<div className="vcard-seasons-carousel">*/}
              {/*<Ribbon*/}
                {/*type="landscape"*/}
                {/*items={seasonEpisodes}*/}
              {/*/>*/}
            {/*</div>*/}
          {/*: null*/}
        {/*}*/}

        {
          talents ?
            <div className="vcard-talents">
              <Ribbon
                title={"Talentos Relacionados:"}
                type="user-profile"
                items={talents}
              />

            </div>
          : null
        }

        <div className="vcard-recommendations">
          <Ribbon
            title={"Otros usuarios que vieron este contenido tambien vieron:"}
            type="landscape"
            items={recommendations}
          />
        </div>
      </div>
    )
  }
}

VOD.propTypes = {
  role: PropTypes.array.isRequired,
  recommendations: PropTypes.array.isRequired,

  seasons: PropTypes.array,
  seasonIndex: PropTypes.number,
};

VOD.defaultProps = {
  role: [],
  recommendations: [],

  seasons: null,
  seasonIndex: null,
};

export default VOD
