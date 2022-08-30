showDebug = false;
showMessage = false;
if(matches(currentUserID,"KHOBDAY","ADMIN"))
    showDebug = 1;
if(appMatch("Building/OTC/*/*"))
    include("ES_BLD_CTRCA");