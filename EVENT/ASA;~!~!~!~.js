//Application Submit After Event Entry Point
showDebug = false;
showMessage = false;
if(matches(currentUserID,"KHOBDAY","MNICCORE","ADMIN","SSHIRALIKAR"))
    showDebug = 1;
if(appMatch("Planning/Project/*/*"))
    include("ES_ENTITLEMENT_LOOP");
if(appMatch("Building/*/*/*"))
    include("ES_BLD_ASA");
if(appMatch("Planning/*/*/*"))
    include("ES_PLN_ASA");

//#GIS Interface
copyParcelGisObjects();
if(appMatch("Building/*/*/*")) {
    correctParcelData();
    copyGISDataToCustomFields(capId);
}

//GQ_CSLB_INTERFACE
if(!publicUser) {
	include("GQ_CSLB_SYNC_TRANSACTIONAL_LP");
}