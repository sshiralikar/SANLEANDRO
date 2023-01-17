if(!publicUser) {
    if(AInfo["Flood Zone"] == "Y") {
        addStdCondition("Building", "FEMA Documents", capId);
    }
}