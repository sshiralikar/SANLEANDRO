showDebug = true;
if(inspType == "2030 Final Electrical" &&
    isTaskActive("Inspection") &&
    (inspResult == "Finaled" || inspResult == "Pass") &&
    isAllConditionsMet(capId) &&
    balanceDue <= 0)
{
    var flag = true;
    var relChildren = getChildren("Building/*/*/*", capId);
    if (!matches(relChildren, null, false)) {
        for (var r in relChildren) {
            var capDetailObjResult = aa.cap.getCapDetail(relChildren[r]);            // Detail
            if (capDetailObjResult.getSuccess())
            {
                capDetail = capDetailObjResult.getOutput();
                var vBalanceDue = capDetail.getBalance();
                if(parseFloat(vBalanceDue) > 0 || !isAllConditionsMet(relChildren[r]))
                    flag = false;
            }
        }
    }
    if(flag)
    {
        updateTask("Inspection"," Final Inspection Complete","","");
        aa.workflow.adjustTask(capId, "Inspection", "N", "Y", null, null);
        updateAppStatus("Finaled","Updated through script");

        var relChildren = getChildren("Building/*/*/*", capId);
        if (!matches(relChildren, null, false)) {
            for (var r in relChildren) {
                updateAppStatus("Finaled","Updated through script",relChildren[r]);
                updateTask("Inspection"," Final Inspection Complete","","","",relChildren[r]);
                aa.workflow.adjustTask(relChildren[r], "Inspection", "N", "Y", null, null);
            }
        }
    }
}

function isAllConditionsMet(vCapId)
{
    var condResult = aa.capCondition.getCapConditions(vCapId);
    if (condResult.getSuccess()) {
        var capConds = condResult.getOutput();
        for (var cc in capConds) {
            var thisCondX = capConds[cc];
            var cNbr = thisCondX.getConditionNumber();
            var thisCond = aa.capCondition.getCapCondition(vCapId,cNbr).getOutput();
            var cStatus = thisCond.getConditionStatus();
            //var isCOA = thisCond.getConditionOfApproval();
            if(matches(cStatus, "Not Met", "Applied"))
            {
                return false;
            }
        }
    }
    return true;
}