/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be
	    available to all master scripts
|
| Notes   : createRefLicProf - override to default the state if one is not provided
|
|         : createRefContactsFromCapContactsAndLink - testing new ability to link public users to new ref contacts
/------------------------------------------------------------------------------------------------------*/

function createRefLicProf(rlpId,rlpType,pContactType)
{
    //Creates/updates a reference licensed prof from a Contact
    //06SSP-00074, modified for 06SSP-00238
    var updating = false;
    var capContResult = aa.people.getCapContactByCapID(capId);
    if (capContResult.getSuccess())
    { conArr = capContResult.getOutput();  }
    else
    {
        logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
        return false;
    }

    if (!conArr.length)
    {
        logDebug ("**WARNING: No contact available");
        return false;
    }


    var newLic = getRefLicenseProf(rlpId)

    if (newLic)
    {
        updating = true;
        logDebug("Updating existing Ref Lic Prof : " + rlpId);
    }
    else
        var newLic = aa.licenseScript.createLicenseScriptModel();

    //get contact record
    if (pContactType==null)
        var cont = conArr[0]; //if no contact type specified, use first contact
    else
    {
        var contFound = false;
        for (yy in conArr)
        {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
            {
                cont = conArr[yy];
                contFound = true;
                break;
            }
        }
        if (!contFound)
        {
            logDebug ("**WARNING: No Contact found of type: "+pContactType);
            return false;
        }
    }

    peop = cont.getPeople();
    addr = peop.getCompactAddress();

    newLic.setContactFirstName(cont.getFirstName());
    //newLic.setContactMiddleName(cont.getMiddleName());  //method not available
    newLic.setContactLastName(cont.getLastName());
    newLic.setBusinessName(peop.getBusinessName());
    newLic.setAddress1(addr.getAddressLine1());
    newLic.setAddress2(addr.getAddressLine2());
    newLic.setAddress3(addr.getAddressLine3());
    newLic.setCity(addr.getCity());
    newLic.setState(addr.getState());
    newLic.setZip(addr.getZip());
    newLic.setPhone1(peop.getPhone1());
    newLic.setPhone2(peop.getPhone2());
    newLic.setEMailAddress(peop.getEmail());
    newLic.setFax(peop.getFax());

    newLic.setAgencyCode(aa.getServiceProviderCode());
    newLic.setAuditDate(sysDate);
    newLic.setAuditID(currentUserID);
    newLic.setAuditStatus("A");

    if (AInfo["Insurance Co"]) 		newLic.setInsuranceCo(AInfo["Insurance Co"]);
    if (AInfo["Insurance Amount"]) 		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
    if (AInfo["Insurance Exp Date"]) 	newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
    if (AInfo["Policy #"]) 			newLic.setPolicy(AInfo["Policy #"]);

    if (AInfo["Business License #"]) 	newLic.setBusinessLicense(AInfo["Business License #"]);
    if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

    newLic.setLicenseType(rlpType);

    if(addr.getState() != null)
        newLic.setLicState(addr.getState());
    else
        newLic.setLicState("AK"); //default the state if none was provided

    newLic.setStateLicense(rlpId);

    if (updating)
        myResult = aa.licenseScript.editRefLicenseProf(newLic);
    else
        myResult = aa.licenseScript.createRefLicenseProf(newLic);

    if (myResult.getSuccess())
    {
        logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        return true;
    }
    else
    {
        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        return false;
    }
}


function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)
{

    // contactTypeArray is either null (all), or an array or contact types to process
    //
    // ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
    //
    // replaceCapContact not implemented yet
    //
    // overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
    //
    // refContactExists is a function for REF contact comparisons.
    //
    // Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES".
    // This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will
    // be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
    // choice determines the default action of all contact types.   Other types can be configured separately.
    // Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization),
    // "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

    var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";


    var ingoreArray = new Array();
    if (arguments.length > 1) ignoreArray = arguments[1];

    var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

    var c = aa.people.getCapContactByCapID(pCapId).getOutput()
    var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

    for (var i in c)
    {
        var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
        var con = c[i];

        var p = con.getPeople();

        var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());

        if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
        {
            if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
                continue;  // not in the contact type list.  Move along.
        }

        if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
        {
            ruleForRefContactType = defaultContactFlag;
        }

        if (contactFlagForType) // explicit contact type is indicated
        {
            ruleForRefContactType = contactFlagForType;
        }

        if (ruleForRefContactType.equals("D"))
            continue;

        var refContactType = "";

        switch(ruleForRefContactType)
        {
            case "U":
                refContactType = p.getContactType();
                break;
            case "I":
                refContactType = "Individual";
                break;
            case "O":
                refContactType = "Organization";
                break;
            case "F":
                if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
                    refContactType = "Organization";
                else
                    refContactType = "Individual";
                break;
        }

        var refContactNum = con.getCapContactModel().getRefContactNumber();

        if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
        {
            if (overwriteRefContact)
            {
                p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
                p.setContactType(refContactType);

                var a = p.getAttributes();

                if (a)
                {
                    var ai = a.iterator();
                    while (ai.hasNext())
                    {
                        var xx = ai.next();
                        xx.setContactNo(refContactNum);
                    }
                }

                var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());

                if (!r.getSuccess())
                    logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
                else
                    logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
            }

            if (replaceCapContact)
            {
                // To Be Implemented later.   Is there a use case?
            }

        }
        else  // user entered the contact freehand.   Let's create or link to ref contact.
        {
            var ccmSeq = p.getContactSeqNumber();

            var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

            var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

            if (existingContact)  // we found a match with our custom function.  Use this one.
            {
                refPeopleId = existingContact;
            }
            else  // did not find a match, let's create one
            {

                var a = p.getAttributes();

                if (a)
                {
                    //
                    // Clear unwanted attributes
                    var ai = a.iterator();
                    while (ai.hasNext())
                    {
                        var xx = ai.next();
                        if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
                            ai.remove();
                    }
                }

                p.setContactType(refContactType);
                var r = aa.people.createPeopleWithAttribute(p,a);

                if (!r.getSuccess())
                {logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

                //
                // createPeople is nice and updates the sequence number to the ref seq
                //

                var p = cCopy[i].getPeople();
                var refPeopleId = p.getContactSeqNumber();

                logDebug("Successfully created reference contact #" + refPeopleId);

                // Need to link to an existing public user.

                var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
                if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                    var userModel = getUserResult.getOutput();
                    logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());

                    if (refPeopleId)	{
                        logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
                        aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
                    }
                }
            }

            //
            // now that we have the reference Id, we can link back to reference
            //

            var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

            ccm.setRefContactNumber(refPeopleId);
            r = aa.people.editCapContact(ccm);

            if (!r.getSuccess())
            { logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
            else
            { logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


        }  // end if user hand entered contact
    }  // end for each CAP contact
} // end function

