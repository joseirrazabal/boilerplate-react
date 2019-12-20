import AbstractSystem from "../all/AbstractSystem";

class ArrisSystem extends AbstractSystem {
    
    exit() {
        window.open('/node/home', '_self', ''); // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
        window.close();
    }
}

export default ArrisSystem;
