if(!publicUser) {
    if(getAppSpecific("Flood Zone", capId) == "Y") {
        addStdCondition("General", "FEMA Documents", capId);
    }
}