function XMLTagValue(xmlstring, tag) {
    var startIndex = xmlstring.indexOf("<" + tag + ">");
    if (startIndex == -1)
        return "";
    //   logDebug("startIndex:" + startIndex);
    //   logDebug("");
    var endIndex = xmlstring.indexOf("</" + tag + ">", startIndex + 1);
    //   logDebug("endIndex:" + endIndex);
    //   logDebug("");
    //   logDebug("");
    var substring = xmlstring.slice(startIndex + 1 + tag.length + 1, endIndex);
    //   logDebug("substring:" + substring);
    //   logDebug("");
    //   logDebug("");
    return substring;
}

String.prototype.formatToHTML = function () {
    return this.replace("&\amp;", "&").replace("&\nbsp;", " ").replace("&\lt;", "<").replace("&\gt;", ">").replace("&\quot;", "\"").replace("<br />", "\r\n");
}

function trim(strText) {
    return (String(strText).replace(/^\s+|\s+$/g, ''));
}

function externalLP_SLCA(licNum, rlpType, doPopulateRef, doPopulateTrx, itemCap) {
    /*
    Version: 3.2

    Usage:

    licNum			:  Valid CA license number.   Non-alpha, max 8 characters.  If null, function will use the LPs on the supplied CAP ID
    rlpType			:  License professional type to use when validating and creating new LPs
    doPopulateRef 	:  If true, will create/refresh a reference LP of this number/type
    doPopulateTrx 	:  If true, will copy create/refreshed reference LPs to the supplied Cap ID.   doPopulateRef must be true for this to work
    itemCap			:  If supplied, licenses on the CAP will be validated.  Also will be refreshed if doPopulateRef and doPopulateTrx are true

    returns: non-null string of status codes for invalid licenses

    examples:

    appsubmitbefore   (will validate the LP entered, if any, and cancel the event if the LP is inactive, cancelled, expired, etc.)
    ===============
    true ^ cslbMessage = "";
    CAELienseNumber ^ cslbMessage = externalLP_CA(CAELienseNumber,CAELienseType,false,false,null);
    cslbMessage.length > 0 ^ cancel = true ; showMessage = true ; comment(cslbMessage)

    appsubmitafter  (update all CONTRACTOR LPs on the CAP and REFERENCE with data from CSLB.  Link the CAP LPs to REFERENCE.   Pop up a message if any are inactive...)
    ==============
    true ^ 	cslbMessage = externalLP_CA(null,"CONTRACTOR",true,true,capId)
    cslbMessage.length > 0 ^ showMessage = true ; comment(cslbMessage);

    Note;  Custom LP Template Field Mappings can be edited in the script below
     */

    var returnMessage = "";

    // Build array of LPs to check
    var workArray = new Array();
    if (licNum)
        workArray.push(String(licNum));

    if (itemCap) {
        var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
        if (capLicenseResult.getSuccess()) {
            var capLicenseArr = capLicenseResult.getOutput();
        } else {
            logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
            return false;
        }

        if (capLicenseArr == null || !capLicenseArr.length) {
            logDebug("**WARNING: no licensed professionals on this CAP");
        } else {
            for (var thisLic in capLicenseArr)
                if (capLicenseArr[thisLic].getLicenseType() == rlpType)
                    workArray.push(capLicenseArr[thisLic]);
        }
    } else {
        doPopulateTrx = false; // can't do this without a CAP;
    }

    for (var thisLic = 0; thisLic < workArray.length; thisLic++) {
        var licNum = workArray[thisLic];
        var licObj = null;
        var isObject = false;

        if (typeof licNum == "object") {
            // is this one an object or string?
            licObj = licNum;
            licNum = licObj.getLicenseNbr();
            isObject = true;
        }

        // Make the call to the California State License Board

        var endPoint = "https://www.cslb.ca.gov/onlineservices/DataPortalAPI/GetbyClassification.asmx";
        var method = "http://CSLB.Ca.gov/GetLicense";
        var xmlout = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cslb="http://CSLB.Ca.gov/"><soapenv:Header/><soapenv:Body><cslb:GetLicense><cslb:LicenseNumber>%%LICNUM%%</cslb:LicenseNumber><cslb:Token>%%TOKEN%%</cslb:Token></cslb:GetLicense></soapenv:Body></soapenv:Envelope>';
        //var licNum = "9";
        var token = lookup("GRAYQUARTER", "CSLB TOKEN");

        if (!token || token == "") {
            logDebug("GRAYQUARTER CSLB TOKEN not configured");
            return false;
        }

        xmlout = xmlout.replace("%%LICNUM%%", licNum);
        xmlout = xmlout.replace("%%TOKEN%%", token);

        var headers = aa.util.newHashMap();
        headers.put("Content-Type", "text/xml");
        headers.put("SOAPAction", method);

        var res = aa.httpClient.post(endPoint, headers, xmlout);


		// check the results
		var result;
        var isError = false;
        if (res.getSuccess()) {
            result = String(res.getOutput());
        } else {
            isError = true;
        }
		
        var lpStatus = XMLTagValue(result, "Status");
        // Primary Status
        //
        if (lpStatus && lpStatus != "") {
            returnMessage += "License:" + licNum + " status is " + lpStatus + ".";
        } else {
			isError = true;
			returnMessage += "CLSB returns no data ";
}
        if (isError) {
            returnMessage += "License " + licNum + " : ";
			returnMessage += "URL: " + endPoint + " : ";
			returnMessage +="Headers:" + headers + " : ";
			returnMessage +="Payload: "+ xmlout + " : ";
			returnMessage +="Result: " + result + " : ";
            continue;
        }

        //logDebug(result);
        

        if (doPopulateRef) {
            // refresh or create a reference LP
            var updating = false;
            // check to see if the licnese already exists...if not, create.
            var newLic = getRefLicenseProf(licNum);

            if (newLic) {
                updating = true;
                logDebug("Updating existing Ref Lic Prof : " + licNum);
            } else {
                var newLic = aa.licenseScript.createLicenseScriptModel();
            }

            if (isObject) {
                // update the reference LP with data from the transactional, if we have some.
                if (licObj.getAddress1())
                    newLic.setAddress1(licObj.getAddress1());
                if (licObj.getAddress2())
                    newLic.setAddress2(licObj.getAddress2());
                if (licObj.getAddress3())
                    newLic.setAddress3(licObj.getAddress3());
                if (licObj.getAgencyCode())
                    newLic.setAgencyCode(licObj.getAgencyCode());
                if (licObj.getBusinessLicense())
                    newLic.setBusinessLicense(licObj.getBusinessLicense());
                if (licObj.getBusinessName())
                    newLic.setBusinessName(licObj.getBusinessName());
                if (licObj.getBusName2())
                    newLic.setBusinessName2(licObj.getBusName2());
                if (licObj.getCity())
                    newLic.setCity(licObj.getCity());
                if (licObj.getCityCode())
                    newLic.setCityCode(licObj.getCityCode());
                if (licObj.getContactFirstName())
                    newLic.setContactFirstName(licObj.getContactFirstName());
                if (licObj.getContactLastName())
                    newLic.setContactLastName(licObj.getContactLastName());
                if (licObj.getContactMiddleName())
                    newLic.setContactMiddleName(licObj.getContactMiddleName());
                if (licObj.getCountryCode())
                    newLic.setContryCode(licObj.getCountryCode());
                if (licObj.getEmail())
                    newLic.setEMailAddress(licObj.getEmail());
                if (licObj.getCountry())
                    newLic.setCountry(licObj.getCountry());
                if (licObj.getEinSs())
                    newLic.setEinSs(licObj.getEinSs());
                if (licObj.getFax())
                    newLic.setFax(licObj.getFax());
                if (licObj.getFaxCountryCode())
                    newLic.setFaxCountryCode(licObj.getFaxCountryCode());
                if (licObj.getHoldCode())
                    newLic.setHoldCode(licObj.getHoldCode());
                if (licObj.getHoldDesc())
                    newLic.setHoldDesc(licObj.getHoldDesc());
                if (licObj.getLicenseExpirDate())
                    newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
                if (licObj.getLastRenewalDate())
                    newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
                if (licObj.getLicesnseOrigIssueDate())
                    newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
                if (licObj.getPhone1())
                    newLic.setPhone1(licObj.getPhone1());
                if (licObj.getPhone1CountryCode())
                    newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
                if (licObj.getPhone2())
                    newLic.setPhone2(licObj.getPhone2());
                if (licObj.getPhone2CountryCode())
                    newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
                if (licObj.getSelfIns())
                    newLic.setSelfIns(licObj.getSelfIns());
                if (licObj.getState())
                    newLic.setState(licObj.getState());
                if (licObj.getSuffixName())
                    newLic.setSuffixName(licObj.getSuffixName());
                if (licObj.getZip())
                    newLic.setZip(licObj.getZip());
            }

            // Now set data from the CSLB
            var BusinessName = XMLTagValue(result, "BusinessName");
            if (BusinessName != "")
                newLic.setBusinessName(BusinessName.replace(/\+/g, " ").formatToHTML());
            var Address = XMLTagValue(result, "Address");
            if (Address != "")
                newLic.setAddress1(Address.replace(/\+/g, " ").formatToHTML());
            var City = XMLTagValue(result, "City");
            if (City != "")
                newLic.setCity(City.replace(/\+/g, " ").formatToHTML());
            var State = XMLTagValue(result, "State");
            if (State != "")
                newLic.setState(State.replace(/\+/g, " ").formatToHTML());
            var Zip = XMLTagValue(result, "ZIP");
            if (Zip != "")
                newLic.setZip(Zip.replace(/\+/g, " ").formatToHTML());

            var PhoneNumber = XMLTagValue(result, "PhoneNumber");
            if (PhoneNumber != "")
                newLic.setPhone1((PhoneNumber.replace(/\+/g, "-").formatToHTML()));
            newLic.setAgencyCode(aa.getServiceProviderCode());
            newLic.setAuditDate(sysDate);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setLicState("CA"); // hardcode CA
            newLic.setStateLicense(licNum);

            var IssueDate = XMLTagValue(result, "IssueDate");
            if (IssueDate)
                newLic.setLicenseIssueDate(aa.date.parseDate(IssueDate));
            var ExpirationDate = XMLTagValue(result, "ExpirationDate");
            if (ExpirationDate)
                newLic.setLicenseExpirationDate(aa.date.parseDate(ExpirationDate));
            var WorkersCompPolicyNumber = XMLTagValue(result, "WorkersCompPolicyNumber");
            if (WorkersCompPolicyNumber) {
                newLic.setWcPolicyNo(WorkersCompPolicyNumber);                
            }
            var PolicyEffectiveDate = XMLTagValue(result, "PolicyEffectiveDate");
            if (PolicyEffectiveDate) {
                newLic.setWcEffDate(aa.date.parseDate(PolicyEffectiveDate));
            }
            var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
            if (PolicyExpirationDate) {
                newLic.setWcExpDate(aa.date.parseDate(PolicyExpirationDate));
            }

            //
            // Do the refresh/create and get the sequence number
            //
            if (updating) {
                var myResult = aa.licenseScript.editRefLicenseProf(newLic);
                var licSeqNbr = newLic.getLicSeqNbr();
            } else {
                var myResult = aa.licenseScript.createRefLicenseProf(newLic);

                if (!myResult.getSuccess()) {
                    logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
                    continue;
                }

                var licSeqNbr = myResult.getOutput();
            }

            logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " Sequence Number " + licSeqNbr);

            /////
            /////  Attribute Data -- first copy from the transactional LP if it exists
            /////

            if (isObject) {
                // update the reference LP with attributes from the transactional, if we have some.
                var attrArray = licObj.getAttributes();

                if (attrArray) {
                    for (var k in attrArray) {
                        var attr = attrArray[k];
                        editRefLicProfAttribute(
                            licNum,
                            attr.getAttributeName(),
                            attr.getAttributeValue());
                    }
                }
            }

            /////
            /////  Attribute Data
            /////
            /////  NOTE!  Agencies may have to configure template data below based on their configuration.  Please note all edits
            /////
            var Classifications = XMLTagValue(result, "Classifications");
            var ClassificationList = Classifications.split("|");

            for (var m = 0; m < ClassificationList.length; m++) {
                cb = ClassificationList[m];
                logDebug(cb);
                editRefLicProfAttribute(licNum, "CLASS CODE " + (m + 1), cb);
            }

            var ContractorBondAmount = XMLTagValue(result, "ContractorBondAmount");

            if (ContractorBondAmount)
                editRefLicProfAttribute(licNum, "BOND AMOUNT", ContractorBondAmount.replace(/[^\d.-]/g, ''));

            if(WorkersCompPolicyNumber) {
                editRefLicProfAttribute(licNum, "WORKER'S COMP POLICY #", WorkersCompPolicyNumber);
            }
            if(PolicyExpirationDate) {
                editRefLicProfAttribute(licNum, "WORKER'S COMP EXPIRATION DATE", PolicyExpirationDate);
            }
            // if(PolicyEffectiveDate) {
            //     editRefLicProfAttribute(licNum, "WORKER'S COMP EFFECTIVE DATE", PolicyEffectiveDate);
            // }

            // populate transactional LP
            if (doPopulateTrx) {
                var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, licSeqNbr);
                if (!lpsmResult.getSuccess()) {
                    logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
                }

                var lpsm = lpsmResult.getOutput();

                // Remove from CAP

                var isPrimary = false;

                if (capLicenseArr != null) {
                    for (var currLic in capLicenseArr) {
                        var thisLP = capLicenseArr[currLic];
                        if (
                            thisLP.getLicenseType() == rlpType &&
                            thisLP.getLicenseNbr() == licNum) {
                            logDebug("Removing license: " + thisLP.getLicenseNbr() + " from CAP.  We will link the new reference LP");
                            if (thisLP.getPrintFlag() == "Y") {
                                logDebug("...remove primary status...");
                                isPrimary = true;
                                thisLP.setPrintFlag("N");
                                aa.licenseProfessional.editLicensedProfessional(thisLP);
                            }
                            var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
                            if (capLicenseResult.getSuccess()) {
                                logDebug("...Success.");
                            } else {
                                logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage());
                            }
                        }
                    }
                }

                // add the LP to the CAP
                var asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm);
                if (!asCapResult.getSuccess()) {
                    logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage());
                } else {
                    logDebug("Associated the CAP to the new LP");
                }

                // Now make the LP primary again
                if (isPrimary) {
                    var capLps = getLicenseProfessional(itemCap);

                    for (var thisCapLpNum in capLps) {
                        if (capLps[thisCapLpNum].getLicenseNbr().equals(licNum)) {
                            var thisCapLp = capLps[thisCapLpNum];
                            thisCapLp.setPrintFlag("Y");
                            aa.licenseProfessional.editLicensedProfessional(thisCapLp);
                            logDebug("Updated primary flag on Cap LP : " + licNum);
                        }
                    }
                }
            } // do populate on the CAP
        } // do populate on the REF
    } // for each license

    if (returnMessage.length > 0)
        return returnMessage;
    else
        return null;
}

