/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ADDRESS_VALIDATE_CITY_LIMITS_BEFORE.js
| Event   : ACA Before (Before)
|
| Usage   : 
|
| Client  : San Leandro
| Action# : Query CityLimit layer and prevent ACA users from entering the address if outside the CityLimit layer
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = true; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = true;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

//TESTING
// var testingCap = aa.cap.getCapID("22TMP-000600").getOutput();
// var testingCap = aa.cap.getCapID("BRPOOL-22-0005").getOutput();
// var capModel = aa.cap.getCapViewBySingle4ACA(testingCap);
// var capTest = aa.env.setValue("CapModel", capModel);
// aa.env.setValue("CurrentUserID", "ADMIN");
//

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode() // Service Provider Code
    var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
    currentUserID = "ADMIN";
    publicUser = true
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj)
    currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var parcelArea = 0;

var estValue = 0;
var calcValue = 0;
var feeFactor // Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput(); // Calculated valuation
if (valobj.length) {
    estValue = valobj[0].getEstimatedValue();
    calcValue = valobj[0].getCalculatedValue();
    feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0;
var houseCount = 0;
feesInvoicedTotal = 0; // Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId); // Detail
if (capDetailObjResult.getSuccess()) {
    capDetail = capDetailObjResult.getOutput();
    var houseCount = capDetail.getHouseCount();
    var feesInvoicedTotal = capDetail.getTotalFee();
    var balanceDue = capDetail.getBalance();
}

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

// page flow custom code begin

try {
    // var showDebug = true; //testing

    var block = true;
    (function () {
        var parcelNum = null;
        var parcel = cap.getParcelModel();
        if(parcel) {
            //explore(parcel)
            if(parcel.parcelNo) {
                parcelNum = String(parcel.parcelNo);
            }
            logDebug(parcelNum)
            if(!parcelNum) {
                logDebug("No parcel number");
                return;
            }
            var obj = aa.gis.getParcelGISObjects(parcelNum).getOutput();
            if(!obj || !obj.length) {
                logDebug("No GIS objects");
                return;
            }
            if(obj) {
                var gisTypeScriptModel = obj[0];
                var buffObj = aa.gis.getGISType("SANLEANDRO", "CityLimit").getOutput();
                var bufferArr = aa.gis.getBufferByRadius(gisTypeScriptModel, 0, 'FEET', buffObj).getOutput();                 
                if(!bufferArr.length) {
                    logDebug("No buffer array");
                    return;
                }            
                var gisObj = bufferArr[0].getGISObjects();
                if(!gisObj.length) {
                    logDebug("Parcel Number does not exist within City Limit layer");
                    return;
                }
                block = false;                
            }           
        }
    })();

    if(block) {
        showMessage = true;
        cancel = true;
        comment("The address you have entered is outside San Leandro city limits.");
    }

    //aa.print(message);

    cancel = true;
    showMessage = true;
        if(!isDistrictValid())
        {
            cancel = true;
            showMessage = true;
            comment("Your location is outside of our area. Please contact the Oro Loma Sanitary District.");
        }




} catch (err) {
    logDebug(err);
    showMessage = true;
    comment("Error: " + err);
    aa.print(err)
}
// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage)
            aa.env.setValue("ErrorMessage", message);
        if (showDebug)
            aa.env.setValue("ErrorMessage", debug);
    } else {        
        aa.env.setValue("ScriptReturnCode", "0");
        if (showMessage) {
            aa.env.setValue("ScriptReturnMessage", message);            
        }            
        if (showDebug) {
            aa.env.setValue("ScriptReturnMessage", debug);            
        }
            
    }
}
function isDistrictValid()
{
    var parcel = cap.getParcelModel();
    if(parcel) {
        //explore(parcel)
        if (parcel.parcelNo) {
            ParcelValidatedNumber = String(parcel.parcelNo);
            logDebug("ParcelAttribute.SEWERDISTRICT: "+AInfo["ParcelAttribute.SEWERDISTRICT"]);
            var value =  getGISInfo("SANLEANDRO", "Parcels", "SEWERDISTRICT");
            logDebug("Val: "+ value);

            if(value == "Y")
                return true;
        }
    }

    return false;
}
function getGISInfo(svc,layer,attributename) // optional: numDistance, distanceType
{
    // use buffer info to get info on the current object by using distance 0
    // usage:
    //
    // x = getGISInfo("flagstaff","Parcels","LOT_AREA");
    // x = getGISInfo2("flagstaff","Parcels","LOT_AREA", -1, "feet");
    // x = getGISInfo2ASB("flagstaff","Parcels","LOT_AREA", -1, "feet");
    //
    // to be used with ApplicationSubmitBefore only

    var numDistance = 0
    if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
    var distanceType = "feet";
    if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
    var retString;

    var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
    if (bufferTargetResult.getSuccess())
    {
        var buf = bufferTargetResult.getOutput();
        buf.addAttributeName(attributename);
    }
    else
    { logDebug("**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }

    var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
    if (gisObjResult.getSuccess())
        var fGisObj = gisObjResult.getOutput();
    else
    { logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

    for (a1 in fGisObj) // for each GIS object on the Parcel.  We'll only send the last value
    {
        var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

        if (bufchk.getSuccess())
            var proxArr = bufchk.getOutput();
        else
        { logDebug("**ERROR: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }

        for (a2 in proxArr)
        {
            var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
            for (z1 in proxObj)
            {
                var v = proxObj[z1].getAttributeValues();
                for(var jj in v)
                    logDebug(v[jj]);
                retString = v[0];
            }
        }
    }

    return retString
}
function explore(objExplore) {
    logDebug("Methods:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) == "function") {
            logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
            logDebug("   " + objExplore[x] + "<br>");
        }
    }
    logDebug("");
    logDebug("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") logDebug("  <b> " + x + ": </b> " + objExplore[x]);
    }
}

function props(objExplore) {
    logDebug("Properties:")
    aa.print("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") {
            logDebug("  <b> " + x + ": </b> " + objExplore[x]);
            aa.print( x + " : " + objExplore[x]);
        }	
    }
}

function aaExplore(objExplore) {
    aa.print("Methods:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) == "function") {
            aa.print(x);
            aa.print(objExplore[x]);
        }
    }
    aa.print("");
    aa.print("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") {
            aa.print(x + " : " + objExplore[x]);
        } 
    }
}