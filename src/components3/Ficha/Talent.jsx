import './vcard.css';
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { setResumeData } from "../../actions/resume";

import Resume from './../../components/Resume';
import Ribbon from './../../components/Ribbon';

import Metadata from '../../requests/apa/Metadata';
import * as api from '../../requests/loader';
import utilsSearch from '../../utils/Search';
import {setMetricsEvent} from "../../actions/metrics";
import Translator from "../../requests/apa/Translator";
import { withRouter } from 'react-router-dom';
class Talent extends Component {

  constructor(props = {}) {
    super(props);

    this.state = {
      name: '',
      vertical: []
    };
  }

  componentDidMount() {
    window.SpatialNavigation.makeFocusable();
  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
  }

  componentWillMount() {

    if (this.props.match.params.id == 'undefined' || this.props.match.params.id == utilsSearch.getSearchField().Genre) {
      this.getGenreData();
    }
    else {
      this.getTalentData();
    }

  }

  async getTalentData() {
    const { match } = this.props;

    console.log("set state false");

    const fullname = match.params.fullname;
    const id = match.params.id;
    let provider_id = match.params.provider_id;
    if(isNaN(provider_id)) {
      provider_id = '';
    }

    const birthday = "";
    const birthPlace = "";



    const vertical = await api.vertical(id, utilsSearch.getSearchField().Talent, provider_id);
      console.log('vertical',vertical);

      if(vertical.length===0) {
        this.props.setResumeData({
          title: Translator.get('Talent_not_found','Talento no encontrado'),
          showBack: true,
          overWrite: true
        });
        return;
      }
      else {
        this.props.setResumeData({
          title: fullname,
          showBack: true,
          overWrite: true
        });
        this.setState({
          vertical:vertical
        })
      }

    this.props.setResumeData({
      title: fullname,
      showBack: true,
      overWrite: true
    });

    /*
    const verticalLookUp = await api.verticalSearch(id, "TALENT");
    this.setState({
      verticalLookUp
    })
    */
  }

  async getGenreData() {
    const { match } = this.props;

    const fullname = match.params.fullname;    
    let provider_id = match.params.provider_id;
    if (isNaN(provider_id)) {
      provider_id = '';
    }
    
    const birthday = "";
    const birthPlace = "";

    const verticalLookUp = await api.verticalLookUp(fullname, utilsSearch.getSearchField().Genre);
    
    console.log('vertical', verticalLookUp);

    if (verticalLookUp.length === 0) {
      this.props.setResumeData({
        title: Translator.get('Genre_not_found', 'Genero no encontrado'),
        showBack: true,
        overWrite: true
      });
      return;
    }
    else {
      this.props.setResumeData({
        title: fullname,
        showBack: true,
        overWrite: true
      });
      this.setState({
        vertical: verticalLookUp
      })
    }

    this.props.setResumeData({
      title: fullname,
      showBack: true,
      overWrite: true
    });

  }

  render() {
    const { vertical } = this.state;
    if(vertical.length===0) {
      return <Resume history={this.props.history} />
    }
    return  (
      <div className="fromVMenu">
        <Resume history={this.props.history} />
        <div className="fromVMenu talent-vlookup">
          <Ribbon
            id={0}
            title={Translator.get('talent_text_carrusel_title', 'Peliculas y series de Tv')}
            items={
              vertical.map(item => ({
                id: item.id,
                group_id: item.id,
                title: item.title,
                cover: item.image_small.replace('http:', 'https:'),
                href: `/vcard/${item.id}`,
                proveedor_name: item.proveedor_name,
                provider: item.proveedor_name == 'AMCO' ? 'default' : item.proveedor_name,
                format_types: item.format_types.split(','),
                live_enabled: item.live_enabled,
                type: item.live_enabled === '1' ? 'live' : 'vod',
              }))
            }
            setMetricsEvent={this.props.setMetricsEvent}
            carruselTitle={Translator.get('talent_text_carrusel_title', 'Peliculas y series de Tv')}
            user={this.props.user}
            hideInnerTitle={true}
          />
        </div>
      </div>
    );
  }
}

Talent.propTypes = {
  name: PropTypes.string.isRequired,
  birthday: PropTypes.string.isRequired,
  birthPlace: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => bindActionCreators({
  setResumeData,setMetricsEvent,
}, dispatch);
export default connect(null, mapDispatchToProps)(withRouter(Talent))