function copyGISDataToCustomFields(itemCap) {
    var exposedMap = {};
    var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
    if(!capParcelResult.getSuccess()) {
        logDebug("Failed to get parcel: " + capParcelResult.getErrorMessage());
        return false;
    }

    capParcelResult = capParcelResult.getOutput();
    if(!capParcelResult) {
        logDebug("Failed to output parcel array: " + capParcelResult);
        return false;
    }
    var parcelArray = capParcelResult.toArray();
    logDebug("Parcels: " + parcelArray.length);
    for(var parcelIndex in parcelArray) {
        var parcelObj = parcelArray[parcelIndex];
        var parcelNum = parcelObj.parcelNumber;
        var parcelAttributes = parcelObj.parcelAttribute;
        if(!parcelAttributes) {
            continue;
        }
        parcelAttributes = parcelAttributes.toArray();        
        logDebug("Parcel number: " + parcelNum);
        logDebug("Attributes size: " + parcelAttributes.length);
        for(var attributeIndex in parcelAttributes) {
            var attributeObj = parcelAttributes[attributeIndex];
            var attributeName = attributeObj.b1AttributeName;
            var attributeValue = attributeObj.value;
            var attributeType = attributeObj.b1AttributeValueDataType;            
            var asiField = lookup("GIS_ASI_MAP", attributeName);
            exposedMap[attributeName] = String(attributeValue);
            if(asiField && attributeValue) {
                logDebug("Type: " + attributeType + " name: " + attributeName + " value: " + attributeValue);                
                if(asiField == "Liquefaction") {
                    var options = String(attributeValue).split(" ");
                    var remainders = [];
                    for(var optIndex in options) {
                        var possibleValue = options[optIndex];
                        if(possibleValue == "Earthquake") {
                            editAppSpecific("Earthquake Zone", possibleValue, itemCap);
                        } else {
                            remainders.push(possibleValue);
                        }
                    }
                    if(remainders.length) {
                        editAppSpecific(asiField, remainders.join(" "), itemCap);        
                    }
                    continue;
                }
                editAppSpecific(asiField, attributeValue, itemCap);
            }
        }
        break;
    }
    //aa.print(JSON.stringify(exposedMap));
    return true;
}

