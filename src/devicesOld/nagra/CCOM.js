if (window.parent.CCOM) {
	console.log("[NAGRA] real CCOM API available, no need for CCOM stubs");
} else {
	console.log("[NAGRA] CCOM not available, using stubs...");

	require("./CCOM_stubs/CCOMStub"); // Stubs for CCOM methods, attaches fake CCOM to window
}

const CCOM = window.parent.CCOM; // either Stub or real CCOM will be attached to window object

export default CCOM;


/**
 * Notas:
 *
 * Player:
 *  para saber la posicion actual del player se puede accesar a la propiedad position o realTimePosition de playerInstance
 *
 * IrdEvents (mail, cmd, etc):
 *  para obtener los mensajes del backend se necesita llamar a la CCOM.ConditionalAccess.getIrdAllMail()
 *  y suscribirse al evento onIrdMailNew
 *
 * Scheduler:
 *  Se puede usar addJob para agregar tareas que deben repetirse cada X tiempo
 *
 **/
