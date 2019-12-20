import RequestManager from "../../requests/RequestManager";
import ReminderListTask from "../../requests/tasks/user/ReminderListTask";
import storage from '../../components/DeviceStorage/DeviceStorage';
import Metadata from '../../requests/apa/Metadata';
import moment from 'moment';
import Utils from "../Utils";

class ReminderNotifications {
    constructor() {
        this.ReminderService = new ReminderListTask();
        this.jsonReminders = [];
        this.notificationFunction = ()=>{};
        this.getReminders = this.getReminders.bind(this);
        this.setReminders = this.setReminders.bind(this);
        this.requestHandler = this.requestHandler.bind(this);
        this.setIntervalNotifications = this.setIntervalNotifications.bind(this);
    }

    async requestHandler() {
        let result;
        try {
        result = await RequestManager.addRequest(this.ReminderService);
            return new Promise((resolve, reject) => {
              if(result.response && Array.isArray(result.response)){
                let found=result.response.find(it=> typeof it.data === 'string');
                if(found){
                  result.response=Utils.parseData(result.response);

                }
                resolve(result.response);
              }
              else{
                resolve([]);
              }
              //resolve((result.response) ? result.response : []);
            });
        } catch(err) {
            return [];
        }
    }

    async getReminders(minutes = 0) {
        let responseReminders = await this.requestHandler();
        if (!Array.isArray(responseReminders)) responseReminders = [];
        let jsonReminderList;

        jsonReminderList = responseReminders.map(json=>{
            let swapArray = [];
            let data = json.data;
            let timeoutId=null;
            
            this.jsonReminders.map(it=>{
                if(it.reminder_id==json.id){
                    timeoutId = it.timeoutId;
                }
            });

            let todayTimestamp = this.now().unix();
            let todayTimestampSum = this.now().add(minutes, 'minutes').unix();
            let responseDate = json.exp_date.toString();
            let reminderDate = responseDate.substring(0,8);
            let reminderTime = responseDate.substring(8,12);
            reminderTime = `${reminderTime.slice(0, 2)}:${reminderTime.slice(2)}:00`;
            let reminderTimestamp = moment(`${reminderDate.slice(0, 4)}-${reminderDate.slice(4, 6)}-${reminderDate.slice(6)} ${reminderTime}`, "YYYY-MM-DD HH:mm:ss").unix();

            if ( reminderTimestamp >= todayTimestamp && reminderTimestamp < todayTimestampSum ) {
                swapArray = { reminder_id: json.id, event_name: data.name, channel_name:data.channel_name, channel_id: json.channel_id, notificationTime: reminderTime, channel_number: data.channel_number, timeoutId: timeoutId };
                return swapArray;
            }
        });

        jsonReminderList = jsonReminderList.filter(Boolean);

        return jsonReminderList;
    }

    async setReminders(minutes = 0, init = true) {
        this.jsonReminders = await this.getReminders(minutes);

        if (init) {this.setIntervalNotifications( parseInt( Metadata.get("sentinel_notifications_interval", 30) ) );}
        else
        {
          this.launchReminderNotification( parseInt(Metadata.get("sentinel_notifications_interval", 30))*60000);

        }
    }

    clearTimeoutReminder = (reminderId) =>{
        this.jsonReminders = this.jsonReminders.map(json=>{
            if(json.reminder_id==reminderId){
                clearTimeout(json.timeoutId);
                json.timeoutId=null;
            }
            return json;
        });
    }

    showReminders() {
        console.error('Los reminders son:', this.jsonReminders);
    }

    setIntervalRemindersSync(minutes, cb) {
        let that = this;
        let intervalTime = minutes * 60000;
        this.notificationFunction = cb;

        this.setReminders(minutes);

        if (this.sentileInterval) clearInterval(this.sentileInterval);

        this.sentileInterval = setInterval(function(){
            that.setReminders(minutes);
        }, intervalTime);
    }

    setIntervalNotifications(minutes) {
        let that = this;
        let intervalTime = minutes * 60000;

        if (!this.setNotification) this.launchReminderNotification(minutes);

        this.setNotification = setInterval(function() {
            that.launchReminderNotification(minutes);
        }, intervalTime);
    }

    launchReminderNotification(minutes) {
        if ( this.jsonReminders.length > 0 ) {
            this.jsonReminders=this.jsonReminders.map(json=> {
                console.log('recorriendo reminders',json);
                let timeSet;
                let nowTimestamp = this.now().unix();
                let nowTimestampSum = this.now().add(minutes, 'minutes').unix();
                let notificationTime = json.notificationTime.split(':');
                let reminderTimestamp = moment(`${notificationTime[0]}:${notificationTime[1]}`, "HH:mm").unix();

                if (reminderTimestamp >= nowTimestamp && reminderTimestamp < nowTimestampSum) {
                  timeSet = (reminderTimestamp - nowTimestamp)*1000;

                  console.log('[ReminderNotifications] launchReminderNotification ' + json.event_id,
                    ' ' + json.event_name,
                    '\nremindertimestamp: '+reminderTimestamp,
                    '\nnowtimestamp:'+nowTimestamp,
                    '\nnowmasminutos:'+nowTimestampSum,
                    '\ntimeset (ms):'+timeSet,
                    '\ntimeset (min):'+timeSet/60000);
                    if(!json.timeoutId){
                        json.timeoutId=setTimeout(() => {
                            this.notificationFunction({
                              show:true,
                              title: `${json.event_name} ha comenzado`, msg: `${json.channel_number} - ${json.channel_name} `,
                              faClass: 'fa-clock-o',
                              type:'notification',
                            });
                        }, timeSet);
                    }
                    
                }
                return json;
            });
        }
    }

  now() {
    let server    = storage.getItem('server_time');
    const init     = storage.getItem('local_time');
    const now  = moment();
    server= moment(server);
    const difference = server.diff(init, 'minutes');
    return now.add(difference,'minutes');
  }
}

export default new ReminderNotifications;