function correctParcelData() {
    var data = getGISBufferInfo("SANLEANDRO", "Parcels", 0);
    var parcelMap = {};
    for(var i in data){        
        var gisData = data[i];
        var parcelNum = gisData.GIS_ID;        
        if(parcelNum && !parcelMap[parcelNum]) {
            parcelMap[parcelNum] = {};
            for(var prop in gisData) {
                var value = gisData[prop];
                var key = String(prop).replace(/_/g, "");
                parcelMap[parcelNum][key] = value;
            }
        }
    }
    var recParcels = aa.parcel.getParcelandAttribute(capId, null);
    if (recParcels.getSuccess()) {
        var recParcels = recParcels.getOutput().toArray();
        for (var parcelIndex in recParcels) {
            var recParcelObj = recParcels[parcelIndex];
            var recParcelNum = recParcelObj.parcelNumber;
            if(parcelMap[recParcelNum]) {
                logDebug("Loaded data for " + recParcelNum);
                //props(recParcelObj)
                var parcelAttributes = recParcelObj.parcelAttribute;
                if(!parcelAttributes) {
                    continue;
                }
                var iterator = parcelAttributes.iterator();
                var parcelGISData = parcelMap[recParcelNum];
                //props(parcelGISData);
                var count = 0;
                while(iterator.hasNext()) {
                    var parcelAttrObj = iterator.next();
                    //explore(parcelAttrObj);
                    var parcelAttrName = parcelAttrObj.getB1AttributeName();
                    var currentVal = parcelAttrObj.getB1AttributeValue();
                    if(!currentVal && parcelGISData[parcelAttrName]) {
                        parcelAttrObj.setB1AttributeValue(parcelGISData[parcelAttrName]);
                        count++;
                    } else if(!parcelGISData[parcelAttrName]) {
                        //TODO: Custom lookup
                        logDebug("Field not found in GIS Data Map: " + parcelAttrName);
                    }
                }
                if(count == 0) {
                    continue;
                }
                var capParcelModel = aa.parcel.warpCapIdParcelModel2CapParcelModel(capId, recParcelObj).getOutput();
                if(capParcelModel) {
                    var update = aa.parcel.updateDailyParcelWithAPOAttribute(capParcelModel);
                    if(update.getSuccess()) {
                        logDebug("Successfuly loaded parcel " + recParcelNum + " data (Fields updated: " + count + ") to " + capId.getCustomID());
                    }
                }
            }
        }
    }
}

