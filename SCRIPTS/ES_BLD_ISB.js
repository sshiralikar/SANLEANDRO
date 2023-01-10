if(!matches(currentUserGroup,"BuildingAdmin","BuildingDailyUser","BuildingSupervisorUser") && !matches(inspType,"Courtesy Inspection") && capStatus != "Issued" && capStatus != "Ready for Inspection")
{
    showMessage = true;
    comment("<font size = small><b>Permit not Issued:</b></font><br><br>This permit has not been issued. An inspection cannot be scheduled on a permit that has not been issued. Issue the permit from the workflow and then schedule inspections.<br><br>");
    cancel=true;
}
else if(publicUser && !matches(inspType,"0008 Courtesy Inspection") && capStatus != "Issued" && capStatus != "Ready for Inspection")
{
    showMessage = true;
    comment("<font size = small><b>Permit not Issued:</b></font><br><br>This permit has not been issued. An inspection cannot be scheduled on a permit that has not been issued.<br><br>");
    cancel=true;
}
else if(matches(inspType,"3000 Final - Building Permit")  && publicUser && appHasCondition(null,"Not Met",null,null))
{
    showMessage = true;
    comment("<font size=small><b>Active Condition</b></font><br><br>There is an active not met condition on this record. A building final inspection cannot be scheduled on a record with a condition that has not been met.<br><br>");
    cancel=true;
}