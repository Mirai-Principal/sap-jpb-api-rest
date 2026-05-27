import hanaDbConnection from "./hana-db.service";
import serviceLayerSession from "./service-layer-session.service";

class ServiceFacade {
    public hanaDb = hanaDbConnection;
    public serviceLayer = serviceLayerSession;
}

export default new ServiceFacade();