function checkLP(itemCap) {
    var transLPList = aa.licenseScript.getLicenseProf(capId).getOutput();
    if(!transLPList || transLPList.length == 0) {
        logDebug("No LPs on " + itemCap.getCustomID());
        return;
    }
    for(var lpIndex in transLPList) {
        var lpObj = transLPList[lpIndex];//LicenseProfessionalScriptModel
        var lpModel = lpObj.licenseProfessionalModel;
        var refId = lpModel.licSeqNbr;        
        var licNumber = lpModel.licenseNbr;
        if(refId > 0) {
            logDebug("LP " + licNumber + " is already a reference LP " + refId);
            continue;
        }        
        var existingRef = getRefLicenseProf(licNumber);
        if(existingRef) {
            //replace with reference and sync any unknown data
            var licSeqNbr = syncDataFromTransToRef(lpObj, existingRef, licNumber);  
            refreshLP(lpObj, itemCap, licSeqNbr);
        } else {            
            //no existing reference LP, need to create it and sync it to the lp
            var licSeqNbr = createReferenceLicenseProf(lpObj, licNumber, lpModel.licenseType);
            refreshLP(lpObj, itemCap, licSeqNbr);
        }        
    }
}

function refreshLP(transLpScriptModel, itemCap, refSeqNbr) {
    //Fetch Ref LP
    var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), refSeqNbr);
    if (!lpsmResult.getSuccess()) {
        logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
    }
    var lpsm = lpsmResult.getOutput();
    //Check if reference LP exists
    if(!lpsm) {
        return;
    }

    //Keep track if primary
    var isPrimary = false;
    var licNum = transLpScriptModel.getLicenseNbr();
    logDebug("Removing license: " + licNum + " from CAP.  We will link the new reference LP");
    if (transLpScriptModel.getPrintFlag() == "Y") {
        logDebug("...remove primary status...");
        isPrimary = true;
        transLpScriptModel.setPrintFlag("N");
        aa.licenseProfessional.editLicensedProfessional(transLpScriptModel);
    }
    var remCapResult = aa.licenseProfessional.removeLicensedProfessional(transLpScriptModel);
    if (remCapResult.getSuccess()) {
        logDebug("...Success.");
    } else {
        logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage());                
    }

    var asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm);
    if (!asCapResult.getSuccess()) {
        logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage());
    } else {
        logDebug("Associated the CAP to the new LP");
    }

    // Now make the LP primary again
    if (isPrimary) {
        var capLps = getLicenseProfessional(itemCap);
        for (var thisCapLpNum in capLps) {
            var thisCapLp = capLps[thisCapLpNum];
            if (thisCapLp.getLicenseNbr().equals(licNum)) {
                thisCapLp.setPrintFlag("Y");
                aa.licenseProfessional.editLicensedProfessional(thisCapLp);
                logDebug("Updated primary flag on Cap LP : " + licNum);
            }
        }
    }
}

