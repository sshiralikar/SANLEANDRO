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