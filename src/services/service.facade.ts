import hanaDbConnection from "./hana-db.service";
import serviceLayerSession from "./service-layer-session.service";
import incidentLogger from "./incident-logger.service";

class ServiceFacade {
    public hanaDb = hanaDbConnection;
    public serviceLayer = serviceLayerSession;
    public logger = incidentLogger;
}

export default new ServiceFacade();