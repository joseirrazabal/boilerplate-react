import './focus.css';
import './spatial_navigation';
import settings from './settings';

import React, { Component } from 'react';

class Focus extends Component {
  componentDidMount() {
    // Initialize
    window.SpatialNavigation.init();

    let areas=[{
        name:'header-top',
        config:{
          selector: '.header-top .focusable',
          /*defaultElement: '.active',*/
          enterTo: 'default-element',
          leaveFor:{down:'.header-down .focusable'},
        }
      },
      {
        name:'nav_down',
        config:{
          selector: '.header-down .focusable',
          leaveFor:{
            right:'.fromVMenu .focusable:first-child',
          },
          enterTo: 'default-element',
          defaultElement: '.active',
        }
      },
      {
        name:'keyboard',
        config:{
          selector:'.keyboard .notModal .focusable',
          leaveFor:{right:'.results .focusable'},
        }
      },
      {
        name:'keyboard_pin',
        config:{
          selector:'.keyboard .modal .focusable',
          leaveFor:{right:'.right .focusable'},
        }
      },
      {
        name:'main_container',
        config:{
          selector: '.container .focusable',
          defaultElement: '.elementopredeterminado',

          //leaveFor:{up:'.header-down .focusable',right:':focus'},
          leaveFor:{left:'.header-down .focusable',right:':focus'},
        }
      },
      {
        name:'player_controls',
        config:{
          selector: '.player-ui-controls .focusable',
        }
      },
      {
        name:'mini-epg',
        config:{
          selector: '.player-ui-epg .focusable',
        }
      },

      {
        name: 'epg_cover_flow',
        config: {
          selector: '.epg-cover-flow .focusable',
          restrict: 'self-only',
        }
      },

      {
        name: 'colors',
        config: {
          selector: '.color-codes .focusable'
        }
      },

      {
        name:'epg',
        config:{
          selector: '.full-epg .epg-events-container .focusable',
          restrict: 'self-only',
        }
      },

      {
        name:'fin_player',
        config:{
          selector: '.end-player .focusable',
          defaultElement: '.focusable-default',
          enterTo: 'default-element',
        }
      },

      {
        name:'modal-area-top',
        config:{
          selector: '.modal-overlay .vcard-seasons .focusable',

          /* defaultElement: '.elementopredeterminado',
           enterTo: 'default-element',  */
           leaveFor:{down:'.modal-overlay  .ribbon-container .focusable'},



          restrict: 'self-only',
        }
      },

      {
        name:'modal-area',
        config:{
          selector: '.modal-overlay .focusable',
          defaultElement: '.modal-default-item',
         /* defaultElement: '.elementopredeterminado',
          enterTo: 'default-element',
          leaveFor:{up:'.header-down .focusable'},

          */

          restrict: 'self-only',
        }
      },

      {
        name:'epg-channels',
        config:{
          selector: '.channels-wrapper .focusable',
        }
      },


    ]

    areas.map(x=>{

      window.SpatialNavigation.add(x.name,x.config);
    })

    // Define navigable elements (anchors and elements with "focusable" class).
    /*window.SpatialNavigation.add({
      id: settings.id,
      main: settings.main,
      selector: settings.selector,

      // We can define our own filter function.
      navigableFilter: function (elem) {
        return elem.className.indexOf(settings.filterout) < 0;
      }
    }); */

    const enterUpHandler = function (e) {
      console.log('Playerinterval focus container send clic to> ', e.target);
      e.target.click();
    };
    const enterDownHandler = function (e) {
      e.preventDefault();

      //console.info(' [PS4] FOCUS DEBUG MemInfo ==============');
      //console.info(window.WM_devSettings.memoryInfo);
    };

    window.addEventListener('sn:enter-up', enterUpHandler);
    window.addEventListener('sn:enter-down', enterDownHandler);

    // Make the *currently existing* navigable elements focusable.
    window.SpatialNavigation.makeFocusable();

    // Focus the first navigable element.
    window.SpatialNavigation.focus();
  }

  render() {
    console.log("render focus");
    return (
      <div className="focus-container" />

    )
  }
}

export default Focus;
