var aa = expression.getScriptRoot();

//License Professional
var form = expression.getValue("LP::FORM");
var lpRefSeq = expression.getValue("LP::professionalModel*licSeqNbr").value;
var licType = expression.getValue("LP::professionalModel*licensetype").value;
var licNumObj = expression.getValue("LP::professionalModel*licensenbr");
var capType = expression.getValue("CAP::capType").value;

var lpBusinessName = expression.getValue("LP::professionalModel*businessname");
var lpAddress = expression.getValue("LP::professionalModel*address1");
var lpPhone = expression.getValue("LP::professionalModel*phone1");
var lpCity = expression.getValue("LP::professionalModel*city");
var lpState = expression.getValue("LP::professionalModel*state");
var lpZip = expression.getValue("LP::professionalModel*zip");
var lpIssueDate = expression.getValue("LP::professionalModel*lastUpdateDate");//Issue Date I guess
var lpBoard = expression.getValue("LP::professionalModel*licenseBoard");//Contractor
// var lpEmail = expression.getValue("LP::professionalModel*email");

//Test adding template fields
//expression.getValue("LP::template_CAP_PROFESSIONAL
//_WORKER_S_COMP_EXPIRATION_DATE");

//General stuff from expression
var altId = expression.getValue("CAP::capModel*altID").value
var currentUserID = expression.getValue("$$userID$$").value;

try {

    /***** Global Variables For Accela Functions *******/
    var useAppSpecificGroupName = false
    debugLevel = "1"
    useLogDebug = true;
    showDebug = true;
    message = ""
    debug = ""
    br = "<br>"

    /***** Include Scripts *******/
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
    eval(getScriptText("INCLUDES_CUSTOM", null, true));

} catch (err) {
    form.message = "Error loading standard functions " + err + " : " + err.lineNumber;
    expression.setReturn(form);
}

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

try {

    var errorMessage = "";
    var formMessage = [];

    showDebug = false;

    (function () {

        //Not a contractor skip integration
        if(licType != "Contractor") {
            logDebug("Type is not contractor");
            return;
        }

        var licenseNumber = String(licNumObj.value).trim().replace(/[^\d]/g, "");

        if(!licenseNumber) {
            logDebug("No license number entered");
            return;
        }

        var cslbResults = validateLPWithCSLB(licenseNumber, null, true, true, true, true, capType);
        logDebug("CSLB results: " + cslbResults.length);
        /*
            {
                licNum: licNum,
                messages: [],
                cslbStatus: "",
                cslbLink: "<a target='_blank' href='https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=" + licNum + "'>" + licNum + "</a>",
                createdReference: false,
                syncedReference: false,
                refSeqNbr: null,
                cslbData: null
            }
        */
        for(var resultsIndex in cslbResults) {
            var cslbResultObj = cslbResults[resultsIndex];
            if(!cslbResultObj.cslbStatus) {
                var link = "<a target='_blank' href='https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=" + licenseNumber + "'>" + licenseNumber + "</a>"
                errorMessage = link + ": CSLB returned no results";
                // return;
            }
            if(cslbResultObj.messages.length > 0) {
                licNumObj.message = cslbResultObj.messages.join("<br>");
            }
            formMessage.push(cslbResultObj.cslbLink + ": CSLB returned a status of <strong>" + cslbResultObj.cslbStatus + "</strong>");

            var cslbData = cslbResultObj.cslbData;
            lpBusinessName.value = cslbData["BusinessName"];
            lpAddress.value = cslbData["Address"];
            lpPhone.value = cslbData["PhoneNumber"];
            lpCity.value = cslbData["City"];
            lpState.value = cslbData["State"];
            lpZip.value = cslbData["ZIP"];
            lpBoard.value = "Contractor";

            var renderObject = {
                "Issue Date": cslbData["IssueDate"],
                "Last Updated": cslbData["LastUpdated"],
                "Expiration Date": cslbData["ExpirationDate"],
                "Worker's Comp Coverage Type" : cslbData["WorkersCompCoverageType"],
                "Policy Expiration Date": cslbData["PolicyExpirationDate"],
                "Bond Expiration Date": cslbData["BondCancellationDate"],
            }

            var htmlData = "";
            for(var field in renderObject) {
                var value = renderObject[field];
                htmlData += "<p>" + field + ": " + (value ? value : "N/A") + "</p>";
            }
            formMessage.push(htmlData);


            expression.setReturn(lpBusinessName);
            expression.setReturn(lpAddress);
            expression.setReturn(lpPhone);
            expression.setReturn(lpCity);
            expression.setReturn(lpState);
            expression.setReturn(lpZip);
            expression.setReturn(lpBoard);
        }

        if(formMessage.length > 0) {
            form.message = "<p style='font-size:small;'>" + formMessage.join("") + "</p>";
        }

        if(errorMessage) {
            form.message = errorMessage;
        }

        if(showDebug) {
            form.message = String(formMessage.message) + br + debug;
            // licNumObj.message = String(licNumObj.message) + "\n" + debug;
        }

        expression.setReturn(licNumObj);
        expression.setReturn(form);


    })();



} catch (error) {
    form.message = error.message + " ln: "  + error.lineNumber;
    expression.setReturn(form);
}

function logDebug(msg) {
    debug += msg + "<BR>";
}