function createReferenceLicenseProf(licObj, licNum, licType) {
    var newLic = aa.licenseScript.createLicenseScriptModel();
    // update the reference LP with data from the transactional, if we have some.
    if (licObj.getAddress1())
        newLic.setAddress1(licObj.getAddress1());
    if (licObj.getAddress2())
        newLic.setAddress2(licObj.getAddress2());
    if (licObj.getAddress3())
        newLic.setAddress3(licObj.getAddress3());
    if (licObj.getAgencyCode())
        newLic.setAgencyCode(licObj.getAgencyCode());
    if (licObj.getBusinessLicense())
        newLic.setBusinessLicense(licObj.getBusinessLicense());
    if (licObj.getBusinessName())
        newLic.setBusinessName(licObj.getBusinessName());
    if (licObj.getBusName2())
        newLic.setBusinessName2(licObj.getBusName2());
    if (licObj.getCity())
        newLic.setCity(licObj.getCity());
    if (licObj.getCityCode())
        newLic.setCityCode(licObj.getCityCode());
    if (licObj.getContactFirstName())
        newLic.setContactFirstName(licObj.getContactFirstName());
    if (licObj.getContactLastName())
        newLic.setContactLastName(licObj.getContactLastName());
    if (licObj.getContactMiddleName())
        newLic.setContactMiddleName(licObj.getContactMiddleName());
    if (licObj.getCountryCode())
        newLic.setContryCode(licObj.getCountryCode());
    if (licObj.getEmail())
        newLic.setEMailAddress(licObj.getEmail());
    if (licObj.getCountry())
        newLic.setCountry(licObj.getCountry());
    if (licObj.getEinSs())
        newLic.setEinSs(licObj.getEinSs());
    if (licObj.getFax())
        newLic.setFax(licObj.getFax());
    if (licObj.getFaxCountryCode())
        newLic.setFaxCountryCode(licObj.getFaxCountryCode());
    if (licObj.getHoldCode())
        newLic.setHoldCode(licObj.getHoldCode());
    if (licObj.getHoldDesc())
        newLic.setHoldDesc(licObj.getHoldDesc());
    if (licObj.getLicenseExpirDate())
        newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
    if (licObj.getLastRenewalDate())
        newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
    if (licObj.getLicesnseOrigIssueDate())
        newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
    if (licObj.getPhone1())
        newLic.setPhone1(licObj.getPhone1());
    if (licObj.getPhone1CountryCode())
        newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
    if (licObj.getPhone2())
        newLic.setPhone2(licObj.getPhone2());
    if (licObj.getPhone2CountryCode())
        newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
    if (licObj.getSelfIns())
        newLic.setSelfIns(licObj.getSelfIns());
    if (licObj.getState())
        newLic.setState(licObj.getState());
    if (licObj.getSuffixName())
        newLic.setSuffixName(licObj.getSuffixName());
    if (licObj.getZip())
        newLic.setZip(licObj.getZip());

    newLic.setAgencyCode(aa.getServiceProviderCode());
    newLic.setAuditDate(sysDate);
    newLic.setAuditID(currentUserID);
    newLic.setAuditStatus("A");
    newLic.setLicenseType(licType);
    newLic.setLicState("CA"); // hardcode CA
    newLic.setStateLicense(licNum);

    var myResult = aa.licenseScript.createRefLicenseProf(newLic);
    if (myResult.getSuccess()) {
        logDebug("Created fresh reference LP for " + licNum);
    }

    var licSeqNbr = myResult.getOutput();    
    return licSeqNbr;
}

function syncDataFromTransToRef(transObj, refObj, transLicNum) {
    // logDebug(transObj);
    // logDebug(refObj);
    // explore(transObj);
    // logDebug("");
    // explore(refObj);
    if (transObj.getAddress1() && !refObj.getAddress1())
        refObj.setAddress1(transObj.getAddress1());
    if (transObj.getAddress2() && !refObj.getAddress2())
        refObj.setAddress2(transObj.getAddress2());
    if (transObj.getAddress3() && !refObj.getAddress3())
        refObj.setAddress3(transObj.getAddress3());
    if (transObj.getAgencyCode() && !refObj.getAgencyCode())
        refObj.setAgencyCode(transObj.getAgencyCode());
    if (transObj.getBusinessLicense() && !refObj.getBusinessLicense())
        refObj.setBusinessLicense(transObj.getBusinessLicense());
    if (transObj.getBusinessName() && !refObj.getBusinessName())
        refObj.setBusinessName(transObj.getBusinessName());
    if (transObj.getBusName2() && !refObj.getBusName2())
        refObj.setBusinessName2(transObj.getBusName2());
    if (transObj.getCity() && !refObj.getCity())
        refObj.setCity(transObj.getCity());
    if (transObj.getCityCode() && !refObj.getCityCode())
        refObj.setCityCode(transObj.getCityCode());
    if (transObj.getContactFirstName() && !refObj.getContactFirstName())
        refObj.setContactFirstName(transObj.getContactFirstName());
    if (transObj.getContactLastName() && !refObj.getContactLastName())
        refObj.setContactLastName(transObj.getContactLastName());
    if (transObj.getContactMiddleName() && !refObj.getContactMiddleName())
        refObj.setContactMiddleName(transObj.getContactMiddleName());
    if (transObj.getCountryCode() && !refObj.getCountryCode())
        refObj.setContryCode(transObj.getCountryCode());
    if (transObj.getEmail() && !refObj.getEMailAddress())
        refObj.setEMailAddress(transObj.getEmail());
    if (transObj.getCountry() && !refObj.getCountry())
        refObj.setCountry(transObj.getCountry());
    if (transObj.getEinSs() && !refObj.getEinSs())
        refObj.setEinSs(transObj.getEinSs());
    if (transObj.getFax() && !refObj.getFax())
        refObj.setFax(transObj.getFax());
    if (transObj.getFaxCountryCode() && !refObj.getFaxCountryCode())
        refObj.setFaxCountryCode(transObj.getFaxCountryCode());
    if (transObj.getHoldCode() && !refObj.getHoldCode())
        refObj.setHoldCode(transObj.getHoldCode());
    if (transObj.getHoldDesc() && !refObj.getHoldDesc())
        refObj.setHoldDesc(transObj.getHoldDesc());
    if (transObj.getLicenseExpirDate() && !refObj.getLicenseExpirDate())
        refObj.setLicenseExpirationDate(transObj.getLicenseExpirDate());
    if (transObj.getLastRenewalDate() && !refObj.getLastRenewalDate())
        refObj.setLicenseLastRenewalDate(transObj.getLastRenewalDate());
    if (transObj.getLicesnseOrigIssueDate() && !refObj.getLicesnseOrigIssueDate())
        refObj.setLicOrigIssDate(transObj.getLicesnseOrigIssueDate());
    if (transObj.getPhone1() && !refObj.getPhone1())
        refObj.setPhone1(transObj.getPhone1());
    if (transObj.getPhone1CountryCode() && !refObj.getPhone1CountryCode())
        refObj.setPhone1CountryCode(transObj.getPhone1CountryCode());
    if (transObj.getPhone2() && !refObj.getPhone2())
        refObj.setPhone2(transObj.getPhone2());
    if (transObj.getPhone2CountryCode() && !refObj.getPhone2CountryCode())
        refObj.setPhone2CountryCode(transObj.getPhone2CountryCode());
    if (transObj.getSelfIns() && !refObj.getSelfIns())
        refObj.setSelfIns(transObj.getSelfIns());
    if (transObj.getState() && !refObj.getState())
        refObj.setState(transObj.getState());
    if (transObj.getSuffixName() && !refObj.getSuffixName())
        refObj.setSuffixName(transObj.getSuffixName());
    if (transObj.getZip() && !refObj.getZip())
        refObj.setZip(transObj.getZip());

    var myResult = aa.licenseScript.editRefLicenseProf(refObj);
    if(myResult.getSuccess()) {
        logDebug("Successfully updated reference LP " + transLicNum);
    }
    return refObj.getLicSeqNbr();
}

