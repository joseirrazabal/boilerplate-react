import React, { Component } from "react";
import { connect } from "react-redux";

import RequestManager from "../../../requests/RequestManager";
import ReminderListTask from "../../../requests/tasks/user/ReminderListTask";
import Reminder from "./Reminder";
import PropTypes from "prop-types";

import ModalConductor from "../../../containers/Modal";
import { showModal, MODAL_ACCIONES_RECORDATORIO } from "../../../actions/modal";
import ReminderNotifications from "../../../utils/RemindersNotifications/ReminderNotifications";
import Device from "../../../devices/device";
import { playFullMedia } from "../../../actions/playmedia";
import Translator from "../../../requests/apa/Translator";
import Utils from "../../../utils/Utils";

class ContentReminders extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      data: []
    };

    this.rememeberRequest = new ReminderListTask();
    /* TODO someone forgot to do something with this */
    this.focusId;
    this.channel_group_id;
    this.device = Device.getDevice().getPlatform();
    this.focusHandler = this.focusHandler.bind(this);
  }

  componentWillMount() {
    this.stateHandler();
  }

  componentDidMount() {
    this.loading=false;
    let that = this;
    let keys = Device.getDevice().getKeys();

    document
      .getElementById("frameReminders")
      .addEventListener("keydown", function(e) {
        e.preventDefault();

        that.keyActions(keys.getPressKey(e.keyCode));
      });
  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
    window.SpatialNavigation.focus();

  }

  focusHandler(data) {
    this.focusId = document.activeElement.id;
    this.channel_group_id = document.activeElement.dataset.channelGroupId;
  }

  locationHandler(channel_group_id) {
    this.props.playFullMedia({
      playerstate: "PLAYING",
      source: {
        //videoid: 764423
        videoid: channel_group_id
      },
      size: {
        top: 0,
        left: 0,
        width: 1280,
        height: 720
      },
      ispreview: false,
      islive: true,
      ispip: false
    });
  }

  stateHandler() {
    this.loading=true;
    RequestManager.addRequest(this.rememeberRequest)
      .then(resp => {
        this.loading=false;
        if (resp.response) {
          if(Array.isArray(resp.response)){
            this.setState({ data: resp.response });
          }
          else{
            this.setState({ data: [] });
          }
        } else {
          this.setState({ data: [] });
        }
      })
      .catch(err => {
        this.loading=false;
        console.error(err);
      });
  }

  keyActions(key) {
    const showModal = this.props.showModal;
    const modal = document.getElementsByClassName("modal-overlay");

    switch (key) {
      case "YELLOW":
        if (
          modal.length === 0 &&
          this.focusId &&
          this.focusId === document.activeElement.id
        ) {
          let serviceToUpdate =
            document.activeElement.parentNode.parentNode.parentNode.id;

          showModal({
            modalType: MODAL_ACCIONES_RECORDATORIO,
            modalProps: {
              reminder_id: this.focusId,
              channel_group_id: this.channel_group_id,
              service: () => {
                this.stateHandler();
                ReminderNotifications.setReminders(
                  30,
                  false
                ); /*añadir llave apa*/
              },
              relocation: value => {
                this.locationHandler(value);
              }
            }
          });
        }
        break;
    }
  }

  render() {
    let arr = [];
    let showArrow = false;
    let jsonReminderList, hideReminders, hideNoReminders;
    const styleHide = { display: "none" };

    if (this.state.data.length === 0 && this.loading===false) {
      hideReminders = styleHide;
    } else {
      let json = this.state.data;
      let that = this;
      showArrow = this.state.data.length > 2 ? true : false;
      hideNoReminders = styleHide;
      jsonReminderList = json.map(function(json, i) {
        let data = json.data;
        if(data!==null){
          let date = new Date();
          let dd = date.getDate();
          let mm = date.getMonth() + 1;
          let yyyy = date.getFullYear();
          let today = `${yyyy}${mm}${dd}`;
          let responseDate = json.exp_date.toString();
          let reminderDate = responseDate.substring(0, 8);
          reminderDate = `${reminderDate.slice(6)}/${reminderDate.slice(
            4,
            6
          )}/${reminderDate.slice(0, 4)}`;
          let reminderTime = responseDate.substring(8, 12);
          reminderTime = `${reminderTime.slice(0, 2)}:${reminderTime.slice(2)}`;
          let schedule;
  
          if (responseDate.indexOf(today) != -1) {
            schedule = `${Translator.get('recording_today_format', 'Hoy')} ${reminderTime} ${Translator.get('recording_hour_format', 'HS')}`;
          } else {
            schedule = `${reminderDate} ${reminderTime}  ${Translator.get('recording_hour_format', 'HS')}`;
          }
          return (
            <Reminder
              key={i}
              id={json.id}
              img={data.ext_eventimage_name == "" ? data.channel_image == "" ? "" : data.channel_image : data.ext_eventimage_name}
              title={data.name}
              channel={
                data.channel_group &&
                data.channel_group.common &&
                data.channel_group.common.title
                  ? data.channel_group.common.title
                  : data.channel_name
              }
              focusHandler={that.focusHandler}
              channel_group_id={data.channel_group_id}
              schedule={schedule}
            />
          );
        }
      });
    }

    return (
      <div id="" className="ContentReminders">
        <p style={hideReminders}>{this.props.text}</p>
        <div
          id="frameReminders"
          style={hideReminders}
          className="frameReminders invisible-scrollbar"
        >
          {jsonReminderList}
        </div>
        {showArrow && (
          <i className="fa fa-chevron-down flecha" aria-hidden="true" />
        )}
        <ul style={hideReminders} className="color-codes color-codes-reminder">
          <li className="color-code-item">
            {Translator.get("show-option-message-1", "Presione")}{" "}
            <span className="color-ball yellow" />{" "}
            {Translator.get("show-option-message-2", "para ver más opciones")}
          </li>
        </ul>

        <div className="message-box" style={hideNoReminders}>
          <h2>
            {Translator.get(
              "reminder-empty-list",
              "Tu lista de recordatorios está vacía"
            )}
          </h2>
          <p>
            {Translator.get(
              "how-to-add-reminder-1",
              "Para agregar, recorre la grilla de programación y ahí verás el ícono"
            )}{" "}
            <i className="fa fa-clock-o fa-2" aria-hidden="true" />.{Translator.get(
              "how-to-add-reminder-2",
              "Haz click con el OK de tu control remoto y recibirás una notificación antes de que comience tu programa."
            )}{" "}
            <br />
            {Translator.get(
              "how-to-add-reminder-3",
              "IMPORTANTE: Sólo puedes agendar programación futura, no presente"
            )}{" "}
          </p>
        </div>
      </div>
    );
  }
}

export default connect(null, { showModal, playFullMedia })(ContentReminders);
