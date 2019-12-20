export default JSON.stringify( {
  "default":{
    "check_app_version":true,
    "seen_last_in_ribbon":true,
    "talents":true,
    "recommendations":true,
    "reminders_notification":true,
    "reminders_notification_npvr":true,
    "event_image_from_epg":true, //depends on the middleware,
    "scrolling_ribbon_home":true, //scrolling home, show two ribbons
    "transition":false, // Animate transition CSS active IMPORTANTE: depende de "scrolling_ribbon_home":true
  }
})