function populateFromRefLP(licSeqNbr, transLPList, itemCap, licNum, licenseType) {
    var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), licSeqNbr);
    if (!lpsmResult.getSuccess()) {
        logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
    }

    var lpsm = lpsmResult.getOutput();

    // Remove from CAP

    var isPrimary = false;
    if (transLPList != null) {
        for (var currLic in transLPList) {
            var thisLP = transLPList[currLic];
            if (
                thisLP.getLicenseType() == licenseType &&
                thisLP.getLicenseNbr() == licNum) {
                
            }
        }
    }

    // add the LP to the CAP
    var asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm);
    if (!asCapResult.getSuccess()) {
        logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage());
    } else {
        logDebug("Associated the CAP to the new LP");
    }

    // Now make the LP primary again
    if (isPrimary) {
        var capLps = getLicenseProfessional(itemCap);
        for (var thisCapLpNum in capLps) {
            var thisCapLp = capLps[thisCapLpNum];
            if (thisCapLp.getLicenseNbr().equals(licNum)) {
                thisCapLp.setPrintFlag("Y");
                aa.licenseProfessional.editLicensedProfessional(thisCapLp);
                logDebug("Updated primary flag on Cap LP : " + licNum);
            }
        }
    }
}

function validateFromCSLB(licNum, itemCap) {
    

    var expiredLPs = [];
    var checkDate = new Date();

    // Build array of LPs to check
    var workArray = new Array();
    if (licNum) {
        workArray.push(String(licNum));
    }
    var rlpType = "Contractor";
    if (itemCap) {
        var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
        if (capLicenseResult.getSuccess()) {
            var capLicenseArr = capLicenseResult.getOutput();
        } else {
            logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
            return false;
        }

        if (capLicenseArr == null || !capLicenseArr.length) {
            logDebug("**WARNING: no licensed professionals on this CAP");
        } else {
            for (var thisLic in capLicenseArr)
                if (capLicenseArr[thisLic].getLicenseType() == rlpType)
                    workArray.push(capLicenseArr[thisLic]);
        }
    }

    for (var thisLic = 0; thisLic < workArray.length; thisLic++) {
        var licNum = workArray[thisLic];
        var licObj = null;        

        if (typeof licNum == "object") {
            // is this one an object or string?
            licObj = licNum;
            licNum = licObj.getLicenseNbr();            
        }

        // Make the call to the California State License Board

        var endPoint = "https://www.cslb.ca.gov/onlineservices/DataPortalAPI/GetbyClassification.asmx";
        var method = "http://CSLB.Ca.gov/GetLicense";
        var xmlout = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cslb="http://CSLB.Ca.gov/"><soapenv:Header/><soapenv:Body><cslb:GetLicense><cslb:LicenseNumber>%%LICNUM%%</cslb:LicenseNumber><cslb:Token>%%TOKEN%%</cslb:Token></cslb:GetLicense></soapenv:Body></soapenv:Envelope>';
        //var licNum = "9";
        var token = lookup("GRAYQUARTER", "CSLB TOKEN");

        if (!token || token == "") {
            logDebug("GRAYQUARTER CSLB TOKEN not configured");
            return false;
        }

        xmlout = xmlout.replace("%%LICNUM%%", licNum);
        xmlout = xmlout.replace("%%TOKEN%%", token);

        var headers = aa.util.newHashMap();
        headers.put("Content-Type", "text/xml");
        headers.put("SOAPAction", method);

        var res = aa.httpClient.post(endPoint, headers, xmlout);


		// check the results
		var result;
        var isError = false;
        if (!res.getSuccess()) {
            logDebug("CSLB call failed: " + res.getErrorMessage() + " " + res.getErrorType() + " for " + licNum);
            continue;   
        }
        result = String(res.getOutput());
        aa.print(result);
		
        var lpStatus = XMLTagValue(result, "Status");
        var webUrl = "License: <a target='_blank' href='https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=";
        var licUrl = webUrl + licNum + "'>" + licNum + "</a>";
        logDebug(licUrl + " status from CSLB: " + lpStatus);

        if(!lpStatus || lpStatus == "") {
            logDebug("CSLB did not return an LP Status for " + licNum);
            continue;
        }

        if (lpStatus && lpStatus != "CLEAR") {
            //returnMessage += webUrl + licNum + "'>License:" + licNum + "</a>
            logDebug("Status not clear for " + licUrl + " status: " + lpStatus);
            expiredLPs.push("Status not clear for " + licUrl + " status: " + lpStatus);
        }       

        var ExpirationDate = XMLTagValue(result, "ExpirationDate");
        if (ExpirationDate) {            
            var cslbExpDate = new Date(ExpirationDate);
            if(cslbExpDate <= checkDate) {
                expiredLPs.push(licUrl + " License date has expired in CSLB: " + ExpirationDate);
            }
        }
        
        var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
        if (PolicyExpirationDate) {            
            var workersCompExpDate = new Date(PolicyExpirationDate);
            if(workersCompExpDate <= checkDate) {
                expiredLPs.push(licUrl + " Workers Comp date has expired in CSLB: " + PolicyExpirationDate);
            }
        }

        // var BondExpirationDate = XMLTagValue(result, "BondEffectiveDate");
        // if(BondExpirationDate) {
        //     var bondExpDate = new Date(BondExpirationDate);
        //     if(bondExpDate <= checkDate) {
        //         expiredLPs.push(licUrl + " Bond date has expired in CSLB: " + bondExpDate);
        //     }
        // }

        var classErrors = [];
        var recordCap = aa.cap.getCapID(itemCap).getOutput();
        var recordType = String(recordCap.getCapType());
        var validClasses = lookup("CONTRACTOR_CLASS_REC_TYPES", recordType)
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
    
            var Classifications = XMLTagValue(result, "Classifications");
            var ClassificationList = Classifications.split("|");
    
            for (var classificationIndex = 0; classificationIndex < ClassificationList.length; classificationIndex++) {
                var classification = String(ClassificationList[classificationIndex]).toUpperCase();
                logDebug(classification);
                if(classTypeMap[classification]) {
                    classErrors = [];
                    break;
                }
                classErrors.push("License Professional: " + licNum + " is not valid, " + recordType + " requires at least one of following classifications: "  + validClasses.join(", ") + ". Found " + ClassificationList.join(", ") + ".");                                    
            }
        }    
        if(classErrors.length > 0) {
            logDebug("Adding: " + classErrors.length + " to errored list");
            logDebug("Prior error list length: " + expiredLPs.length);
            expiredLPs = expiredLPs.concat(classErrors);
            logDebug("New error list length: " + expiredLPs.length);
        }
         
    } // for each license
    return expiredLPs;
}

