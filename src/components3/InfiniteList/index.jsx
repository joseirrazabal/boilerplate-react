import './infiniteList.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RequestManager from "../../requests/RequestManager";
import LevelTask from "../../requests/tasks/cms/LevelTask";
import Grid from './../../components/Grid';
import Parser from "../../utils/Parser";

class InfiniteList extends Component {
  constructor(props) {
    super(props);

    this.level = this.props.level;
    this.state = { url: '', force: false};
  }

  getAllParametersFromQs(qs){
      let res;
      let params = {};

      if (qs){
          res = qs.split('&');

          res.forEach((item, index) => {
              let par = item.split('=');

              if (par[0] && par[1]){
                  params[par[0]] = par[1];
              }
          })
      }

      return params;
  }

  getRequest(qs) {
    if (qs === undefined){
      return {};
    }

    let result = {};
    let qsArray = qs.split('?');

    if (qsArray[0]) {
      result.uri = qsArray[0];
    }

    if (qsArray[1]) {
      result.params = this.getAllParametersFromQs(qsArray[1]);
    }

    return result;
  }

  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  componentDidMount(){
    this.newGridList(this.level);
  }

  componentWillReceiveProps(nextProps){
    (nextProps.level !== this.props.level) ? this.newGridList(nextProps.level) : '';
  }

  newGridList(actualLevel){
    setTimeout(function() { window.SpatialNavigation.focus('.home-container .focusable'); }, 900);
    const levelTask = new LevelTask(actualLevel);
    let promiseLevel = RequestManager.addRequest(levelTask);

    promiseLevel.then((res) => {
      let modules = Parser.parserModules(res);

      //Buscar la url para 3er nivel
      if (res.status == 0) {
        let components = modules.module[0].components.component;

        for (var component of components){
          if (component.name === 'carrousel') {
            let url = component.properties.url;
            url = url.replace('quantity=40', 'quantity=12')

            this.setState({ url })

            this.requets = this.getRequest(url);
          }
        }
      } else if (res.status == "1" && res.errors && res.errors.error && res.errors.error["0"]) {
            console.error(res.errors.code + ': ' + res.errors.error["0"]);
      }
    });
  }

  render() {
    return (
      <div>
        <Grid
          user={this.props.user}
          state={this.props.state}
          rows={3}
          cols={4}
          request={this.getRequest(this.state.url)}
          width={1280}
          height={400}
          className={this.props.className}
          focusHandler={this.props.focusHandler}
          setMetricsEvent={this.props.setMetricsEvent}
        />
      </div>
    )
  }
}

InfiniteList.propTypes = {
    level: PropTypes.string.isRequired,
    className: PropTypes,
    user: PropTypes.object
};

InfiniteList.defaultProps = {
    level: '',
    user: {},
    className: null
};

export default InfiniteList;
