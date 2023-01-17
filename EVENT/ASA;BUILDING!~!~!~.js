if(!publicUser) {
    if(AInfo["Flood Zone"] == "Y") {
        addStdCondition("General", "FEMA Documents", capId);
    }
}