import AbstractSystem from "../all/AbstractSystem";

class Web0sSystem extends AbstractSystem {
    
    exit(param) {
        //It doesn't close the app but it show the main manu instead.
        window.close();
        return;
    }
}

export default Web0sSystem;
