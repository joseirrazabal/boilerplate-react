import './clock.css'
import moment from 'moment'
import  "moment/locale/es";
import React, { Component } from 'react';
import storage from '../DeviceStorage/DeviceStorage'



class Clock extends Component {
  constructor() {
    super();
    moment.locale('es')
    this.currentTime=this.now();
    this.intervalClock=null;
    this.state={
      displayTime:this.currentTime.format('HH:mm - dddd D/MM')
     };
    this.clearTimeOuts=this.clearTimeOuts.bind(this);
    this.setIntervalClockBinded=this.setIntervalClock.bind(this);
    this.toSet=this.toSet.bind(this);
    this.setStateWithFormat=this.setStateWithFormat.bind(this);
  }


  componentWillMount() {
    let seconds=60-moment().seconds();
    console.log('clock segundos to:',seconds);
     setTimeout(this.toSet,seconds*1000);
  }

  toSet(){
    this.currentTime=this.now();
    this.setStateWithFormat();
    this.setIntervalClock();
  }

  setStateWithFormat(){
    this.setState({displayTime:this.currentTime.format('HH:mm - dddd D/MM')});
  }
  componentWillUnmount(){
    this.clearTimeOuts();
  }
  clearTimeOuts(){
    clearInterval(this.intervalClock)
  }
  setIntervalClock(){
    if(this.intervalClock)
      return null;
    this.intervalClock=setInterval(this.toSet,60000)
  }

  now() {
    let server    = storage.getItem('server_time');
    const init     = storage.getItem('local_time');
    const now  = moment();
    server= moment(server);
    const difference = server.diff(init, 'minutes');
    return now.add(difference,'minutes');
  }
  render() {
    return <div>{this.state.displayTime}</div>
  }
}

export default Clock
