//Update appStatus when final workflow task is complete
if(capStatus == "Complete-Fixed")
    updateAppStatus("Closed-Fixed");
if(capStatus == "Complete-Duplicate")
    updateAppStatus("Closed-Duplicate");
if(capStatus == "Complete-Referred")
    updateAppStatus("Closed-Referred");
if(capStatus == "Complete-No Violation")
    updateAppStatus("Closed-No Violation");