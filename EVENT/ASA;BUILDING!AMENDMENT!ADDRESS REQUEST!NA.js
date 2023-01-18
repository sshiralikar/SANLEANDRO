var vParentId = getParent();
if (vParentId != null && vParentId != false && vParentId != "undefined") {
    copyContacts(vParentId, capId);
    copyParcels(vParentId,capId);
    copyOwnersByParcel();
    copyAddresses(vParentId, capId);
    //updateWorkDesc(vParentId,capId);
    copyAdditionalInfo(vParentId,capId);
    aa.cap.copyCapDetailInfo(vParentId,capId);
    aa.cap.copyCapWorkDesInfo(vParentId,capId);
    editAppName(getAppName(vParentId),capId);
}
function getAppName() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    { logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false }

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}
function copyAdditionalInfo(srcCapId, targetCapId)
{
    //1. Get Additional Information with source CAPID.  (BValuatnScriptModel)
    var  additionalInfo = getAdditionalInfo(srcCapId);
    if (additionalInfo == null)
    {
        return;
    }
    //2. Get CAP detail with source CAPID.
    var  capDetail = getCapDetailByID(srcCapId);
    //3. Set target CAP ID to additional info.
    additionalInfo.setCapID(targetCapId);
    if (capDetail != null)
    {
        capDetail.setCapID(targetCapId);
    }
    //4. Edit or create additional infor for target CAP.
    aa.cap.editAddtInfo(capDetail, additionalInfo);
}

//Return BValuatnScriptModel for additional info.
function getAdditionalInfo(capId)
{
    bvaluatnScriptModel = null;
    var s_result = aa.cap.getBValuatn4AddtInfo(capId);
    if(s_result.getSuccess())
    {
        bvaluatnScriptModel = s_result.getOutput();
        if (bvaluatnScriptModel == null)
        {
            aa.print("WARNING: no additional info on this CAP:" + capId);
            bvaluatnScriptModel = null;
        }
    }
    else
    {
        aa.print("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
        bvaluatnScriptModel = null;
    }
    // Return bvaluatnScriptModel
    return bvaluatnScriptModel;
}

function getCapDetailByID(capId)
{
    capDetailScriptModel = null;
    var s_result = aa.cap.getCapDetail(capId);
    if(s_result.getSuccess())
    {
        capDetailScriptModel = s_result.getOutput();
        if (capDetailScriptModel == null)
        {
            aa.print("WARNING: no cap detail on this CAP:" + capId);
            capDetailScriptModel = null;
        }
    }
    else
    {
        aa.print("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
        capDetailScriptModel = null;
    }
    // Return capDetailScriptModel
    return capDetailScriptModel;
}
