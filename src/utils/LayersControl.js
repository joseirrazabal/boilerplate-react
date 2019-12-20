import m from 'moment';
import storage from '../components/DeviceStorage/DeviceStorage';
import channels from './data/channels';
import Device from './../devices/device';
import ActivesSingleton from './../components/Header/ActivesSingleton';
import * as playerConstant from './playerConstants';
import settings from '../devices/all/settings';


class LayersControl {

  static MenuReference = null;
  static UXReference = null;
  static playerReference=null;
  static lastFocus=null;
  static getFocus(){
    const modal = document.getElementsByClassName('modal-overlay');
    if(modal.length===0){
      const elementoPredeterminadoFocus=window.SpatialNavigation.focus('.elementopredeterminado');
      if(!elementoPredeterminadoFocus){
        const ribbonFocus=window.SpatialNavigation.focus('.scroller-container .focusable');
        if(!ribbonFocus){
          window.SpatialNavigation.focus('.focusable');
        }
      }
    }

  }

  static showMenu() {
    if (!LayersControl.isMenuVisible()) {
      LayersControl.setVisible(LayersControl.MenuReference);
      setTimeout(this.getFocus,300);
    }
  }
  static hideMenu() {
    if (LayersControl.isMenuVisible()) {
      LayersControl.setHidden(LayersControl.MenuReference);
    }
  }

  static showUX(hideUX=true)
  {
    if(!LayersControl.isUXVisible())
    {
      LayersControl.setVisible(LayersControl.UXReference);
      setTimeout(this.getFocus,300);
    }
    if(!LayersControl.isMenuVisible())
    {
      LayersControl.setVisible(LayersControl.MenuReference);
    }
    if(LayersControl.isPlayerVisible() && hideUX)
    {
      LayersControl.setHidden(LayersControl.playerReference);
    }
  }
  static showPlayer(hideUX=true)
   {
     if(!LayersControl.isPlayerVisible())
     {
       LayersControl.setVisible(LayersControl.playerReference);
     }
     if(LayersControl.isUXVisible() && hideUX)
     {
       LayersControl.setHidden(LayersControl.UXReference);
     }
     if(LayersControl.isMenuVisible() && hideUX)
     {
       LayersControl.setHidden(LayersControl.MenuReference);
     }
   }
   static hideUX(showPlayer=true)
   {
     if(LayersControl.isUXVisible())
     {
       LayersControl.setHidden(LayersControl.UXReference);
     }
     if(!LayersControl.isPlayerVisible() && showPlayer)
     {
       LayersControl.setVisible(LayersControl.playerReference);
     }
     if(LayersControl.isMenuVisible() && showPlayer)
     {
       LayersControl.setHidden(LayersControl.MenuReference);
     }

   }
  static hidePlayer(showUX=true)
  {
    if(LayersControl.isPlayerVisible())
    {
      LayersControl.setHidden(LayersControl.playerReference);

    }
    if(!LayersControl.isUXVisible() && showUX)
    {
      LayersControl.setVisible(LayersControl.UXReference);
    }
    if(!LayersControl.isMenuVisible() && showUX)
    {
      LayersControl.setVisible(LayersControl.MenuReference);
    }

  }

  static isMenuVisible()
  {
    LayersControl.getReferences();
    return LayersControl.checkVisibility(LayersControl.MenuReference);
  }

  static isUXVisible(showPlayer=true)
  {
    LayersControl.getReferences();
    return LayersControl.checkVisibility(LayersControl.UXReference);
  }

  static isPlayerVisible(showPlayer=true)
  {
    LayersControl.getReferences();
    let re=LayersControl.checkVisibility(LayersControl.playerReference);
    return re;
  }
  static checkVisibility(element=null){
    if(element && element.style)
    {

      switch(element.style.display)
      {
        case "none":
          return false;
          break;
        case "":
        case "block":
        default:
          return true;
      }
    }
    else
      return false;
  }

  static setVisible(element=null){
    if(element && element.style) {
      element.style.display ="block";
    }
  }

  static setHidden(element=null){
    if(element && element.style) {
      element.style.display ="none";
      element.style.top=settings.full_player_position_top;
      element.style.left=settings.full_player_position_left;
      element.style.width=settings.full_player_position_width;
      element.style.height=settings.full_player_position_height;
    }
  }
  static getReferences(){
    if(LayersControl.MenuReference == null) {
      LayersControl.MenuReference = document.getElementById("navHeader");
    }
    if(LayersControl.UXReference == null) {
      LayersControl.UXReference = document.getElementById("uxMain");
    }
    if(LayersControl.playerReference == null) {
      LayersControl.playerReference = document.getElementById("playerMain");
    }
  }
  static goTo(destination=null, extradata={})
  {
    LayersControl.showUX();
    //window.location=
    if(destination) {
      console.log('TODO GO TO', destination, extradata);
    }
  }
}

export default LayersControl;
