import './special.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SpecialTask from "../../requests/tasks/cms/SpecialTask";
import ListTask from "../../requests/tasks/content/ListTask";
import RequestManager from "../../requests/RequestManager";

import Resume from './../../components/Resume';
import Carousel from './../../components/Ribbon';
import Card from './../../components/Card';
import Parser from './../../utils/Parser';
import Utils from "../../utils/Utils";
import Ribbon from "../Ribbon/Ribbon";

import Badges from './../../requests/apa/Badges';
import DeviceStorage from "../DeviceStorage/DeviceStorage";

class Special extends Component {

    constructor(props) {
        super(props);
        this._special = props.specialName;

        this.state = {
            specialRibbon1: {
                items:[],
            },
            specialRibbon2: {
                ribbonTitle: '',
                items: [],
            }
        };
        this.onkeyUpHandler = this.onkeyUpHandler.bind(this);
        this.setResume      = this.setResume.bind(this);
        //Se agrgan las sig. lineas para nuevo badgesHTML
        this.userType = 'anonymous';

        if (props.user.isLoggedIn) {
            this.userType = props.user.isSusc ? 'susc' : 'no_susc';
          }

        this.region = (props.user && props.user.region)
      || DeviceStorage.getItem("region");

        this.badgesUserType = {};
        const region = Badges.data[this.region] ? this.region : 'default';

        if (Badges.data[region]
          && Badges.data[region][this.userType]) {
          this.badgesUserType = Badges.data[region][this.userType];
          }
    }

    componentDidUpdate() {
        window.SpatialNavigation.makeFocusable();
    }

    onkeyUpHandler(cardProps) {
        let data = cardProps.data;
        this.setResume(data);
    }

    setResume(data) {
      this.props.setResume({
        title: data.title,
        year: data.year,
        description: data.description,
        rating: data.rating_code,
        previewImage:null,
        overWrite:true,
        format_type:''
      });
    }

    componentWillUnmount() {
        Utils.resetBackground();
    }

    componentDidMount() {
      this.setResume({})
        let promiseSpecial, promiseRibbon1,promiseRibbon2,promiseRibbon;
        let that = this;

        if (this._special === undefined || this._special === '') {
            return;
        }

        const specialTask = new SpecialTask(this._special);
        promiseSpecial = RequestManager.addRequest(specialTask);
        Utils.setBackgroundImage('');

        promiseSpecial.then(function (res) {

            if (res.status === '0') {
                res = Parser.parseSpecial(res);
                if(typeof res === 'object'){
                  let cintasKeys=Object.keys(res);
                  cintasKeys.forEach((it)=>{
                    if(typeof res[it] === 'object' ){
                      let requets = Utils.getRequest(res[it].carrousel.url);
                      const ribbonTask = new ListTask(requets.uri, requets.params);
                      promiseRibbon = RequestManager.addRequest(ribbonTask);
                      if(res[it].type==='especial3'){
                        Utils.setBackgroundImage(res[it].background);
                        promiseRibbon.then(function (resp) {
                          resp = Parser.parserList(resp);
                          that.setState({
                            specialRibbon1: {
                              items: resp
                            }
                          })
                        });
                      }
                      if(res[it].type==='carrousel'){
                        let ribbonTitle = Utils.htmlDecode(res[it].header);
                        promiseRibbon.then(function (resp) {
                          resp = Parser.parserList(resp);
                          that.setState({
                            specialRibbon2: {
                              ribbonTitle: ribbonTitle,
                              items: resp
                            }
                          })
                        });
                      }
                    }
                  });
                }
            }
            else if (res.status === "1" && res.errors && res.errors.error && res.errors.error["0"]) {
                console.error(res.errors.code + ': ' + res.errors.error["0"]);
            }
        }, function (err) {
            if (err && err.completeError) {
                console.error(`Warning: Failed prop specialName value is '${that._special}'. Api error: ${err.completeError.errors.code}`);
            }
        });
    }

    render() {

        const highlights = this.state.specialRibbon1 && this.state.specialRibbon1.items ? this.state.specialRibbon1.items : [];
        const items = this.state.specialRibbon2 && this.state.specialRibbon2.items ? this.state.specialRibbon2.items : [];
        items.map((item) =>  {
          item.group_id = item.id;
          item.cover    = item.image_small;
          item.proveedor_name = item.proveedor_name;
          item.provider= item.proveedor_name == 'AMCO' ? 'default' : item.proveedor_name;
          if (item.format_types) {
            if(typeof item.format_types === 'string'){
              item.format_types = item.format_types.split(',');
            }else if(typeof item.format_types === 'object' && 
            Object.getOwnPropertyNames(item.format_types).length !== 0){
              item.format_types = item.format_types;
            }
        }
        else {
          item.format_types = [];
        }
        item.live_enabled= item.live_enabled;
        item.type= item.live_enabled === '1' ? 'live' : 'vod';
        return item;
      });

      highlights.map((item) =>  {
          item.group_id = item.id;
          item.cover    = item.image_small;
          item.proveedor_name = item.proveedor_name;
          item.provider= item.proveedor_name == 'AMCO' ? 'default' : item.proveedor_name;
          if (item.format_types) {
              if(typeof item.format_types === 'string'){
                item.format_types = item.format_types.split(',');
              }else if(typeof item.format_types === 'object' && 
              Object.getOwnPropertyNames(item.format_types).length !== 0){
                item.format_types = item.format_types;
              }
          }
          else {
            item.format_types = [];
          }
          item.live_enabled= item.live_enabled;
          item.type= item.live_enabled === '1' ? 'live' : 'vod';
          return item;
        });

        return (
            <div className="special">
                <Resume/>
                <div className="special-items">
                    {highlights.map((item, index) => {
                        const node_item = item;
                        let node_item_provider = node_item && node_item.provider;
                        let badges = '';
                        if (this.badgesUserType[node_item_provider] === undefined) {
                          node_item_provider = 'default';
                        }
                        if (node_item_provider
                          && this.badgesUserType
                          && this.badgesUserType[node_item_provider]
                        ) {
                          const formatTypes = node_item.format_types ? node_item.format_types : [];
                          const badge_provider = this.badgesUserType[node_item_provider];
        
                          for (let i = 0; i < formatTypes.length; i++) {
                            if (badge_provider[formatTypes[i]]
                              && badge_provider[formatTypes[i]][node_item.type]
                            ) {
                              const data = badge_provider[formatTypes[i]][node_item.type];
        
                              for (let i = 0; i < data.length; i++) {
                                badges += data[i].render;
                              }
                            }
                          }
                        }
                    return <Card
                        key={index}
                        index={index}
                        cover={item.image_small}
                        group_id={item.id ? item.id : null}
                        data={item}
                        type={'highlight'}
                        keyUpHandler={this.onkeyUpHandler}
                        year={item.year}
                        badgesHtml={badges}
                        />
                })}
                </div>
                <Ribbon type='landscape'
                    title={this.state.specialRibbon2.ribbonTitle}
                    items={items}
                    focusHandler={this.setResume}
                    user={this.props.user}
                />
            </div>
        );
    }
}

Special.propTypes = {
    setResume  : PropTypes.func,
    specialName: PropTypes.string.isRequired,
};

Special.defaultProps = {

};

export default Special;
