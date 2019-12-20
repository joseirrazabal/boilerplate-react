import CCOM from './CCOM';

class PPE {
    //constants
    PPV_TYPE_EVENT = "EVENT";
    PPV_TYPE_CHANNEL = "CHANNEL";

    constructor() {
    }

    makePurchaseObject(eventId, isPPVProduct, isSubscriptionProduct, customProduct, isImpulsive) {
        let purchaseObj = {
                        "eventId" : eventId,
                        "products" : []
                    };
        purchaseObj.isPPVProduct = isPPVProduct;
        purchaseObj.isSubscriptionProduct = isSubscriptionProduct;
        purchaseObj.isImpulsive = isImpulsive;
        purchaseObj.products.push(customProduct);
        return purchaseObj;
    }

    isPPVProduct(product) {
        if((product.flags === CCOM.ConditionalAccess.PURCHASABLE || product.flags === CCOM.ConditionalAccess.OFFLINE_PURCHASE ||
            product.flags === CCOM.ConditionalAccess.SMS_PURCHASE) &&
            (product.caType === CCOM.ConditionalAccess.EVENT || product.caType === CCOM.ConditionalAccess.EVENT_PACKAGE)){
                return true;
            } else {
                    return false;
                }
    }

    isSubscriptionProduct(product) {
        if(product.flags === CCOM.ConditionalAccess.PURCHASABLE &&
            (product.caType === CCOM.ConditionalAccess.SERVICE || product.caType === CCOM.ConditionalAccess.SERVICE_PACKAGE)) {
                return true;
            } else {
                return false;
            }
    }

    getPPVEventPurchaseInfo(event, eventInfo) {
        let products = eventInfo.products;
        let eventId = event.eventId;
        let isPPV = false;
        let isImpulsive = false;
        let isSubscription = false;
        let purchaseObject;

        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let customProductObj = {
                            "id" : product.id,
                            "cost" : product.cost
                        };
            if (this.isPPVProduct(product)) {
                customProductObj.type = this.PPV_TYPE_EVENT;
                if(product.flags === CCOM.ConditionalAccess.IMPULSIVE)
                    isImpulsive = true;
                    isPPV = true;
            } else if (this.isSubscriptionProduct(product)){
                customProductObj.type = this.PPV_TYPE_CHANNEL;
                isSubscription = true;
            }
            if (isPPV || isSubscription) {
                purchaseObject = this.makePurchaseObject(eventId, isPPV, isSubscription, customProductObj, isImpulsive);
            }
        }
        return purchaseObject;
    }

    getPurchasableObject(event) {
        let eventInfo = CCOM.ConditionalAccess.getEventInfo(event.eventId);
        let purchaseObject = null;
        if(eventInfo.caAccess === CCOM.ConditionalAccess.DENIED) {
            purchaseObject = this.getPPVEventPurchaseInfo(event, eventInfo);
            if (purchaseObject && !purchaseObject.isImpulsive) {
                return false;
            }
        }
        return purchaseObject;
    }

    getProductByType(purchaseObject, type) {
        if (purchaseObject.products) {
            for (let key in purchaseObject.products) {
                if (purchaseObject.product[key].type === this.PPV_TYPE_EVENT) return purchaseObject.products[key];
            }
        }
        return null; //where index is the index where type "EVENT" is available
    }

    makeCustomPurchaseHistoryObject(event, product) {
        let smartCardNumber = CCOM.ConditionalAccess.getSmartcardInfo().smartcardInfo.serialNumber;
        let resultQuery = CCOM.EPG.getServicesRSByQuery("name, channelKey", "(serviceId= '00a000040006')",null );
        let channelInfo = resultQuery.getNext(1);
        console.log('EDM: history object', event);
        return {
                    "stbid" : smartCardNumber,
                    "channr" : channelInfo[0].channelKey,
                    "channame" : channelInfo[0].name,
                    "isAdult" : event.isAdult,
                    "startTime" : event.startTime,
                    "eventname" : event.title,
                    "cost" : product.cost
                };
    }

    ppvEventPurchaseSuccessHandler(eventId, product) {
        let event = CCOM.EPG.getEventById(eventId);
        let purchaseList = '';//create a predefined purchase list if required
        let purchaseHistoryObj = this.makeCustomPurchaseHistoryObject(event, product);
        purchaseList.splice(0, 0, purchaseHistoryObj);
        CCOM.ConfigManager.setValue('teleidea/purchaselist', purchaseList)// set created/modified purchase list in configman
        if(event) {
            return true //tune to service
        } else {
            return false //set reminder to event
        }
    }

    doPPVEventPurchase(purchaseObject) {
        let product = this.getProductByType(purchaseObject, this.PPV_TYPE_EVENT);
        let inputObject = {
                        eventId : purchaseObject.eventId,
                        mode : CCOM.ConditionalAccess.OFFLINE,
                        productId : product.id
                    };
        let purchaseResult = CCOM.ConditionalAccess.purchaseProduct(inputObject);
        if (purchaseResult){
            return this.ppvEventPurchaseSuccessHandler(purchaseObject.eventId, product);
        } else {
            return false
        }
    }

    initiatePPVEventPurchase(eventObject) {
        let purchaseObject = (!eventObject.purchaseObject) ? (this.getPurchasableObject(eventObject)) : eventObject.purchaseObject;
        return this.doPPVEventPurchase(purchaseObject);
    }

    getEventCurrent(serviceId) {
        let event = CCOM.EPG.getEventCurrent(serviceId)

        return event;
    }
}

export default new PPE();