function getGISInfo2ASB(svc,layer,attributename) // optional: numDistance, distanceType
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
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
			}
		}
	}
	
	return retString
}

function validateCSLBClassifications(licNum, recordType) {
    // Make the call to the California State License Board

    var returnObj = {
        validated: false,
        message: "",
    };
    var endPoint = "https://www.cslb.ca.gov/onlineservices/DataPortalAPI/GetbyClassification.asmx";
    var method = "http://CSLB.Ca.gov/GetLicense";
    var xmlout = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cslb="http://CSLB.Ca.gov/"><soapenv:Header/><soapenv:Body><cslb:GetLicense><cslb:LicenseNumber>%%LICNUM%%</cslb:LicenseNumber><cslb:Token>%%TOKEN%%</cslb:Token></cslb:GetLicense></soapenv:Body></soapenv:Envelope>';
    //var licNum = "9";
    var token = lookup("GRAYQUARTER", "CSLB TOKEN");

    if (!token || token == "") {
        returnObj.message = "GRAYQUARTER CSLB TOKEN not configured";
        returnObj.validated = false;
        return returnObj;
    }

    xmlout = xmlout.replace("%%LICNUM%%", licNum);
    xmlout = xmlout.replace("%%TOKEN%%", token);

    var headers = aa.util.newHashMap();
    headers.put("Content-Type", "text/xml");
    headers.put("SOAPAction", method);

    var res = aa.httpClient.post(endPoint, headers, xmlout);

    // check the results
    var result;    
    if (!res.getSuccess()) {
        returnObj.message = "CSLB call failed: " + res.getErrorMessage() + " " + res.getErrorType() + " for " + licNum;
        returnObj.validated = false;
        return returnObj;   
    }
    result = String(res.getOutput());
    aa.print(result);

    var validClasses = lookup("CONTRACTOR_CLASS_REC_TYPES", recordType)
    if(!validClasses) {
        logDebug(recordType + " not configured so any LP goes");
        returnObj.validated = true;
        return returnObj;
    }

    var classTypeMap = {};
    validClasses = validClasses.split(",");
    for(var validClassIndex in validClasses) {
        var stdClass = String(validClasses[validClassIndex]).toUpperCase();
        if(!classTypeMap[stdClass]) {
            classTypeMap[stdClass] = true;
        }
    }

    var Classifications = XMLTagValue(result, "Classifications");
    var ClassificationList = Classifications.split("|");

    for (var classificationIndex = 0; classificationIndex < ClassificationList.length; classificationIndex++) {
        var classification = String(ClassificationList[classificationIndex]).toUpperCase();
        logDebug(classification);
        if(classTypeMap[classification]) {
            returnObj.validated = true;
            break;
        }
    }
        
    if(!returnObj.validated) {
        returnObj.message = "License Professional: " + licNum + " is not valid, " + recordType + " requires at least one of following classifications: "  + validClasses.join(", ") + ". Found " + ClassificationList.join(", ") + ".";
    }
    return returnObj;
}