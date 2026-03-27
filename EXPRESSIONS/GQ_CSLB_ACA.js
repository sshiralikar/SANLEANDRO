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
var altId = expression.getValue("CAP::capModel*altID").value;
var currentUserID = expression.getValue("$$userID$$").value;

/***** Global Variables For Accela Functions *******/
var useAppSpecificGroupName = false;
debugLevel = "1";
useLogDebug = true;
showDebug = true;
message = "";
debug = "";
br = "<br>";

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
        licNumObj.value = licenseNumber;
        if(!licenseNumber) {
            licNumObj.message = "Please enter a CSLB license number.";
            logDebug("No license number entered");
            return;
        }

        licNumObj.message = "";
        var cslbResults = validateLPWithCSLB(licenseNumber, null, true, true, true, true, true, capType);
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
            licNumObj.message = errorMessage;
        }

        if(showDebug) {
            licNumObj.message = formMessage.join("") + br + debug;
            // licNumObj.message = String(licNumObj.message) + "\n" + debug;
        }



    })();

    expression.setReturn(licNumObj);
    expression.setReturn(form);


} catch (error) {
    form.message = error.message + " ln: "  + error.lineNumber;
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

function logDebug(msg) {
    debug += msg + "<BR>";
}

function lookup(stdChoice,stdValue)
{
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

    if (bizDomScriptResult.getSuccess())
    {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        var strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else
    {
        logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

//GQ CSLB INTERFACE
function validateLPWithCSLB(licenseNumber, itemCap, fromACA, checkExpDate, checkWCDate, checkBondDate, checkClassifications, appType) {
    var lpsToValidate = [];
    var results = [];
    if(licenseNumber) {
        lpsToValidate.push(licenseNumber);
    }
    if(itemCap) {
        var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
        if (capLicenseResult.getSuccess()) {
            var capLicenseArr = capLicenseResult.getOutput();
            if(!capLicenseArr && !licenseNumber) {
                logDebug("License professionals on " + itemCap.getCustomID() + " returned none");
                return results;
            }
            logDebug("License professionals on record: " + capLicenseArr.length);
            for(var capLPIndex in capLicenseArr) {
                var licenseProfObj = capLicenseArr[capLPIndex];
                var licenseNumFromCap = licenseProfObj.licenseNbr;
                var licenseProfType = licenseProfObj.licenseType;
                if(licenseProfType == "Contractor") {
                    lpsToValidate.push(licenseNumFromCap);
                }
            }
        } else {
            logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
            return results;
        }
    }
    logDebug("Processing " + lpsToValidate.length);
    var currentDate = new Date();
    for(var lpsToValidateIndex in lpsToValidate) {
        var licNum = lpsToValidate[lpsToValidateIndex];

        var validationObj = {
            licNum: licNum,
            messages: [],
            cslbStatus: "",
            cslbLink: "<a target='_blank' href='https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=" + licNum + "'>" + licNum + "</a>",
            createdReference: false,
            syncedReference: false,
            refSeqNbr: null,
            cslbData: null
        };

        logDebug("Checking " + licNum);

        var cslbData = fetchCSLBData(licNum);

        validationObj.cslbStatus = cslbData["Status"];
        validationObj.cslbData = cslbData;

        if(!cslbData || !cslbData["Status"]) {
            logDebug("Unable to validate " + licNum + " from CSLB");
            results.push(validationObj);
            continue;
        }

        //check if reference
        var refLp = grabReferenceLicenseProfessional(licNum, "Contractor");
        var referenceSeqNumber = null;
        if(!refLp) {
            var createReference = lookup("GRAYQUARTER", "CREATE_REFERENCE_LP");
            if(createReference == "YES" && !fromACA) {
                referenceSeqNumber = createReferenceLicenseProfessionalFromCSLB(licNum, cslbData, null);
                validationObj.createdReference = true;
            }
        } else {
            //sync with data from CSLB
            referenceSeqNumber = refLp.getLicSeqNbr();
            var result = syncReferenceLPWithCSLBData(licNum, cslbData);
            if(result) {
                logDebug("Successfuly synced " + licNum + " with CSLB data");
                validationObj.syncedReference = true;
            }
            //TODO: add to set
        }

        if(referenceSeqNumber) {
            validationObj.refSeqNbr = referenceSeqNumber;
        }

        if(checkExpDate) {
            var ExpirationDate = cslbData["ExpirationDate"];
            if (ExpirationDate) {
                var cslbExpDate = new Date(ExpirationDate);
                if(cslbExpDate <= currentDate) {
                    validationObj.messages.push(licNum + ": License Expiration Date has expired " + ExpirationDate);
                }
            }
        }

        if(checkWCDate) {
            var PolicyExpirationDate = cslbData["PolicyExpirationDate"];
            if (PolicyExpirationDate) {
                var workersCompExpDate = new Date(PolicyExpirationDate);
                if(workersCompExpDate <= currentDate) {
                    validationObj.messages.push(licNum + ": Worker's Comp has expired " + PolicyExpirationDate);
                }
            }
        }

        if(checkBondDate) {
            var BondExpirationDate = cslbData["BondCancellationDate"];
            if(BondExpirationDate) {
                var bondExpDate = new Date(BondExpirationDate);
                if(bondExpDate <= currentDate) {
                    validationObj.messages.push(licNum + ": Bond has expired " + BondExpirationDate);
                }
            }
        }

        if(checkClassifications) {
            var classificationResult = validateClassifications(itemCap, appType, cslbData);
            if(!classificationResult.matched) {
                validationObj.messages.push(licNum + ": Is not valid, " + classificationResult.recordType + " requires at least one of following classifications: "  + classificationResult.validClasses + ". Found " + classificationResult.currentClassifications);
            }
        }

        //data from CSLB came back fine
        if(validationObj.messages.length == 0) {
            if(referenceSeqNumber) {
                var hasExpiredCondition = checkRefLPConditionsBySeq(referenceSeqNumber, "Contractor CSLB Information Expired");
                //Update reference condition
                if(hasExpiredCondition) {
                    updateRefLPConditionBySeq(referenceSeqNumber, "Contractor CSLB Information Expired", "Met", "Not Applied", "");
                }
            }
        }

        logDebug(validationObj.cslbLink + ": CSLB returned a status of " + validationObj.cslbStatus);
        logDebug(validationObj.messages.join("<BR>"));
        results.push(validationObj);
    }
    return results;
}

function validateClassifications(itemCap, recordType, cslbData) {
    if(!recordType && itemCap) {
        var recordCap = aa.cap.getCap(itemCap).getOutput();
        if(recordCap) {
            recordType = String(recordCap.getCapType());
        }
    }
    if(!recordType) {
        logDebug("Unable to validate class types since no record type so we assume valid");
        return {matched: true};
    }
    var validClasses = lookup("CONTRACTOR_CLASS_REC_TYPES", recordType);
    var foundMatching = false;
    if(!validClasses) {
        logDebug("No classes found so must be valid");
        return {matched: true};
    }
    if(validClasses) {
        logDebug(recordType + " not configured so any LP goes");
        var classTypeMap = {};
        validClasses = validClasses.split(",");
        for(var validClassIndex in validClasses) {
            var stdClass = String(validClasses[validClassIndex]).toUpperCase();
            if(!classTypeMap[stdClass]) {
                classTypeMap[stdClass] = true;
            }
        }
        var classifications = cslbData["Classifications"];
        for (var classificationIndex in classifications) {
            var classification = String(classifications[classificationIndex]).toUpperCase().trim();
            logDebug(classification);
            if(classTypeMap[classification]) {
                foundMatching = true;
                break;
            }
        }
    }
    return {
        matched: foundMatching,
        recordType: recordType,
        validClasses: validClasses.join(", "),
        currentClassifications: classifications.join(", "),
    }
}

function fetchCSLBData(licNum) {

    //Agency specific
    var cslbToken = lookup('GRAYQUARTER', 'CSLB TOKEN');
    logDebug(cslbToken)
    var cslbURL = "https://www.cslb.ca.gov/onlineservices/DataPortalAPI/GetbyClassification.asmx";

    var xmlToPost = '<?xml version="1.0" encoding="utf-8"?> ';
    xmlToPost += ' <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> ';
    xmlToPost += '   <soap:Body> ';
    xmlToPost += '     <GetLicense xmlns="http://CSLB.Ca.gov/"> ';
    xmlToPost += '       <LicenseNumber>' + licNum + '</LicenseNumber> ';
    xmlToPost += '       <Token>' + cslbToken + '</Token> ';
    xmlToPost += '     </GetLicense> ';
    xmlToPost += '   </soap:Body> ';
    xmlToPost += ' </soap:Envelope> ';

    var postRespOut = null;
    var postResp = aa.util.httpPostToSoapWebService(cslbURL, xmlToPost, null, null, "http://CSLB.Ca.gov/GetLicense");
    if (!postResp.getSuccess()) {
        logDebug("CSLB Web Service returned an error. Please verify license number: " + licNum);
        logDebug("postResp.getErrorMessage(): " + postResp.getErrorMessage());
        if(postResp.getErrorMessage().indexOf('500 for URL') != -1){
            logDebug("CLSB SOAP server returned response of 500.");
        }
        return {
            error: "CSLB Web Service returned an error. " + postResp.getErrorType() + " " + postResp.getErrorMessage(),
        };
    }
    postRespOut = postResp.getOutput();
    aa.print(postRespOut);

    var xmlProperties = [
        "LicenseNumber",
        "LastUpdated",
        "BusinessType",
        "BusinessName",
        "Address",
        "City",
        "State",
        "ZIP",
        "County",
        "PhoneNumber",
        "IssueDate",
        "ExpirationDate",
        "Classifications",
        "Status",
        "SuretyCompany",
        "ContractorBondNumber",
        "ContractorBondAmount",
        "BondEffectiveDate",
        "BondCancellationDate",
        "WorkersCompCoverageType",
        "WorkersCompInsuranceCompany",
        "WorkersCompPolicyNumber",
        "PolicyEffectiveDate",
        "PolicyExpirationDate",
        "PolicyCancellationDate",
        "WorkersCompSuspendDate",
        "ComplaintDisclosure",
    ];

    var cslbObj = {
        error: "",
    };
    for(var i in xmlProperties) {
        var tag = xmlProperties[i];
        //logDebug("Testing tag: " + tag);
        var value = getNodeLocal(postRespOut, tag);
        if(tag == "Classifications") {
            value = value.split("|");
            value = value.map(function (item) {
                return String(item).trim();
            });
            if(String(value).length == 1) {
                value = [value];
            }
        }
        if(tag == "BusinessName" || tag == "Address" || tag == "SuretyCompany" || tag == "WorkersCompInsuranceCompany") {
            value = String(value).replace(/amp;/g, "");
        }
        if(tag == "PhoneNumber") {
            var tempPhone = String(value).replace(/[^\d]/g, "");
			var formattedPhone = tempPhone.substring(0, 3) + "-" + tempPhone.substring(3, 6) + "-" + tempPhone.substring(6, tempPhone.length);
			logDebug("Formatted phone number: " + formattedPhone);
			value = formattedPhone;
        }
        if(value) {
            cslbObj[tag] = value;
        } else {
            cslbObj[tag] = null;
        }
    }

    //props(cslbObj);

    return cslbObj;

    function getNodeLocal(fString,fName)
	{
	 var fValue = "";
	 var startTag = "<"+fName+">";
	 var endTag = "</"+fName+">";

	 var startPos = fString.indexOf(startTag) + startTag.length;
	 var endPos = fString.indexOf(endTag);
     //logDebug(startPos + " " + endPos);
	 // make sure startPos and endPos are valid before using them
	 if (startPos > 0 && startPos < endPos)
		  fValue = fString.substring(startPos,endPos);

	 return String(decodeURI(fValue)).trim();
	}
}
function grabReferenceLicenseProfessional(licenseNumber, licenseType) {
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licenseNumber);
	if (!refLicenseResult.getSuccess()) {
        logDebug("Failed to get reference license professional " + refLicenseResult.getErrorType() + " : " + refLicenseResult.getErrorMessage());
        return false;
    }
    var referenceLpArray = refLicenseResult.getOutput();
    if(!referenceLpArray) {
        logDebug("Reference LP Array returned null");
        return false;
    }
    var firstReferenceFound = false;
    for (var refLpIndex in referenceLpArray) {
        var refLPObject = referenceLpArray[refLpIndex];
        var refLPType = refLPObject.licenseType;
        var auditStatus = refLPObject.auditStatus;
        if(auditStatus == "A") {
            if(licenseType && refLPType == licenseType) {
                return refLPObject;
            }
        }
    }
    if(referenceLpArray[0]) {
        firstReferenceFound = referenceLpArray[0];
    }
    return firstReferenceFound;
}

function createReferenceLicenseProfessionalFromCSLB(licenseNumber, cslbData, businessLicense) {
    var newLic = aa.licenseScript.createLicenseScriptModel();

    newLic.setAgencyCode(aa.getServiceProviderCode());
    newLic.setAuditDate(aa.date.getCurrentDate());
    newLic.setAuditID("ADMIN");
    newLic.setAuditStatus("A");
    newLic.setLicenseType("Contractor");
    newLic.setStateLicense(licenseNumber);

    //cslb data
    newLic.setBusinessName(cslbData["BusinessName"]);
    newLic.setAddress1(cslbData["Address"]);
    newLic.setCity(cslbData["City"]);
    newLic.setLicState(cslbData["State"]);
    newLic.setZip(cslbData["ZIP"]);
    newLic.setPhone1(cslbData["PhoneNumber"]);

    var scriptDate = null;

    var licIssueDate = cslbData["IssueDate"];
    if(licIssueDate) {
        scriptDate = aa.date.parseDate(licIssueDate);
        newLic.setLicenseIssueDate(scriptDate);
    }
    var licExpDate = cslbData["ExpirationDate"];
    if(licExpDate) {
        scriptDate = aa.date.parseDate(licExpDate);
        newLic.setLicenseExpirationDate(scriptDate);
    }

    if(businessLicense) {
        newLic.setBusinessLicense(businessLicense);
    }

    var data = cslbData["SuretyCompany"];
    if(data) {
        newLic.setInsuranceCo(data);
    }

    var data = cslbData["ContractorBondNumber"];
    if(data) {
        newLic.setPolicy(data);
    }

    var data = cslbData["ContractorBondAmount"];
    if(data) {
        newLic.setInsuranceAmount(parseFloat(data));
    }

    var data = cslbData["BondCancellationDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        newLic.setInsuranceExpDate(scriptDate);
    }


    var data = cslbData["WorkersCompPolicyNumber"];
    if(data) {
        newLic.setWcPolicyNo(data);
    }

    var data = cslbData["PolicyEffectiveDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        newLic.setWcEffDate(scriptDate);
    }

    var data = cslbData["PolicyExpirationDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        newLic.setWcExpDate(scriptDate);
    }

    var data = cslbData["PolicyCancellationDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        newLic.setWcCancDate(scriptDate);
    }

    var wcSuspendedDate = cslbData["WorkersCompSuspendDate"];
    if(wcSuspendedDate) {
        scriptDate = aa.date.parseDate(wcSuspendedDate);
        newLic.setWcSuspendDate(scriptDate);
    }

    if(cslbData["WorkersCompCoverageType"] == "Exempt") {
        newLic.setWcExempt("Y");
    } else {
        newLic.setWcExempt("N");
    }

    var wcEffectiveDate = cslbData["PolicyEffectiveDate"];
    if(wcEffectiveDate) {
        scriptDate = aa.date.parseDate(wcEffectiveDate);
        newLic.setWcEffDate(scriptDate);
    }

    var myResult = aa.licenseScript.createRefLicenseProf(newLic);
    if (myResult.getSuccess()) {
        logDebug("Created fresh reference LP for " + licenseNumber);
    } else {
        logDebug("Failed to create reference lp "  + licenseNumber +  " " + myResult.getErrorType() + " : " + myResult.getErrorMessage());
    }

    var licSeqNbr = myResult.getOutput();
    addAttributesFromCSLB(licenseNumber, cslbData);
    return licSeqNbr;
}

function addAttributesFromCSLB(licNum, cslbData) {
    var refLp = grabReferenceLicenseProfessional(licNum, "Contractor");
    if(!refLp) {
        logDebug("Reference lp is not created can't update");
        return false;
    }

    var cslbClassifications = cslbData["Classifications"];
    //Agency specific
    var attributeMap = {
        "Bond Amount" : "ContractorBondAmount",
        // "Bond Code" : "",
        "Bond Effective Date" : "BondEffectiveDate",
        "Bond Expiration" : "BondCancellationDate",
        "Bond Insurance Company" : "SuretyCompany",
        "Bond Number" : "ContractorBondNumber",
        // "Bond Surety Type" : "",
        "Worker's Comp Expiration Date" : "PolicyExpirationDate",
        "Worker's Comp Policy #" : "WorkersCompPolicyNumber",
    }

    var attributes = refLp.attributes;
    if(attributes) {
        var keySet = attributes.keySet().toArray();
        for(var i in keySet) {
            var key = keySet[i];
            var peopleAttributeModel = attributes.get(key);
            var iterator = peopleAttributeModel.iterator();
            while(iterator.hasNext()) {
                var attributeObj = iterator.next();
                var attrLabel = attributeObj.attributeLabel;
                var cslbObjLabel = attributeMap[attrLabel];
                var insertionValue = cslbData[cslbObjLabel];
                if(attrLabel == "Class Code 1" && cslbClassifications.length > 0) {
                    insertionValue = cslbClassifications.join("|");
                }
                if(insertionValue) {
                    logDebug("Setting " + attrLabel + " to " + insertionValue);
                    attributeObj.setAttributeValue(insertionValue);
                }
            }
        }
    }
    var updateResult = aa.licenseScript.editRefLicenseProf(refLp);
    if (updateResult.getSuccess()) {
        logDebug("Updated attributes");
        return true;
    } else {
        logDebug("Unable to update attributes from cslb " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
        return false;
    }
}

function syncReferenceLPWithCSLBData(licenseNumber, cslbData) {
    var refLp = grabReferenceLicenseProfessional(licenseNumber, "Contractor");
    if(!refLp) {
        logDebug("Reference lp is not created can't update");
        return false;
    }

    //cslb data
    refLp.setBusinessName(cslbData["BusinessName"]);
    refLp.setAddress1(cslbData["Address"]);
    refLp.setCity(cslbData["City"]);
    refLp.setLicState(cslbData["State"]);
    refLp.setZip(cslbData["ZIP"]);
    refLp.setPhone1(cslbData["PhoneNumber"]);

    var scriptDate = null;

    var licIssueDate = cslbData["IssueDate"];
    if(licIssueDate) {
        scriptDate = aa.date.parseDate(licIssueDate);
        refLp.setLicenseIssueDate(scriptDate);
    }
    var licExpDate = cslbData["ExpirationDate"];
    if(licExpDate) {
        scriptDate = aa.date.parseDate(licExpDate);
        refLp.setLicenseExpirationDate(scriptDate);
    }

    var data = cslbData["SuretyCompany"];
    if(data) {
        refLp.setInsuranceCo(data);
    }

    var data = cslbData["ContractorBondNumber"];
    if(data) {
        refLp.setPolicy(data);
    }

    var data = cslbData["ContractorBondAmount"];
    if(data) {
        refLp.setInsuranceAmount(parseFloat(data));
    }

    var data = cslbData["BondCancellationDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        refLp.setInsuranceExpDate(scriptDate);
    }


    var data = cslbData["WorkersCompPolicyNumber"];
    if(data) {
        refLp.setWcPolicyNo(data);
    }

    var data = cslbData["PolicyEffectiveDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        refLp.setWcEffDate(scriptDate);
    }

    var data = cslbData["PolicyExpirationDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        refLp.setWcExpDate(scriptDate);
    }

    var data = cslbData["PolicyCancellationDate"];
    if(data) {
        scriptDate = aa.date.parseDate(data);
        refLp.setWcCancDate(scriptDate);
    }

    var wcSuspendedDate = cslbData["WorkersCompSuspendDate"];
    if(wcSuspendedDate) {
        scriptDate = aa.date.parseDate(wcSuspendedDate);
        refLp.setWcSuspendDate(scriptDate);
    }


    if(cslbData["WorkersCompCoverageType"] == "Exempt") {
        refLp.setWcExempt("Y");
    } else {
        refLp.setWcExempt("N");
    }

    var wcEffectiveDate = cslbData["PolicyEffectiveDate"];
    if(wcEffectiveDate) {
        scriptDate = aa.date.parseDate(wcEffectiveDate);
        refLp.setWcEffDate(scriptDate);
    }

    var cslbClassifications = cslbData["Classifications"];
    //Agency specific
    var attributeMap = {
        "Bond Amount" : "ContractorBondAmount",
        // "Bond Code" : "",
        "Bond Effective Date" : "BondEffectiveDate",
        "Bond Expiration" : "BondCancellationDate",
        "Bond Insurance Company" : "SuretyCompany",
        "Bond Number" : "ContractorBondNumber",
        // "Bond Surety Type" : "",
        "Worker's Comp Expiration Date" : "PolicyExpirationDate",
        "Worker's Comp Policy #" : "WorkersCompPolicyNumber",
    }

    var attributes = refLp.attributes;
    if(attributes) {
        var keySet = attributes.keySet().toArray();
        for(var i in keySet) {
            var key = keySet[i];
            var peopleAttributeModel = attributes.get(key);
            var iterator = peopleAttributeModel.iterator();
            while(iterator.hasNext()) {
                var attributeObj = iterator.next();
                var attrLabel = attributeObj.attributeLabel;
                var cslbObjLabel = attributeMap[attrLabel];
                var insertionValue = cslbData[cslbObjLabel];
                if(attrLabel == "Class Code 1" && cslbClassifications.length > 0) {
                    insertionValue = cslbClassifications.join("|");
                }
                if(insertionValue) {
                    logDebug("Setting " + attrLabel + " to " + insertionValue);
                    attributeObj.setAttributeValue(insertionValue);
                }
            }
        }
    }
    var updateResult = aa.licenseScript.editRefLicenseProf(refLp);
    if (updateResult.getSuccess()) {
        logDebug("Updated attributes");
        return true;
    } else {
        logDebug("Unable to sync data from cslb " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
        return false;
    }
}

function checkRefLPConditionsBySeq(refSeqNbr, conditionName) {
    if(!refSeqNbr) {
        logDebug("Unable to get ref lp from " + refSeqNbr);
        return true;
    }
    logDebug("Sequence number: " + refSeqNbr);
    var conditions = aa.caeCondition.getCAEConditions(refSeqNbr);
    if(conditions.getSuccess()) {
        conditions = conditions.getOutput();
        logDebug("Condition: " + conditions.length);
        for(var cond in conditions) {
            var condObj = conditions[cond];
            var condObjName = condObj.conditionDescription;
            var condStatusType = condObj.conditionStatusType;
            if(String(conditionName).toLowerCase() == String(condObjName).toLowerCase() && condStatusType == "Applied") {
                return true;
            }
        }
    } else {
        logDebug("Unable to get conditions from " + lpNumber);
        return false;
    }
}

function updateRefLPConditionBySeq(refSeqNbr, conditionName, conditionStatus, conditionStatusType, impactCode) {
    if(!refSeqNbr) {
        logDebug("Unable to get ref lp from " + refSeqNbr);
        return true;
    }
    logDebug("Sequence number: " + refSeqNbr);
    var conditions = aa.caeCondition.getCAEConditions(refSeqNbr);
    if(conditions.getSuccess()) {
        conditions = conditions.getOutput();
        logDebug("Condition: " + conditions.length);
        for(var cond in conditions) {
            var condObj = conditions[cond];
            var condObjName = condObj.conditionDescription;
            var condStatusType = condObj.conditionStatusType;
            if(String(conditionName).toLowerCase() == String(condObjName).toLowerCase() && condStatusType == "Applied") {
                condObj.setConditionStatus(conditionStatus);
                condObj.setConditionStatusType(conditionStatusType);
                condObj.setImpactCode(impactCode);
                var editResult = aa.caeCondition.editCAECondition(condObj);
                if(editResult.getSuccess()) {
                    logDebug("Successfully updated " + conditionName + " to " + conditionStatus);
                } else {
                    logDebug("Failed to update " + conditionName + " : " + editResult.getErrorMessage() + " " + editResult.getErrorType());
                }
                return editResult.getSuccess();
            }
        }
    } else {
        logDebug("Unable to get conditions from " + lpNumber);
        return false;
    }
}

function addRefLPConditionBySeq(referenceSeqNumber, conditionType, conditionName, conditionComment, impactCode, conditionStatus) {
    var addCAEResult = aa.caeCondition.addCAECondition(referenceSeqNumber, conditionType, conditionName, conditionComment, null, null, impactCode, conditionStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj)
    if (addCAEResult.getSuccess()) {
        logDebug("Successfully added licensed professional (" + referenceSeqNumber + ") condition (" + impactCode + ") " + conditionName);
        return true;
    } else {
        logDebug("**ERROR: adding licensed professional (" + referenceSeqNumber + ") condition (" + impactCode + "): " + addCAEResult.getErrorMessage());
    }
    return false;
}

function getAllTransactionalLPs(itemCap) {
    if(!itemCap) {
        logDebug("No record found cannot pull license professional");
        return [];
    }
    var existingLPs = aa.licenseProfessional.getLicensedProfessionalsByCapID(itemCap);
    if(!existingLPs.getSuccess()) {
        logDebug("Failed to get existing lps on " + itemCap.customID);
        return [];
    }
    existingLPs = existingLPs.getOutput();
    if(!existingLPs) {
        logDebug("Failed output from getting transactional lps");
        return [];
    }
    logDebug("Returning " + existingLPs.length + " license professionals on " + itemCap.getCustomID());
    return existingLPs;
}

function grabTransactionalLicenseProfessional(licenseNumber, itemCap) {
    if(!licenseNumber) {
        logDebug("No license number to search " + itemCap.customID);
        return false;
    }
    if(!itemCap) {
        logDebug("No record found cannot pull license professional");
        return false;
    }
    var existingLPs = aa.licenseProfessional.getLicensedProfessionalsByCapID(itemCap);
    if(!existingLPs.getSuccess()) {
        logDebug("Failed to get existing lps on " + itemCap.customID);
        return false;
    }
    existingLPs = existingLPs.getOutput();
    for(var capLPIndex in existingLPs) {
        var lpModel = existingLPs[capLPIndex];
        var capLpNumber = lpModel.licenseNbr;
        if(capLpNumber == licenseNumber) {
            return lpModel;
        }
    }
    logDebug(licenseNumber + " does not exist on " + itemCap.customID);
    return false;
}