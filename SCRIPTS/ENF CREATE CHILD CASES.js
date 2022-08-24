newAppId = createChild(newAppL1,newAppL2,newAppL3,newAppL4,newAppDesc);
if(newAppId)
{
    copyAppSpecific(newAppId);
    updateAppStatus("Investigation Pending","Updated by Script",newAppId);
    holdCapId = capId ; capId = newAppId; closeTask("Case Intake","Assigned","",""); 
    scheduleInspectDate("Initial Investigation",dateAdd(null,1,true)); 
    capId = holdCapId;
    aa.cap.copyCapWorkDesInfo(capId, newAppId);
    editPriority(AInfo["Priority"],newAppId);
}
