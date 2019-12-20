import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Device from "../../devices/device";
// Sending info to the dashboard
import TrackerManager from '../../utils/TrackerManager';

const ModalExit = (props) => {
    const defaultTile = '¿Quieres salir de Claro video?';
    const defaultContent = '¿Estás seguro de que quieres salir?';
    let player = Device.getDevice().getPlayer();

    /*const getTrackerManager = () => {
        const dashboardTracker = new DashboardTracker();

        return new TrackerManager([ dashboardTracker ]);
    }*/

    const closeApp = () => {
         /*let trackerManager = getTrackerManager();*/
        const system = Device.getDevice().getSystem();
        console.warn('Attemping to close the app...');

        // When the user tries to leave the app and push the option 'salir', next line send info to the dashboard
        if (TrackerManager.leaveApp) {
          (player) ? TrackerManager.leaveApp(player.getCurrentTime()) : TrackerManager.leaveApp();
        }

        system.exit();
    }

    const p = {
      title: Translator.get('confirmacion_salir_exit', defaultContent),
       /* title: Translator.get('exit_title_msg', defaultTile),
        content: Translator.get('confirmacion_salir_exit', defaultContent),*/
        buttons: [
            {
                content: Translator.get('exit_btn_cancel_txt', 'Cancelar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.toggleVisibilityStatus)
                }
            },
            {
                content: Translator.get('exit_btn_exit_txt', 'Salir'),
                props: {
                    onClick: (e) => closeApp()
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalExit);
