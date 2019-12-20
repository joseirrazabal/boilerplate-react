import storage from '../components/DeviceStorage/DeviceStorage';
import Metadata from '../requests/apa/Metadata'
import Utils from "../utils/Utils";

class LoginRegister {

    constructor() {      
      //  REGISTRO MEXICO TELCEL & MAIL
      this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"email\",\"active\":\"true\"}],\"register\":[{\"id\":\"email\",\"active\":\"true\"}]},\"mexico\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]}}";
    //  REGISTRO MEXICO SOLO MAIL
    // this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]},\"mexico\":{\"login\":[{\"id\":\"email\",\"active\":\"false\"}],\"register\":[{\"id\":\"email\",\"active\":\"false\"}]}}";
    //  REGISTRO MEXICO SOLO TELCEL
    // this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]},\"mexico\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"}]}}";
    //  LOGIN MEXICO TELCEL & MAIL
    // this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]},\"mexico\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"false\"}]}}";
    //  LOGIN MEXICO SOLO MAIL
    // this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]},\"mexico\":{\"login\":[{\"id\":\"email\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"false\"}]}}";
    //  LOGIN MEXICO SOLO TELCEL
    // this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]},\"mexico\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"}]}}";
    // THREE OPTIONS
    //   this.login_register_options = "{\"default\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"},{\"id\":\"login_facebook\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"},{\"id\":\"login_facebook\",\"active\":\"false\"}]},\"mexico\":{\"login\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"},{\"id\":\"login_facebook\",\"active\":\"false\"}],\"register\":[{\"id\":\"sso_mobile\",\"active\":\"false\"},{\"id\":\"email\",\"active\":\"true\"},{\"id\":\"login_facebook\",\"active\":\"false\"}]}}";
    }


    getFormTabsEnable(type) {
      const defaultValues = this.login_register_options;

        const region = storage.getItem("region");
        const loginRegister = Metadata.get('login_register_options', defaultValues);
        const loginRegisterParse = JSON.parse(loginRegister);
        const loginRegisterRegion = loginRegisterParse[region] ? loginRegisterParse[region] : loginRegisterParse['default'];
        
        if(typeof loginRegisterRegion === 'object' && type !== undefined) {
            return loginRegisterRegion[type];
        }

        return null;
    }

    isDefaultConfig(){
      const defaultValues = this.login_register_options;
        const region = storage.getItem("region");
        const loginRegister = Metadata.get('login_register_options', defaultValues);
        const loginRegisterParse = JSON.parse(loginRegister);
        if(loginRegisterParse[region]) {
            return false;
        } else {
            return true;
        }
    }

    isTabEnable(formType, tabName) {
        const listTabs = this.getFormTabsEnable(formType);

        if(typeof tabName === 'string' && typeof tabName === 'string' && listTabs) {
            const filterTab = listTabs.filter(tab => tab.id === tabName);
            return filterTab.length > 0;
        }
        return false;
    }

    getActiveTab(formType) {
        const listTabs = this.getFormTabsEnable(formType);

        if(typeof formType === 'string' && listTabs) {
            const filterTab = listTabs.filter(tab => tab.active === true);
            return filterTab.length > 0 ? filterTab[0] : null;
        }
    }
    
    activeTabElement(id) {
        const activeElement = document.getElementById(id);
        if(id && activeElement) {
            activeElement.click();
        } else {
            const formTabSesion = document.getElementById('form-tab-sesion');
            if(formTabSesion) {
                if(formTabSesion.childNodes.length > 0) {
                    formTabSesion.childNodes[0].click();
                }
            }
        }
    }
    
    defaultTabOpen(form_type, defaultActive) {
        const activeTab = this.getActiveTab(form_type);
        
        if(activeTab) {
            this.activeTabElement(`${form_type}_${activeTab.id}`);
        } else {
            this.activeTabElement(defaultActive);
        }
    }

    focusFromTab(father){
        setTimeout(()=>{
            let child = Utils.getClassById(father, "form-group-focus");
            child && Utils.eventFire(child,"click")
          }, 500);
    }
}

export default new LoginRegister();
