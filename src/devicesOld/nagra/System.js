import AbstractSystem from "../all/AbstractSystem";

class NagraSystem extends AbstractSystem {

    getDisplayResolution() {
        return {
            width: (window.innerWidth !== null ? window.innerWidth : document.body !== null ? document.body.clientWidth : null),
            height: (window.innerHeight !== null ? window.innerHeight : document.body !== null ? document.body.clientHeight : null)
        };
    }

    exit() {
        window.open('/node/home', '_self', ''); // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
        window.close();
    }
}

export default NagraSystem;
