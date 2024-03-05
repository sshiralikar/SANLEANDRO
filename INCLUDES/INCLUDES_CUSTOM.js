// this is PROD
var ENVIRON = "PROD";
var EMAILREPLIES = "noreply@accela.com";
var SENDEMAILS = true;
var ACAURL = "https://aca.accela.com/LADCR";


//set Debug
var vDebugUsers = ['JSCHOMP','EWYLAM','ADMIN','JSCHILLO','JDOLEZAL','SVANIER', 'SGUERRERO'];
if (exists(currentUserID,vDebugUsers)) {
	showDebug = 3;
	showMessage = true;
}
function addACAUrlsVarToEmail(vEParams) {
	//Get base ACA site from standard choices
	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

	//Save Base ACA URL
	addParameter(vEParams,"$$acaURL$$",acaSite);

	//Save Record Direct URL
	addParameter(vEParams,"$$acaRecordURL$$",acaSite + getACAUrl());
}
function addAdHocTaskAssignDept_BCC(adHocProcess, adHocTask, adHocNote, vAsgnDept) {
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//vAsgnDept Assigned to Department must match an AA Department
//Optional 5 parameters = CapID
//Optional 6 parameters = Due Date
	var thisCap = capId;
	var dueDate = aa.util.now();
	if(arguments.length > 4){
		thisCap = arguments[4] != null && arguments[4] != "" ? arguments[4] : capId;
	}
	if (arguments.length > 5) {
		var dateParam = arguments[5];
		if (dateParam != null && dateParam != "") { dueDate = convertDate(dateParam); }
	}

	var departSplits = vAsgnDept.split("/");
	var assignedUser = aa.person.getUser(null,null,null,null,departSplits[0],departSplits[1],departSplits[2],departSplits[3],departSplits[4],departSplits[5]).getOutput();
	assignedUser.setDeptOfUser("BCC/" + vAsgnDept);

	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(dueDate);
	taskObj.setAssignedUser(assignedUser);
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
}
/**
* Add ASIT rows data, format: Array[Map<columnName, columnValue>]
**/
function addAppSpecificTableInfors(tableName, capIDModel, asitFieldArray/** Array[Map<columnName, columnValue>] **/)
{
	if (asitFieldArray == null || asitFieldArray.length == 0)
	{
		return;
	}

	var asitTableScriptModel = aa.appSpecificTableScript.createTableScriptModel();
	var asitTableModel = asitTableScriptModel.getTabelModel();
	var rowList = asitTableModel.getRows();
	asitTableModel.setSubGroup(tableName);
	for (var i = 0; i < asitFieldArray.length; i++)
	{
		var rowScriptModel = aa.appSpecificTableScript.createRowScriptModel();
		var rowModel = rowScriptModel.getRow();
		rowModel.setFields(asitFieldArray[i]);
		rowList.add(rowModel);
	}
	return aa.appSpecificTableScript.addAppSpecificTableInfors(capIDModel, asitTableModel);
}

function addRefContactToRecord(refNum, cType) {
	itemCap = capId;
	if (arguments.length > 2)
		itemCap = arguments[2];

	var refConResult = aa.people.getPeople(refNum);
	if (refConResult.getSuccess()) {
		var refPeopleModel = refConResult.getOutput();
		if (refPeopleModel != null) {
			pm = refPeopleModel;
			pm.setContactType(cType);
			pm.setFlag("N");
			pm.setContactAddressList(getRefAddContactList(refNum));

			var result = aa.people.createCapContactWithRefPeopleModel(itemCap, pm);
			if (result.getSuccess()) {
				logDebug("Successfully added the contact");
			}
			else {
				logDebug("Error creating the applicant " + result.getErrorMessage());
			}
		}
	}
}



function addStdVarsToEmail(vEParams, vCapId) {
	//Define variables
	var servProvCode;
	var cap;
	var capId;
	var capIDString;
	var currentUserID;
	var currentUserGroup;
	var appTypeResult;
	var appTypeString;
	var appTypeArray;
	var capTypeAlias;
	var capName;
	var fileDateObj;
	var fileDate;
	var fileDateYYYYMMDD;
	var parcelArea;
	var valobj;
	var estValue;
	var calcValue;
	var feeFactor;
	var capDetailObjResult;
	var capDetail;
	var houseCount;
	var feesInvoicedTotal;
	var balanceDue;
	var parentCapString;
	var parentArray;
	var parentCapId;
	var addressLine;

	//get standard variables for the record provided
	if(vCapId != null){
		capId = vCapId;
		servProvCode = capId.getServiceProviderCode();
		capIDString = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		capTypeAlias = cap.getCapType().getAlias();
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		valobj = aa.finance.getContractorSuppliedValuation(vCapId,null).getOutput();
		if (valobj.length) {
			estValue = valobj[0].getEstimatedValue();
			calcValue = valobj[0].getCalculatedValue();
			feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
		}

		var capDetailObjResult = aa.cap.getCapDetail(vCapId);
		if (capDetailObjResult.getSuccess())
		{
			capDetail = capDetailObjResult.getOutput();
			houseCount = capDetail.getHouseCount();
			feesInvoicedTotal = capDetail.getTotalFee();
			balanceDue = capDetail.getBalance();
			if (Number(balanceDue) != 'NaN') {
				balanceDue = Number(balanceDue).toFixed(2);
			}
		}
		parentCapString = "" + aa.env.getValue("ParentCapID");
		if (parentCapString.length > 0) {
			parentArray = parentCapString.split("-");
			parentCapId = aa.cap.getCapID(parentArray[0], parentArray[1], parentArray[2]).getOutput();
		}
		if (!parentCapId) {
			parentCapId = getParent();
		}
		if (!parentCapId) {
			parentCapId = getParentLicenseCapID(vCapId);
		}
		addressLine = getAddressInALine();
		currentUserID = aa.env.getValue("CurrentUserID");
		appTypeArray = appTypeString.split("/");
		if(appTypeArray[0].substr(0,1) !="_")
		{
			var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
			if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
		}
		parcelArea = 0;;

		//save variables to email paramater hashtable
		addParameter(vEParams,"$$altid$$",capIDString);
		addParameter(vEParams,"$$capIDString$$",capIDString);
		addParameter(vEParams,"$$currentUserID$$",currentUserID); // seems to cause the issue
		addParameter(vEParams,"$$currentUserGroup$$",currentUserGroup); // seems to cause the issue
		addParameter(vEParams,"$$appTypeString$$",appTypeString);
		addParameter(vEParams,"$$capAlias$$",capTypeAlias);
		addParameter(vEParams,"$$capName$$",capName);
		addParameter(vEParams,"$$capStatus$$",capStatus);
		addParameter(vEParams,"$$fileDate$$",fileDate);
		addParameter(vEParams,"$$fileDateYYYYMMDD$$",fileDateYYYYMMDD);
		addParameter(vEParams,"$$parcelArea$$",parcelArea); // seems to cause the issue
		addParameter(vEParams,"$$estValue$$",estValue);
		addParameter(vEParams,"$$calcValue$$",calcValue);
		addParameter(vEParams,"$$feeFactor$$",feeFactor);
		addParameter(vEParams,"$$houseCount$$",houseCount);
		addParameter(vEParams,"$$feesInvoicedTotal$$",feesInvoicedTotal);
		addParameter(vEParams,"$$balanceDue$$",balanceDue);
		if (parentCapId) {
			addParameter(vEParams,"$$parentCapId$$",parentCapId.getCustomID());
		}
		//Add ACA Urls to Email Variables
		addACAUrlsVarToEmail(vEParams);
		//Add address information
		if (addressLine != null) {
			addParameter(vEParams,"$$capAddress$$",addressLine);
		}
	}
	return vEParams;
}
/*===========================================
Title: addToCat
Purpose: Add the given capId to the CAT_UPDATES set. These records will be sent to the CAT API
Author: John Towell

Parameters:
	capId: table model
============================================== */
function addToCat(capId) {
    try {
        var SET_ID = 'CAT_UPDATES';
        var createResult = createSetIfNeeded(SET_ID);
        if (!createResult.getSuccess()) {
            logDebug("**ERROR: Failed to create " + SET_ID + " set: " + createResult.getErrorMessage());
            return false;
        }
        var addResult = aa.set.add(SET_ID, capId);
        if (!addResult.getSuccess()) {
            logDebug("**ERROR: Failed to add [" + capId + "] to " + SET_ID + " set: " + addResult.getErrorMessage());
            return false;
        }
    } catch (err) {
        logDebug("A JavaScript Error occurred: addToCat: " + err.message);
        logDebug(err.stack);
    }

    return true;

    /**
     * PRIVATE FUNCTIONS
     */

    /**
     * Creates the set if needed.
     */
    function createSetIfNeeded(setId) {
        var theSetResult = aa.set.getSetByPK(setId);
        if (!theSetResult.getSuccess()) {
            theSetResult = aa.set.createSet(setId, setId, null, null);
        }

        return theSetResult;
    }
}


function areRequiredDocumentConditionsMet(stageName) {
	retValue = "";
	itemCap = capId;
	if (arguments.length > 1)
		itemCap = arguments[1];

	if (stageName == "OnSubmit" && publicUser) { // pageflow
		cap = aa.env.getValue("CapModel");
		tmpTable = loadASITable4ACA("REQUIRED DOCUMENTS", cap);
	}
	else {
		tmpTable = loadASITable("REQUIRED DOCUMENTS");
	}
	if (!tmpTable || tmpTable.length == 0) return "";

	for (rowIndex in tmpTable) {
		thisRow = tmpTable[rowIndex];
		thisDocType = thisRow["Document Type"].fieldValue;
		thisStage = thisRow["Record Stage"].fieldValue;

		if (thisStage == stageName) {
			// recording check
			mustBeRecorded = thisRow["Must be recorded?"].fieldValue;
			if (mustBeRecorded == "Yes" || mustBeRecorded == "Y")
				mustBeRecorded = true;
			else mustBeRecorded = false;

			if (mustBeRecorded) {
				recNumber = thisRow["Recording Number"].fieldValue;
				dateRec = thisRow["Date Received for Recording"].fieldValue;
				if ( (recNumber == null || recNumber =="") && (dateRec == null || dateRec == "") )
					retValue += " " +  thisDocType + " document must be recorded before proceeding." + br;
			}
			else { // attached doc check
				numReq = thisRow["Number Required"].fieldValue;
				if (numReq == null || numReq == "") numReq = 0
				else numReq = parseInt(numReq);
				if (numReq > 0) {
					docListArray = null;
					if (stageName == "OnSubmit" && publicUser) { // pageflow
						docListArray = aa.document.getDocumentListByEntity(capIDString,"TMP_CAP").getOutput().toArray();
					}
					else {
						docListResult = aa.document.getCapDocumentList(itemCap,currentUserID);
						if (docListResult.getSuccess()) {
							docListArray = docListResult.getOutput();
						}
						else { logDebug("Exception getting document list " + docListResult.getErrorMessage()); }
					}
					if (docListArray == null || docListArray.length == 0) {
						retValue +=  " You must attach " + numReq + " " + thisDocType + " document(s) before proceeding." + br;
					}
					else {
						docsFound = 0;
						for (dIndex in docListArray) {
							thisDoc = docListArray[dIndex];
							if (thisDoc.getDocCategory() == thisDocType)
								docsFound++;
						}
						if (docsFound < numReq) {
							retValue +=  " You must attach " + numReq + " " + thisDocType + " document(s) before proceeding." + br;
						}
					}
				} // end numReq = 0
			}
		}
	}
	return retValue; // passed
}


function associateLPToPublicUserModel(licenseNum, pu) {
	var licResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licenseNum);
	if (licResult.getSuccess()) {
		var licObj = licResult.getOutput();
		if (licObj != null) {
			licObj = licObj[0];
			if (pu != null) {
				assocResult = aa.licenseScript.associateLpWithPublicUser(pu, licObj);
				if (assocResult.getSuccess())
					logDebug("Successfully linked ref lp " + licenseNum + " to public user account");
				else
					logDebug("Link failed for " + licenseNum + " : " + assocResult.getErrorMessage());
			}
			else { logDebug("Public user object is null"); }
		}
		else { logDebug("lp object is null"); }
	}
	else { logDebug("Error associating lp to pu " + licResult.getErrorMessage()); }
}

function autoInvoiceVoidedFees() {
	var feeSeqListString = aa.env.getValue("FeeItemsSeqNbrArray");	// invoicing fee item list in string type
	var feeSeqList = [];					// fee item list in number type
	var xx;
	for(xx in feeSeqListString) {
		feeSeqList.push(Number(feeSeqListString[xx])); 	// convert the string type array to number type array
	}

	var paymentPeriodList = [];	// payment periods, system need not this parameter for daily side

	// The fee item should not belong to a POS before set the fee item status to "CREDITED".
	if (feeSeqList.length && !(capStatus == '#POS' && capType == '_PER_GROUP/_PER_TYPE/_PER_SUB_TYPE/_PER_CATEGORY')) {
		// the following method will set the fee item status from 'VOIDED' to 'CREDITED' after void the fee item;
		invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
		if (invoiceResult.getSuccess()) {
			logMessage("Invoicing assessed fee items is successful.");
		}
		else {
			logDebug("ERROR: Invoicing the fee items assessed to app # " + capId + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
		}
	}
}


function branchTask(wfstr,wfstat,wfcomment,wfnote) { // optional process name, cap id

                var useProcess = false;
                var processName = "";
                if (arguments.length > 4)
                                {
                                if (arguments[4] != "")
                                                {
                                                processName = arguments[4]; // subprocess
                                                useProcess = true;
                                                }
                                }
                var itemCap = capId;
                if (arguments.length == 6) {
					itemCap = arguments[5]; // use cap ID specified in args
				}

                var workflowResult = aa.workflow.getTasks(itemCap);
               if (workflowResult.getSuccess()) {
                                var wfObj = workflowResult.getOutput();
			   }
                else
                                { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

                if (!wfstat) {
					wfstat = "NA";
				}

				var i;
                for (i in wfObj)
                                {
                                var fTask = wfObj[i];
                               if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
                                                {
                                                var dispositionDate = aa.date.getCurrentDate();
                                                var stepnumber = fTask.getStepNumber();
                                                var processID = fTask.getProcessID();

                                                if (useProcess) {
                                                    aa.workflow.handleDisposition(itemCap,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"B");
												}
                                                else {
                                                    aa.workflow.handleDisposition(itemCap,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"B");
                                                }
                                                logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Branching...");
                                                logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Branching...");
                                                }
                                }
                }

/**
* Contact Object
* <p>
* Properties:
*	people - PeopleModel Object
*   capContact - CapContactModel Object
*	capContactScript - CapContactScriptModel Object
*	capId - capID Object
*	type - Contact Type
*	seqNumber - Transactional Seqence Number
*	asi - associative array of people template attributes
*	customFields - associative array of custom template fields
*	customTables - Not yet implemented
*	primary - Contact is Primary
*	relation - Contact Relation
*	addresses - associative array of address
*	validAttrs - Boolean indicating people template attributes
*	validCustomFields - Boolean indicating custom template fields
*	validCustomTables - Not implemented yet
*	infoTables - Table Array ex infoTables[name][row][column].getValue()
*	attribs - Array of LP Attributes ex attribs[name]
*	valid - Get the Attributes for LP
*	validTables - true if LP has infoTables
*	validAttrs - true if LP has attributes
* </p>
* <p>
* Methods:
*	toString() - Outputs a string of key contact fields
*	getEmailTemplateParams(params,[vContactType]) - Contact Parameters for use in Notification Templates
*	replace(targetCapId) - send this contact to another record, optional new contact type
*	equals(contactObj) - Compares this contact to another contact by comparing key elements
*	saveBase() - Saves base information such as contact type, primary flag, relation
*	save() - Saves all current information to the transactional contact
*	syncCapContactToReference() - Synchronize the contact data from the record with the reference contact by pushing data from the record into reference.
*	syncCapContactFromReference() - Synchronize the reference contact data with the contact on the record by pulling data from reference into the record.
*	getAttribute(vAttributeName) - Get method for people template attributes
*	setAttribute(vAttributeName, vAttributeValue) - Set method for people template attributes
*	getCustomField(vFieldName) - Get method for Custom Template Fields
*	setCustomField(vFieldName,vFieldValue) - Set method for Custom Template Fields
*	remove() - Removes this contact from the transactional record
*	isSingleAddressPerType() - Boolean indicating if this contact has a Single Addresss Per Type
*	getAddressTypeCounts() - returns an associative array of how many adddresses are attached
*	createPublicUser() - For individual contact types, this function checkes to see if public user exists already based on email address then creates a public user and activates it for the agency. It also sends an Activate email and sends a Password Email. If there is a reference contact, it will assocated it with the newly created public user.
*	getCaps([record type filter]) - Returns an array of records related to the reference contact
*	getRelatedContactObjs([record type filter]) - Returns an array of contact objects related to the reference contact
*	getRelatedRefLicProfObjs() - Returns an array of Reference License Professional objects related to the reference contact
*	createRefLicProf(licNum,rlpType,addressType,licenseState, [servProvCode]) - Creates a Reference License Professional based on the contact information. If this contact is linked to a Reference Contact, it will link the new Reference License Professional to the Reference Contact.
*	linkRefContactWithRefLicProf(licnumber, [lictype]) - Link a Reference License Professional to the Reference Contact.
*	getAKA() - Returns an array of AKA Names for the assocated reference contact
*	addAKA(firstName,middleName,lastName,fullName,startDate,endDate) - Adds an AKA Name to the assocated reference contact
*	removeAKA(firstName,middleName,lastName) - Removes an AKA Name from the assocated reference contact
*	hasPublicUser() - Boolean indicating if the contact has an assocated public user account
*	linkToPublicUser(pUserId) - Links the assocated reference contact to the public user account
*	sendCreateAndLinkNotification() - Sends a Create and Link Notification using the PUBLICUSER CREATE AND LINK notification template to the contact for the scenario in AA where a paper application has been submitted
*	getRelatedRefContacts([relConsArray]) - Returns an array of related reference contacts. An optional relationship types array can be used
* </p>
* <p>
* Call Example:
* 	var vContactObj = new contactObj(vCCSM);
*	var contactRecordArray = vContactObj.getAssociatedRecords();
*	var cParams = aa.util.newHashtable();
*	vContactObj.getEmailTemplateParams(cParams);
* </p>
* @param ccsm {CapContactScriptModel}
* @return {contactObj}
*/

function contactObj(ccsm)  {
logDebug("ETW: new 9.0 contactObj function.");
    this.people = null;         // for access to the underlying data
    this.capContact = null;     // for access to the underlying data
    this.capContactScript = null;   // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
	this.customFieldsObj = null;
	this.customFields = new Array();
	this.customTablesObj = null;
	this.customTables = new Array();
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses
    this.validAttrs = false;
	this.validCustomFields = false;
	this.validCustomTables = false;

    this.capContactScript = ccsm;
    if (ccsm)  {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
            }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();

			// contact attributes
			// Load People Template Fields
            if (this.people.getAttributes() != null) {
                this.asiObj = this.people.getAttributes().toArray();
                if (this.asiObj != null) {
                    for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1];
                    this.validAttrs = true;
                }
            }
			// Load Custom Template Fields
			if (this.capContact.getTemplate() != null && this.capContact.getTemplate().getTemplateForms() != null) {
				var customTemplate = this.capContact.getTemplate();
				this.customFieldsObj = customTemplate.getTemplateForms();
				if (!(this.customFieldsObj == null || this.customFieldsObj.size() == 0)) {
					for (var i = 0; i < this.customFieldsObj.size(); i++) {
						var eachForm = this.customFieldsObj.get(i);
						//Sub Group
						var subGroup = eachForm.subgroups;
						if (subGroup == null) {
							continue;
						}
						for (var j = 0; j < subGroup.size(); j++) {
							var eachSubGroup = subGroup.get(j);
							if (eachSubGroup == null || eachSubGroup.fields == null) {
								continue;
							}
							var allFields = eachSubGroup.fields;
							if (!(allFields == null || allFields.size() == 0)) {
								for (var k = 0; k < allFields.size(); k++) {
									var eachField = allFields.get(k);
									this.customFields[eachField.displayFieldName] = eachField.defaultValue;
									logDebug("(contactObj) {" + eachField.displayFieldName + "} = " +  eachField.defaultValue);
									this.validCustomFields = true;
								}
							}
						}
					}
				}
			}
        }

		// contact ASI
		var tm = this.people.getTemplate();
		if (tm)	{
			var templateGroups = tm.getTemplateForms();
			var gArray = new Array();
			if (!(templateGroups == null || templateGroups.size() == 0)) {
				var subGroups = templateGroups.get(0).getSubgroups();
				if (!(subGroups == null || subGroups.size() == 0)) {
					for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
						var subGroup = subGroups.get(subGroupIndex);
						var fields = subGroup.getFields();
						if (!(fields == null || fields.size() == 0)) {
							for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
								var field = fields.get(fieldIndex);
								this.asi[field.getDisplayFieldName()] = field.getDefaultValue();
							}
						}
					}
				}
			}
		}

        //this.primary = this.capContact.getPrimaryFlag().equals("Y");
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
            }
        else {
            pmcal = this.people.getContactAddressList();
            if (pmcal) {
                this.addresses = pmcal.toArray();
            }
        }
    }
        this.toString = function() { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary;  }

        this.getEmailTemplateParams = function (params, vContactType) {
			var contactType = "";
			if (arguments.length == 2) contactType = arguments[1];

            addParameter(params, "$$" + contactType + "LastName$$", this.people.getLastName());
            addParameter(params, "$$" + contactType + "FirstName$$", this.people.getFirstName());
            addParameter(params, "$$" + contactType + "MiddleName$$", this.people.getMiddleName());
            addParameter(params, "$$" + contactType + "BusinesName$$", this.people.getBusinessName());
            addParameter(params, "$$" + contactType + "ContactSeqNumber$$", this.seqNumber);
            addParameter(params, "$$ContactType$$", this.type);
            addParameter(params, "$$" + contactType + "Relation$$", this.relation);
            addParameter(params, "$$" + contactType + "Phone1$$", this.people.getPhone1());
            addParameter(params, "$$" + contactType + "Phone2$$", this.people.getPhone2());
            addParameter(params, "$$" + contactType + "Email$$", this.people.getEmail());
            addParameter(params, "$$" + contactType + "AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
            addParameter(params, "$$" + contactType + "AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
            addParameter(params, "$$" + contactType + "City$$", this.people.getCompactAddress().getCity());
            addParameter(params, "$$" + contactType + "State$$", this.people.getCompactAddress().getState());
            addParameter(params, "$$" + contactType + "Zip$$", this.people.getCompactAddress().getZip());
            addParameter(params, "$$" + contactType + "Fax$$", this.people.getFax());
            addParameter(params, "$$" + contactType + "Country$$", this.people.getCompactAddress().getCountry());
            addParameter(params, "$$" + contactType + "FullName$$", this.people.getFullName());
            return params;
            }

        this.replace = function(targetCapId) { // send to another record, optional new contact type

            var newType = this.type;
            if (arguments.length == 2) newType = arguments[1];
            //2. Get people with target CAPID.
            var targetPeoples = getContactObjs(targetCapId,[String(newType)]);
            //3. Check to see which people is matched in both source and target.
            for (var loopk in targetPeoples)  {
                var targetContact = targetPeoples[loopk];
                if (this.equals(targetPeoples[loopk])) {
                    targetContact.people.setContactType(newType);
                    aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                    targetContact.people.setContactAddressList(this.people.getContactAddressList());
                    overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                    if (overwriteResult.getSuccess())
                        logDebug("overwrite contact " + targetContact + " with " + this);
                    else
                        logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                    return true;
                    }
                }

                var tmpCapId = this.capContact.getCapID();
                var tmpType = this.type;
                this.people.setContactType(newType);
                this.capContact.setCapID(targetCapId);
                createResult = aa.people.createCapContactWithAttribute(this.capContact);
                if (createResult.getSuccess())
                    logDebug("(contactObj) contact created : " + this);
                else
                    logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
                this.capContact.setCapID(tmpCapId);
                this.type = tmpType;
                return true;
        }

        this.equals = function(t) {
            if (t == null) return false;
            if (!String(this.people.type).equals(String(t.people.type))) { return false; }
            if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
            if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
            if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
            if (!String(this.people.getBusinessName()).equals(String(t.people.getBusinessName()))) { return false; }
            return  true;
        }

        this.saveBase = function() {
            // set the values we store outside of the models.
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContact(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) base contact saved : " + this);
            else
                logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
            }

        this.save = function() {
            // set the values we store outside of the models
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            this.capContact.setPeople(this.people);
            saveResult = aa.people.editCapContactWithAttribute(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) contact saved : " + this);
            else
                logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
            }

		this.syncCapContactToReference = function() {

			if(this.refSeqNumber){
				var vRefContPeopleObj = aa.people.getPeople(this.refSeqNumber).getOutput();
				var saveResult = aa.people.syncCapContactToReference(this.capContact,vRefContPeopleObj);
				if (saveResult.getSuccess())
					logDebug("(contactObj) syncCapContactToReference : " + this);
				else
					logDebug("(contactObj) error syncCapContactToReference : " + this + " : " + saveResult.getErrorMessage());
			}
			else{
				logDebug("(contactObj) error syncCapContactToReference : No Reference Contact to Syncronize With");
			}

		}
		this.syncCapContactFromReference = function() {

			if(this.refSeqNumber){
				var vRefContPeopleObj = aa.people.getPeople(this.refSeqNumber).getOutput();
				var saveResult = aa.people.syncCapContactFromReference(this.capContact,vRefContPeopleObj);
				if (saveResult.getSuccess())
					logDebug("(contactObj) syncCapContactFromReference : " + this);
				else
					logDebug("(contactObj) error syncCapContactFromReference : " + this + " : " + saveResult.getErrorMessage());
			}
			else{
				logDebug("(contactObj) error syncCapContactFromReference : No Reference Contact to Syncronize With");
			}

		}

        //get method for Attributes
        this.getAttribute = function (vAttributeName){
            var retVal = null;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null)
                    retVal = tmpVal.getAttributeValue();
            }
            return retVal;
        }

        //Set method for Attributes
        this.setAttribute = function(vAttributeName,vAttributeValue){
			var retVal = false;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null){
                    tmpVal.setAttributeValue(vAttributeValue);
                    retVal = true;
                }
            }
            return retVal;
        }

		//get method for Custom Template Fields
        this.getCustomField = function(vFieldName){
            var retVal = null;
            if(this.validCustomFields){
                var tmpVal = this.customFields[vFieldName.toString()];
                if(!matches(tmpVal,undefined,null,"")){
                    retVal = tmpVal;
				}
            }
            return retVal;
        }

		//Set method for Custom Template Fields
        this.setCustomField = function(vFieldName,vFieldValue){

            var retVal = false;
            if(this.validCustomFields){
				if (!(this.customFieldsObj == null || this.customFieldsObj.size() == 0)) {
					for (var i = 0; i < this.customFieldsObj.size(); i++) {
						var eachForm = this.customFieldsObj.get(i);
						//Sub Group
						var subGroup = eachForm.subgroups;
						if (subGroup == null) {
							continue;
						}
						for (var j = 0; j < subGroup.size(); j++) {
							var eachSubGroup = subGroup.get(j);
							if (eachSubGroup == null || eachSubGroup.fields == null) {
								continue;
							}
							var allFields = eachSubGroup.fields;
							for (var k = 0; k < allFields.size(); k++) {
								var eachField = allFields.get(k);
								if(eachField.displayFieldName == vFieldName){
								logDebug("(contactObj) updating custom field {" + eachField.displayFieldName + "} = " +  eachField.defaultValue + " to " + vFieldValue);
								eachField.setDefaultValue(vFieldValue);
								retVal = true;
								}
							}
						}
					}
				}
            }
            return retVal;
        }

        this.remove = function() {
            var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber)
            if (removeResult.getSuccess())
                logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
            else
                logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
            }

        this.isSingleAddressPerType = function() {
            if (this.addresses.length > 1)
                {

                var addrTypeCount = new Array();
                for (y in this.addresses)
                    {
                    thisAddr = this.addresses[y];
                    addrTypeCount[thisAddr.addressType] = 0;
                    }

                for (yy in this.addresses)
                    {
                    thisAddr = this.addresses[yy];
                    addrTypeCount[thisAddr.addressType] += 1;
                    }

                for (z in addrTypeCount)
                    {
                    if (addrTypeCount[z] > 1)
                        return false;
                    }
                }
            else
                {
                return true;
                }

            return true;

            }

        this.getAddressTypeCounts = function() { //returns an associative array of how many adddresses are attached.

            var addrTypeCount = new Array();

            for (y in this.addresses)
                {
                thisAddr = this.addresses[y];
                addrTypeCount[thisAddr.addressType] = 0;
                }

            for (yy in this.addresses)
                {
                thisAddr = this.addresses[yy];
                addrTypeCount[thisAddr.addressType] += 1;
                }

            return addrTypeCount;

            }

        this.createPublicUser = function() {

            if (!this.capContact.getEmail())
            { logDebug("(contactObj) Couldn't create public user for : " + this +  ", no email address"); return false; }

            if (String(this.people.getContactTypeFlag()).equals("organization"))
            { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }

            // check to see if public user exists already based on email address
            var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail())
            if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                userModel = getUserResult.getOutput();
                logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
            }

            if (!userModel) // create one
                {
                logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail());
                var publicUser = aa.publicUser.getPublicUserModel();
                publicUser.setFirstName(this.capContact.getFirstName());
                publicUser.setLastName(this.capContact.getLastName());
                publicUser.setEmail(this.capContact.getEmail());
                publicUser.setUserID(this.capContact.getEmail());
                publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                publicUser.setAuditID("PublicUser");
                publicUser.setAuditStatus("A");
                publicUser.setCellPhone(this.people.getPhone2());

                var result = aa.publicUser.createPublicUser(publicUser);
                if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(),userSeqNum,"ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendActivateEmail(userModel, true, true);

                // send another email
                aa.publicUser.sendPasswordEmail(userModel);
                }
                else {
                    logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }
            }

        //  Now that we have a public user let's connect to the reference contact

        if (this.refSeqNumber)
            {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
            }


        return userModel; // send back the new or existing public user
        }

        this.getCaps = function() { // option record type filter


            if (this.refSeqNumber) {
                aa.print("ref seq : " + this.refSeqNumber);
                var capTypes = "*/*/*/*";
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel();
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput();
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ;
                pm.setContactSeqNumber(this.refSeqNumber);

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();

                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (appMatch(capTypes,thisCapId)) {
                        resultArray.push(thisCapId)
                        }
                    }
				}

        return resultArray;
        }

        this.getRelatedContactObjs = function() { // option record type filter

            if (this.refSeqNumber) {
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel();
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput();
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ;
                pm.setContactSeqNumber(this.refSeqNumber);

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();

                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        var ccsm = aa.people.getCapContactByPK(thisCapId, cList[j].getPeople().contactSeqNumber).getOutput();
                        var newContactObj = new contactObj(ccsm);
                        resultArray.push(newContactObj)
                        }
                    }
            }

        return resultArray;
        }

		this.getRelatedRefLicProfObjs = function(){

			var refLicProfObjArray = new Array();

			// optional 2rd parameter serv_prov_code
				var updating = false;
				var serv_prov_code_4_lp = aa.getServiceProviderCode();
				if (arguments.length == 1) {
					serv_prov_code_4_lp = arguments[0];
					}

			if(this.refSeqNumber && serv_prov_code_4_lp)
			{
			  var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
			  xRefContactEntity.setServiceProviderCode(serv_prov_code_4_lp);
			  xRefContactEntity.setContactSeqNumber(parseInt(this.refSeqNumber));
			  xRefContactEntity.setEntityType("PROFESSIONAL");
			  //xRefContactEntity.setEntityID1(parseInt(refLicProfSeq));
			  var auditModel = xRefContactEntity.getAuditModel();
			  auditModel.setAuditDate(new Date());
			  auditModel.setAuditID(currentUserID);
			  auditModel.setAuditStatus("A")
			  xRefContactEntity.setAuditModel(auditModel);
			  var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
			  var xRefContactEntList = xRefContactEntityBusiness.getXRefContactEntityList(xRefContactEntity);
			  var xRefContactEntArray = xRefContactEntList.toArray();
			  if(xRefContactEntArray)
			  {
				 for(iLP in xRefContactEntArray){
					 var xRefContactEnt = xRefContactEntArray[iLP];
					 var lpSeqNbr = xRefContactEnt.getEntityID1();
					 var lpObjResult = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(),lpSeqNbr);
					 var refLicNum = lpObjResult.getOutput().getStateLicense();

					 refLicProfObjArray.push(new licenseProfObject1(refLicNum));

				 }

			  }
			  else
			  {
				  logDebug("(contactObj.getRelatedRefLicProfObjs) - No Related Reference License License Professionals");
			  }

			  return refLicProfObjArray;
			}
			else
			{
			  logDebug("**ERROR:Some Parameters are empty");
			}

		}

		this.linkRefContactWithRefLicProf = function(licnumber, lictype){

			var lpObj = new licenseProfObject(licnumber,lictype);
			var refLicProfSeq = lpObj.refLicModel.getLicSeqNbr();
			// optional 2rd parameter serv_prov_code
				var updating = false;
				var serv_prov_code_4_lp = aa.getServiceProviderCode();
				if (arguments.length == 3) {
					serv_prov_code_4_lp = arguments[2];
					}

			if(this.refSeqNumber && refLicProfSeq && serv_prov_code_4_lp)
			{
			  var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
			  xRefContactEntity.setServiceProviderCode(serv_prov_code_4_lp);
			  xRefContactEntity.setContactSeqNumber(parseInt(this.refSeqNumber));
			  xRefContactEntity.setEntityType("PROFESSIONAL");
			  xRefContactEntity.setEntityID1(parseInt(refLicProfSeq));
			  var auditModel = xRefContactEntity.getAuditModel();
			  auditModel.setAuditDate(new Date());
			  auditModel.setAuditID(currentUserID);
			  auditModel.setAuditStatus("A")
			  xRefContactEntity.setAuditModel(auditModel);
			  var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
			  var existedModel = xRefContactEntityBusiness.getXRefContactEntityByUIX(xRefContactEntity);
			  if(existedModel.getContactSeqNumber())
			  {
				logDebug("(contactObj) The License Professional has been linked to the Reference Contact.");
			  }
			  else
			  {
				var XRefContactEntityCreatedResult = xRefContactEntityBusiness.createXRefContactEntity(xRefContactEntity);
				if (XRefContactEntityCreatedResult)
				{
				  logDebug("(contactObj) The License Professional has been linked to the Reference Contact.");
				}
				else
				{
				  logDebug("(contactObj) **ERROR:License professional failed to link to reference contact.  Reason: " +  XRefContactEntityCreatedResult.getErrorMessage());
				}
			  }
			}
			else
			{
			  logDebug("**ERROR:Some Parameters are empty");
			}

		}

        this.createRefLicProf = function(licNum,rlpType,addressType,licenseState) {

            // optional 3rd parameter serv_prov_code
            var updating = false;
            var serv_prov_code_4_lp = aa.getServiceProviderCode();
            if (arguments.length == 5) {
                serv_prov_code_4_lp = arguments[4];
                aa.setDelegateAgencyCode(serv_prov_code_4_lp);
                }

            // addressType = one of the contact address types, or null to pull from the standard contact fields.
            var newLic = getRefLicenseProf(licNum,rlpType);

            if (newLic) {
                updating = true;
                logDebug("(contactObj) Updating existing Ref Lic Prof : " + licNum);
                }
            else {
                var newLic = aa.licenseScript.createLicenseScriptModel();
                }

            peop = this.people;
            cont = this.capContact;
            if (cont.getFirstName() != null) newLic.setContactFirstName(cont.getFirstName());
            if (peop.getMiddleName() != null) newLic.setContactMiddleName(peop.getMiddleName()); // use people for this
            if (cont.getLastName() != null) if (peop.getNamesuffix() != null) newLic.setContactLastName(cont.getLastName() + " " + peop.getNamesuffix()); else newLic.setContactLastName(cont.getLastName());
            if (peop.getBusinessName() != null) newLic.setBusinessName(peop.getBusinessName());
            if (peop.getPhone1() != null) newLic.setPhone1(peop.getPhone1());
            if (peop.getPhone2() != null) newLic.setPhone2(peop.getPhone2());
            if (peop.getEmail() != null) newLic.setEMailAddress(peop.getEmail());
            if (peop.getFax() != null) newLic.setFax(peop.getFax());
            newLic.setAgencyCode(serv_prov_code_4_lp);
            newLic.setAuditDate(sysDate);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setStateLicense(licNum);
            newLic.setLicState(licenseState);
            //setting this field for a future enhancement to filter license types by the licensing board field. (this will be populated with agency names)
            var agencyLong = lookup("CONTACT_ACROSS_AGENCIES",servProvCode);
            if (!matches(agencyLong,undefined,null,"")) newLic.setLicenseBoard(agencyLong); else newLic.setLicenseBoard("");

            var addr = null;

            if (addressType) {
                for (var i in this.addresses) {
                    var cAddr = this.addresses[i];
                    if (addressType.equals(cAddr.getAddressType())) {
                        addr = cAddr;
                    }
                }
            }

            if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address

            if (addr.getAddressLine1() != null) newLic.setAddress1(addr.getAddressLine1());
            if (addr.getAddressLine2() != null) newLic.setAddress2(addr.getAddressLine2());
            if (addr.getAddressLine3() != null) newLic.getLicenseModel().setTitle(addr.getAddressLine3());
            if (addr.getCity() != null) newLic.setCity(addr.getCity());
            if (addr.getState() != null) newLic.setState(addr.getState());
            if (addr.getZip() != null) newLic.setZip(addr.getZip());
            if (addr.getCountryCode() != null) newLic.getLicenseModel().setCountryCode(addr.getCountryCode());

            if (updating){
                myResult = aa.licenseScript.editRefLicenseProf(newLic);

			}
            else{
                myResult = aa.licenseScript.createRefLicenseProf(newLic);
				if (myResult.getSuccess())
                {
					var newRefLicSeqNbr = parseInt(myResult.getOutput());
					this.linkRefContactWithRefLicProf(licNum,rlpType,serv_prov_code_4_lp);
				}
			}

            if (arguments.length == 5) {
                aa.resetDelegateAgencyCode();
            }

            if (myResult.getSuccess())
                {
                logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " From Contact " + this);
                return true;
                }
            else
                {
                logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
                return false;
                }
        }

        this.getAKA = function() {
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            if (this.refSeqNumber) {
                return aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber)).toArray();
                }
            else {
                logDebug("contactObj: Cannot get AKA names for a non-reference contact");
                return false;
                }
            }

        this.addAKA = function(firstName,middleName,lastName,fullName,startDate,endDate) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot add AKA name for non-reference contact");
                return false;
                }

            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var args = new Array();
            var akaModel = aa.proxyInvoker.newInstance("com.accela.orm.model.contact.PeopleAKAModel",args).getOutput();
            var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();

            var a = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            akaModel.setServiceProviderCode(aa.getServiceProviderCode());
            akaModel.setContactNumber(parseInt(this.refSeqNumber));
            akaModel.setFirstName(firstName);
            akaModel.setMiddleName(middleName);
            akaModel.setLastName(lastName);
            akaModel.setFullName(fullName);
            akaModel.setStartDate(startDate);
            akaModel.setEndDate(endDate);
            auditModel.setAuditDate(new Date());
            auditModel.setAuditStatus("A");
            auditModel.setAuditID("ADMIN");
            akaModel.setAuditModel(auditModel);
            a.add(akaModel);

            aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, a);
            }

        this.removeAKA = function(firstName,middleName,lastName) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot remove AKA name for non-reference contact");
                return false;
                }

            var removed = false;
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var l = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));

            var i = l.iterator();
            while (i.hasNext()) {
                var thisAKA = i.next();
                if ((!thisAKA.getFirstName() || thisAKA.getFirstName().equals(firstName)) && (!thisAKA.getMiddleName() || thisAKA.getMiddleName().equals(middleName)) && (!thisAKA.getLastName() || thisAKA.getLastName().equals(lastName))) {
                    i.remove();
                    logDebug("contactObj: removed AKA Name : " + firstName + " " + middleName + " " + lastName);
                    removed = true;
                    }
                }

            if (removed)
                aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, l);
            }

        this.hasPublicUser = function() {
            if (this.refSeqNumber == null) return false;
            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(this.refSeqNumber));

            if (s_publicUserResult.getSuccess()) {
                var fpublicUsers = s_publicUserResult.getOutput();
                if (fpublicUsers == null || fpublicUsers.size() == 0) {
                    logDebug("The contact("+this.refSeqNumber+") is not associated with any public user.");
                    return false;
                } else {
                    logDebug("The contact("+this.refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                    return true;
                }
            } else { logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage()); return false; }
        }

        this.linkToPublicUser = function(pUserId) {

            if (pUserId != null) {
                var pSeqNumber = pUserId.replace('PUBLICUSER','');

                var s_publicUserResult = aa.publicUser.getPublicUser(aa.util.parseLong(pSeqNumber));

                if (s_publicUserResult.getSuccess()) {
                    var linkResult = aa.licenseScript.associateContactWithPublicUser(pSeqNumber, this.refSeqNumber);

                    if (linkResult.getSuccess()) {
                        logDebug("Successfully linked public user " + pSeqNumber + " to contact " + this.refSeqNumber);
                    } else {
                        logDebug("Failed to link contact to public user");
                        return false;
                    }
                } else {
                    logDebug("Could not find a public user with the seq number: " + pSeqNumber);
                    return false;
                }


            } else {
                logDebug("No public user id provided");
                return false;
            }
        }

        this.sendCreateAndLinkNotification = function() {
            //for the scenario in AA where a paper application has been submitted
            var toEmail = this.people.getEmail();

            if (toEmail) {
                var params = aa.util.newHashtable();
                getACARecordParam4Notification(params,acaUrl);
                addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
                addParameter(params,"$$altID$$",capIDString);
                var notificationName;

                if (this.people.getContactTypeFlag() == "individual") {
                    notificationName = this.people.getFirstName() + " " + this.people.getLastName();
                } else {
                    notificationName = this.people.getBusinessName();
                }

                if (notificationName)
                    addParameter(params,"$$notificationName$$",notificationName);
                if (this.refSeqNumber) {
                    var v = new verhoeff();
                    var pinCode = v.compute(String(this.refSeqNumber));
                    addParameter(params,"$$pinCode$$",pinCode);

                    sendNotification(sysFromEmail,toEmail,"","PUBLICUSER CREATE AND LINK",params,null);
                }


            }

        }

        this.getRelatedRefContacts = function() { //Optional relationship types array

            var relTypes;
            if (arguments.length > 0) relTypes = arguments[0];

            var relConsArray = new Array();

            if (matches(this.refSeqNumber,null,undefined,"")) return relConsArray;

            //check as the source
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setContactSeqNumber(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);


            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getEntityID1());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            //check as the target
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setEntityID1(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);

            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getContactSeqNumber());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            return relConsArray;
        }
    }
function contactSetPrimary(pContactNbr)
{
// Makes contact the Primary Contact
// 06SSP-00186
//
if (pContactNbr==null)
	{
	logDebug("**ERROR: ContactNbr parameter is null");
	return false;
	}
else
	{
	var capContactResult = aa.people.getCapContactByPK(capId, pContactNbr);
	if (capContactResult.getSuccess())
		{
		var contact = capContactResult.getOutput();;
		var peopleObj=contact.getCapContactModel().getPeople();
		peopleObj.setFlag("Y");
		contact.getCapContactModel().setPeople(peopleObj);
		var editResult = aa.people.editCapContact(contact.getCapContactModel());
		if (editResult.getSuccess())
			{
			logDebug("Contact successfully set to Primary");
			return true;
			}
		else
			{
			logDebug("**ERROR: Could not set contact to Primary: "+editResult.getErrorMessage());
			return false;
			}
		}
	else
		{
		logDebug("**ERROR: Can't get contact: "+capContactResult.getErrorMessage());
		return false;
		}
	}
}

function copyAddress(srcCapId, targetCapId)
{
	//1. Get address with source CAPID.
	var capAddresses = getAddress(srcCapId);
	if (capAddresses == null || capAddresses.length == 0)
	{
		return;
	}
	//2. Get addresses with target CAPID.
	var targetAddresses = getAddress(targetCapId);
	//3. Check to see which address is matched in both source and target.
	for (loopk in capAddresses)
	{
		sourceAddressfModel = capAddresses[loopk];
		//3.1 Set target CAPID to source address.
		sourceAddressfModel.setCapID(targetCapId);
		targetAddressfModel = null;
		//3.2 Check to see if sourceAddress exist.
		if (targetAddresses != null && targetAddresses.length > 0)
		{
			for (loop2 in targetAddresses)
			{
				if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2]))
				{
					targetAddressfModel = targetAddresses[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched address model.
		if (targetAddressfModel != null)
		{

			//3.3.1 Copy information from source to target.
			aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
			//3.3.2 Edit address with source address information.
			aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
			logDebug("Copying address");
		}
		//3.4 It is new address model.
		else
		{
			//3.4.1 Create new address.
			logDebug("Copying address");
			aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
		}
	}
}
function copyAppSpecificInfo(srcCapId, targetCapId)
{
	//1. Get Application Specific Information with source CAPID.
	var  appSpecificInfo = getAppSpecificInfo(srcCapId);
	if (appSpecificInfo == null || appSpecificInfo.length == 0)
	{
		return;
	}
	//2. Set target CAPID to source Specific Information.
	for (loopk in appSpecificInfo)
	{
		var sourceAppSpecificInfoModel = appSpecificInfo[loopk];

		sourceAppSpecificInfoModel.setPermitID1(targetCapId.getID1());
		sourceAppSpecificInfoModel.setPermitID2(targetCapId.getID2());
		sourceAppSpecificInfoModel.setPermitID3(targetCapId.getID3());
		//3. Edit ASI on target CAP (Copy info from source to target)
		aa.appSpecificInfo.editAppSpecInfoValue(sourceAppSpecificInfoModel);
	}
}
function copyAppSpecificRenewal(AInfo,newCap) // copy all App Specific info into new Cap, 1 optional parameter for ignoreArr
{
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2)
	{
		ignoreArr = arguments[2];
		limitCopy = true;
	}

	for (asi in AInfo){
		//Check list
		if(limitCopy){
			var ignore=false;
		  	for(var i = 0; i < ignoreArr.length; i++)
		  		if(ignoreArr[i] == asi){
		  			ignore=true;
					logDebug("Skipping ASI Field: " + ignoreArr[i]);
		  			break;
		  		}
		  	if(ignore)
		  		continue;
		}
		//logDebug("Copying ASI Field: " + asi);
		editAppSpecific(asi,AInfo[asi],newCap);
	}
}
function copyASIInfo(srcCapId, targetCapId)
{
	//copy ASI infomation
	var AppSpecInfo = new Array();
	loadAppSpecific(AppSpecInfo,srcCapId);
	var recordType = "";

	var targetCapResult = aa.cap.getCap(targetCapId);

	if (!targetCapResult.getSuccess()) {
			logDebug("Could not get target cap object: " + targetCapId);
		}
	else	{
		var targetCap = targetCapResult.getOutput();
			targetAppType = targetCap.getCapType();		//create CapTypeModel object
			targetAppTypeString = targetAppType.toString();
			logDebug(targetAppTypeString);
		}

	var ignore = lookup("EMSE:ASI Copy Exceptions",targetAppTypeString);
	var ignoreArr = new Array();
	if(ignore != null)
	{
		ignoreArr = ignore.split("|");
		copyAppSpecificRenewal(AppSpecInfo,targetCapId, ignoreArr);
	}
	else
	{
		aa.print("something");
		copyAppSpecificRenewal(AppSpecInfo,targetCapId);

	}
}
function copyASITablesWithRemove(pFromCapId, pToCapId) {
	// Function dependencies on addASITable()
	// par3 is optional 0 based string array of table to ignore
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++)
				if (ignoreArr[i] == tn) {
					ignore = true;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
			var numrows = 1;
			while (tsmfldi.hasNext()) // cycle through fields
			{
				if (!tsmcoli.hasNext()) // cycle through columns
				{
					var tsmcoli = tsm.getColumns().iterator();
					tempArray.push(tempObject); // end of record
					var tempObject = new Array(); // clear the temp obj
					numrows++;
				}
				var tcol = tsmcoli.next();
				var tval = tsmfldi.next();

				var readOnly = 'N';
				if (readOnlyi.hasNext()) {
					readOnly = readOnlyi.next();
				}

				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject); // end of record
		}
		removeASITable(tn, pToCapId)
		addASITable(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
}

/*--------------------------------------------------------------------------------------------------------------------/
| Start ETW 12/3/14 copyContacts3_0
/--------------------------------------------------------------------------------------------------------------------*/
function copyContacts3_0(srcCapId, targetCapId) {
    //1. Get people with source CAPID.
    var capPeoples = getPeople3_0(srcCapId);
    if (capPeoples == null || capPeoples.length == 0) {
        return;
    }
    //2. Get people with target CAPID.
    var targetPeople = getPeople3_0(targetCapId);
    //3. Check to see which people is matched in both source and target.
    for (loopk in capPeoples) {
        sourcePeopleModel = capPeoples[loopk];
        //3.1 Set target CAPID to source people.
        sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
        targetPeopleModel = null;
        //3.2 Check to see if sourcePeople exist.
        if (targetPeople != null && targetPeople.length > 0) {
            for (loop2 in targetPeople) {
                if (isMatchPeople3_0(sourcePeopleModel, targetPeople[loop2])) {
                    targetPeopleModel = targetPeople[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched people model.
        if (targetPeopleModel != null) {
            //3.3.1 Copy information from source to target.
            aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
            //3.3.2 Copy contact address from source to target.
            if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople()) {
                targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
            }
            //3.3.3 Edit People with source People information.
            aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
        }
            //3.4 It is new People model.
        else {
            //3.4.1 Create new people.
            aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
        }
    }
}
/*--------------------------------------------------------------------------------------------------------------------/
| End ETW 12/3/14 copyContacts3_0
/--------------------------------------------------------------------------------------------------------------------*/


function copyDocuments(pFromCapId, pToCapId) {

	//Copies all attachments (documents) from pFromCapId to pToCapId
	var vFromCapId = pFromCapId;
	var vToCapId = pToCapId;
	var categoryArray = new Array();

	// third optional parameter is comma delimited list of categories to copy.
	if (arguments.length > 2) {
		categoryList = arguments[2];
		categoryArray = categoryList.split(",");
	}

	var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	if(capDocResult.getSuccess()) {
		if(capDocResult.getOutput().size() > 0) {
	    	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
	    		var documentObject = capDocResult.getOutput().get(docInx);
	    		currDocCat = "" + documentObject.getDocCategory();
	    		if (categoryArray.length == 0 || exists(currDocCat, categoryArray)) {
	    			// download the document content
					var useDefaultUserPassword = true;
					//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
					var EMDSUsername = null;
					var EMDSPassword = null;
					var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
					if(downloadResult.getSuccess()) {
						var path = downloadResult.getOutput();
						logDebug("path=" + path);
					}
					var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
					documentObject.setDocumentNo(null);
					documentObject.setCapID(vToCapId)
					documentObject.setEntityID(tmpEntId);

					// Open and process file
					try {
						// put together the document content - use java.io.FileInputStream
						var newContentModel = aa.document.newDocumentContentModel().getOutput();
					inputstream = aa.io.FileInputStream(path);
						newContentModel.setDocInputStream(inputstream);
						documentObject.setDocumentContent(newContentModel);
						var newDocResult = aa.document.createDocument(documentObject);
						if (newDocResult.getSuccess()) {
							newDocResult.getOutput();
							logDebug("Successfully copied document: " + documentObject.getFileName());
						}
						else {
							logDebug("Failed to copy document: " + documentObject.getFileName());
							logDebug(newDocResult.getErrorMessage());
						}
					}
					catch (err) {
						logDebug("Error copying document: " + err.message);
						return false;
					}
				}
	    	} // end for loop
		}
    }
}
function doAllContactsHaveEmail(itemCap) {
	vConObjArry = getContactObjsByCap_SEA(itemCap);
	for (x in vConObjArry) {
		vConObj = vConObjArry[x];
		if (vConObj) {
			conEmail = vConObj.people.getEmail();
		}
		if (conEmail && conEmail != ""  ) {
			continue;
		}
		return false;
	}
	return true;
}
function doAssocFormRecs(formDataField, newAfData) {

	// FormDataField contains information about the child records already created.  it is either null, or the label of a hidden textArea field on the parent record.
	// if FormDataField is null, we will use the database to get info on thechild records that are already created.
	// if FormDataField is not null, the field will be used to store JSON data about the records.

	// newAfData is a JSON object that describes the records to create.  Structured like:
	// [{"ID":"1","Alias":"Food License","recordId":"14TMP-11111"}];
	//

	try {

		// get all record types

		var allRecordTypeMap = aa.util.newHashMap();
		var allRecordTypes = aa.cap.getCapTypeList(null).getOutput();
		if (allRecordTypes != null && allRecordTypes.length > 0) {
			for (var i = 0; i < allRecordTypes.length; i++) {
				var recordType = allRecordTypes[i].getCapType();
				var alias = recordType.getAlias();
				allRecordTypeMap.put(alias, recordType);
			}
		}

		// get an object representing all the existing child records in the database

		var childRecs = [];
		var capScriptModels = aa.cap.getChildByMasterID(capId).getOutput();
		if (capScriptModels) {
			for (var i = 0; i < capScriptModels.length; i++) {
				var capScriptModel = capScriptModels[i];
				if (capScriptModel) {
					var project = capScriptModel.getProjectModel();
					if (capScriptModel.getCapID() != null && project != null && project.getProject() != null && "AssoForm".equals(project.getProject().getRelationShip())) {
						var ct = capScriptModel.getCapModel().getCapType();
						childRecs.push({
							"ID" : i,
							"Alias" : String(capScriptModel.getCapModel().getAppTypeAlias()),
							"recordId" : String(capScriptModel.getCapID().getCustomID())
						});
						logDebug("adding : " + String(capScriptModel.getCapID().getCustomID()) + " to list of viable child records");
					}
				}
			}
		}

		if (!formDataField) { // use child records in database
			var afData = childRecs;
		} else { // use form field on record as the list of existing child records
			var afData = AInfo[formDataField];
			if (!afData || afData == "") {
				afData = [];
			} else {
				afData = JSON.parse(afData);
			}

			// filter this list against the existing child records, remove any that aren't really child records.
			afData = afData.filter(function (o) {
					bool = childRecs.map(function (e) {
							return e.recordId
						}).indexOf(o.recordId) >= 0;
					if (!bool)
						logDebug("Removing " + o.recordId + " from the list as it is not a viable child record");
					return bool
				});

			// remove any child recs that aren't in the form data field.
			for (var i in childRecs) {
				if (afData.map(function (e) {
						return e.recordId
					}).indexOf(childRecs[i].recordId) == -1) {
					logDebug("removing " + childRecs[i].recordId + " from record association, not found in " + formDataField);
					aa.cap.removeAppHierarchy(capId, aa.cap.getCapID(childRecs[i].recordId).getOutput());
				}
			}
		}

		logDebug("Existing Record Form Data (after filtering out bad data) : " + JSON.stringify(afData));

		// Check the existing child records and re-use any of the same type.
		// This code only looks at the record type to be created, not an ID field.  It's assumed that if we are using this code
		// we probably aren't using an ASI table, so we're ignoring the ID field.

		for (var i in newAfData) {
			var n = newAfData[i];
			var z = afData.map(function (e) {
					return e.Alias;
				}).indexOf(n.Alias); // found a match
			if (z >= 0) {
				n.recordId = afData[z].recordId; // use this record
				logDebug(n.Alias + " will use existing viable child record id " + n.recordId);
				afData.splice(z, 1);
			} else {
				logDebug("no " + n.Alias + " record found in existing afData");
			}
		}

		// Delete everything thats left in AfData, we aren't using it.

		for (var i in afData) {
			logDebug("removing unused child record " + afData[i].recordId);
			aa.cap.removeAppHierarchy(capId, aa.cap.getCapID(afData[i].recordId).getOutput());
		}

		// create any records that don't already exist.

		for (var i in newAfData) {
			var r = newAfData[i];
			var ctm = allRecordTypeMap.get(r.Alias);
			if (!newAfData[i].recordId || newAfData[i].recordId == "") {
				logDebug("attempting to create record : " + ctm);
				var result = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE CAP");
				if (result.getSuccess() && result.getOutput() != null) {
					var newCapId = result.getOutput();
					logDebug("created new associated form record " + newCapId.getCustomID() + " for type " + r.Alias);
					aa.cap.createAssociatedFormsHierarchy(capId, newCapId);
					var capResult = aa.cap.getCap(newCapId);
					var capModel = capResult.getOutput().getCapModel();
					// custom for BCC.   Set a value on the child record so we can testing the page flow in order to skip the "parentID" request.
					capModel.setSpecialText("form");
					//capModel.setApplicantModel(cap.getApplicantModel());
					aa.cap.editCapByPK(capModel);
					r.recordId = String(newCapId.getCustomID());
					// stuff can be copied in here, if needed.   I think it should be copied in after the CTRCA
				} else {
					logDebug("error creating new associated form record for type " + r.Alias + ", " + result.getErrorMessage());
				}
			} else {
				logDebug("using existing associated form record " + r.recordId + " for type " + r.Alias);
			}
		}

		// save JSON data to field on parent page.

		if (formDataField) {editAppSpecific(formDataField, JSON.stringify(newAfData));}
	} catch (err) {
		logDebug("runtime error : " + err.message);
		logDebug("runtime error : " + err.stack);
	}

}
function doesContactExistOnRecord(cSeqNum, itemCap) {
	var contactArr = getContactObjsByCap_BCC(itemCap);
	for (var cIndex in contactArr) {
		var thisContact = contactArr[cIndex];
		if (thisContact.type == "Business Owner") {
			var refContactSeqNum = thisContact.refSeqNumber;
			if (refContactSeqNum == cSeqNum) {
				return true;
			}
		}
	}
	return false;
}
function doScriptActions() {
                include(prefix + ":" + "*/*/*/*");
                if (typeof(appTypeArray) == "object") {
                                                include(prefix + ":" + appTypeArray[0] + "/*/*/*");
                                                include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
                                                include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
                                                include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
                                                include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
                                                include(prefix + ":" + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
                                                include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
                                                include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
                                                }
                }

function editAppSpecificACALabel(itemName,itemValue)  // optional: itemCap
{
	var appSpecInfoResult;
	var vAppSpecInfoArry;
	var vAppSpecScriptModel;
	var vAppSaveResult;
	var x;
	var itemCap = capId;
	var itemGroup = null;

	if (arguments.length == 3) {
		itemCap = arguments[2]; // use cap ID specified in args
	}

	appSpecInfoResult = aa.appSpecificInfo.getAppSpecificInfos(itemCap, itemName);

	if (appSpecInfoResult.getSuccess()) {
		vAppSpecInfoArry = appSpecInfoResult.getOutput();
		for (x in vAppSpecInfoArry) {
			vAppSpecScriptModel = vAppSpecInfoArry[x];
			vAppSpecScriptModel.setAlternativeLabel(itemValue);
		}
		vAppSaveResult = aa.appSpecificInfo.editAppSpecificInfo(vAppSpecInfoArry);
		if (vAppSaveResult.getSuccess()) {
			aa.print('ACA label changed to: ' + itemValue);
		}
		else {
			aa.print('Failed to update the ACA label for ASI field: ' + itemName);
		}
	}
	else {
		aa.print( "WARNING: " + itemName + " was not updated.");
	}
}
function editASITDisplay4ACAPageFlow(destinationTableGroupModel, tableName, vDisp) // optional capId
{
	var itemCap = capId
		if (arguments.length > 3)
			itemCap = arguments[3]; // use cap ID specified in args

	var ta = destinationTableGroupModel.getTablesMap().values();
	var tai = ta.iterator();

	var found = false;
	while (tai.hasNext()) {
		var tsm = tai.next(); // com.accela.aa.aamain.appspectable.AppSpecificTableModel
		if (tsm.getTableName().equals(tableName)) {
			found = true;
			break;
		}
	}

	if (!found) {
		logDebug("cannot update asit for ACA, no matching table name");
		return false;
	}

	tsm.setVchDispFlag(vDisp);

	tssm = tsm;
	return destinationTableGroupModel;
}
function editContactASI(cContact, asiName, asiValue) {
	peopleModel = cContact.getPeople();
	peopleTemplate = peopleModel.getTemplate();
	if (peopleTemplate == null) return;
	var templateGroups = peopleTemplate.getTemplateForms(); //ArrayList
	var gArray = new Array();
	if (!(templateGroups == null || templateGroups.size() == 0)) {
		thisGroup = templateGroups.get(0);
		var subGroups = templateGroups.get(0).getSubgroups();
		for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
			var subGroup = subGroups.get(subGroupIndex);
			var fArray = new Array();
			var fields = subGroup.getFields();
			for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
				var field = fields.get(fieldIndex);
				fArray[field.getDisplayFieldName()] = field.getDefaultValue();
				if(field.getDisplayFieldName().toString().toUpperCase()==asiName.toString().toUpperCase()) {
					field.setDefaultValue(asiValue);
					fields.set(fieldIndex, field);  //set the field in the ArrayList of fields
					subGroup.setFields(fields);
					subGroups.set(subGroupIndex, subGroup);
					thisGroup.setSubgroups(subGroups);
					templateGroups.set(0, thisGroup);
					peopleTemplate.setTemplateForms(templateGroups);
					peopleModel.setTemplate(peopleTemplate);
					cContact.setPeople(peopleModel);
					editResult = aa.people.editCapContact(cContact.getCapContactModel());
					if (editResult.getSuccess())
						logDebug("Successfully edited the contact ASI");
				}
			}
		}
	}
}
/*
emailAsync_BCC - parallel function for emailContacts_BCC when you have actual email addresses instead of contact types
  Required Params:
     sendEmailToAddresses = comma-separated list of email addresses, no spaces
     emailTemplate = notification template name
  Optional Params: (use blank string, not null, if missing!)
     vEParams = parameters to be filled in notification template
     reportTemplate = if provided, will run report and attach to record and include a link to it in the email
     vRParams  = report parameters
     manualNotificationList = comma-separated list of contact names without email to be listed in Manual Notification adhoc task
     changeReportName = if using reportTemplate, will change the title of the document produced by the report from its default

Sample: emailAsync_BCC('gephartj@seattle.gov', 'DPD_WAITING_FOR_PAYMENT'); //minimal
        emailAsync_BCC('gephartj@seattle.gov,joe@smith.com', 'DPD_PERMIT_ISSUED', "", 'Construction Permit', paramHashtable, 'Jane Doe-Applicant,Adam West-Batman', 'This is Your Permit'); //full
 */
function emailAsync_BCC(sendEmailToAddresses, emailTemplate, vEParams, reportTemplate, vRParams, manualNotificationList, changeReportName) {
	var vAsyncScript = "SEND_EMAIL_ASYNC";

	//Start modification to support batch script
	var vEvntTyp = aa.env.getValue("eventType");
	if (vEvntTyp == "Batch Process") {
		aa.env.setValue("sendEmailToAddresses", sendEmailToAddresses);
		aa.env.setValue("emailTemplate", emailTemplate);
		aa.env.setValue("vEParams", vEParams);
		aa.env.setValue("reportTemplate", reportTemplate);
		aa.env.setValue("vRParams", vRParams);
		aa.env.setValue("vChangeReportName", changeReportName);
		aa.env.setValue("CapId", capId);
		aa.env.setValue("adHocTaskContactsList", manualNotificationList);
		//call sendEmailASync script
		logDebug("Attempting to run Non-Async: " + vAsyncScript);
		aa.includeScript(vAsyncScript);
	}
	else {
		//Can't store nulls in a hashmap, so check optional params just in case
		if (vEParams == null || vEParams == "") { vEParams = aa.util.newHashtable(); }
		if (vRParams == null || vRParams == "") { vRParams = aa.util.newHashtable(); }
		if (reportTemplate == null) { reportTemplate = ""; }
		if (changeReportName == null) { changeReportName = ""; }
		if (manualNotificationList == null) { manualNotificationList = ""; }

		//Save variables to the hash table and call sendEmailASync script. This allows for the email to contain an ACA deep link for the document
		var envParameters = aa.util.newHashMap();
		envParameters.put("sendEmailToAddresses", sendEmailToAddresses);
		envParameters.put("emailTemplate", emailTemplate);
		envParameters.put("vEParams", vEParams);
		envParameters.put("reportTemplate", reportTemplate);
		envParameters.put("vRParams", vRParams);
		envParameters.put("vChangeReportName", changeReportName);
		envParameters.put("CapId", capId);
		envParameters.put("adHocTaskContactsList", manualNotificationList);

		//call sendEmailASync script
		logDebug("Attempting to run Async: " + vAsyncScript);
		aa.runAsyncScript(vAsyncScript, envParameters);
	}
	//End modification to support batch script

	return true;
}
/*
emailContacts_BCC
  Required Params:
     sendEmailToContactTypes = comma-separated list of contact types to send to, no spaces
     emailTemplate = notification template name
  Optional Params: (use blank string, not null, if missing!)
     vEParams = parameters to be filled in notification template
     reportTemplate = if provided, will run report and attach to record and include a link to it in the email
     vRParams  = report parameters
	 vAddAdHocTask = Y/N for adding manual notification task when no email exists
     changeReportName = if using reportTemplate, will change the title of the document produced by the report from its default

Sample: emailContacts_BCC('OWNER APPLICANT', 'DPD_WAITING_FOR_PAYMENT'); //minimal
        emailContacts_BCC('OWNER APPLICANT,BUSINESS OWNER', 'DPD_PERMIT_ISSUED', eParamHashtable, 'Construction Permit', rParamHashtable, 'Y', 'New Report Name'); //full
 */
function emailContacts_BCC(sendEmailToContactTypes, emailTemplate, vEParams, reportTemplate, vRParams) {
	var vChangeReportName = "";
	var conTypeArray = [];
	var validConTypes = getContactTypes_BCC();
	var x = 0;
	var vConType;
	var vAsyncScript = "SEND_EMAIL_TO_CONTACTS_ASYNC";
	var envParameters = aa.util.newHashMap();
	var vAddAdHocTask = true;

	//Ad-hoc Task Requested
	if (arguments.length > 5) {
		vAddAdHocTask = arguments[5]; // use provided prefrence for adding an ad-hoc task for manual notification
		if (vAddAdHocTask == "N") {
logDebug("No adhoc task");
			vAddAdHocTask = false;
		}
	}

	//Change Report Name Requested
	if (arguments.length > 6) {
		vChangeReportName = arguments[6]; // use provided report name
	}

logDebug("Provided contact types to send to: " + sendEmailToContactTypes);

	//Check to see if provided contact type(s) is/are valid
	if (sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') {
		conTypeArray = sendEmailToContactTypes.split(",");
	}
	for (x in conTypeArray) {
		//check all that are not "Primary"
		vConType = conTypeArray[x];
		if (vConType != "Primary" && !exists(vConType, validConTypes)) {
			logDebug(vConType + " is not a valid contact type. No actions will be taken for this type.");
			conTypeArray.splice(x, (x+1));
		}
	}
	//Check if any types remain. If not, don't continue processing
	if ((sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') && conTypeArray.length <= 0) {
		logDebug(vConType + " is not a valid contact type. No actions will be taken for this type.");
		return false;
	}
	else if((sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') && conTypeArray.length > 0) {
		sendEmailToContactTypes = conTypeArray.toString();
	}

logDebug("Validated contact types to send to: " + sendEmailToContactTypes);
	//Save variables to the hash table and call sendEmailASync script. This allows for the email to contain an ACA deep link for the document
	envParameters.put("sendEmailToContactTypes", sendEmailToContactTypes);
	envParameters.put("emailTemplate", emailTemplate);
	envParameters.put("vEParams", vEParams);
	envParameters.put("reportTemplate", reportTemplate);
	envParameters.put("vRParams", vRParams);
	envParameters.put("vChangeReportName", vChangeReportName);
	envParameters.put("CapId", capId);
	envParameters.put("vAddAdHocTask", vAddAdHocTask);

	//Start modification to support batch script
	var vEvntTyp = aa.env.getValue("eventType");
	if (vEvntTyp == "Batch Process") {
		aa.env.setValue("sendEmailToContactTypes", sendEmailToContactTypes);
		aa.env.setValue("emailTemplate", emailTemplate);
		aa.env.setValue("vEParams", vEParams);
		aa.env.setValue("reportTemplate", reportTemplate);
		aa.env.setValue("vRParams", vRParams);
		aa.env.setValue("vChangeReportName", vChangeReportName);
		aa.env.setValue("CapId", capId);
		aa.env.setValue("vAddAdHocTask", vAddAdHocTask);
		//call sendEmailASync script
		logDebug("Attempting to run Non-Async: " + vAsyncScript);
		aa.includeScript(vAsyncScript);
	}
	else {
		//call sendEmailASync script
		logDebug("Attempting to run Async: " + vAsyncScript);
		aa.runAsyncScript(vAsyncScript, envParameters);
	}
	//End modification to support batch script

	return true;
}
/*
aa.print(isGroup1("0000978516-0001-2"));
aa.print(isGroup1("01000978516-0001-2"));
aa.print(isGroup1("0002112222-0001-7"));
*/

function getExistingBusinessInfo(btrc) {

var eb = existingBusinesses();

return eb.filter(function(b){
  return b.LOCATION_ACCOUNT.equals(btrc);
});
}

function isGroup1(C){return existingBusinesses().filter(function(A){return A.LOCATION_ACCOUNT.equals(C)&&1==A.STATUS_GROUP}).length>0}function isGroup2(C){return existingBusinesses().filter(function(A){return A.LOCATION_ACCOUNT.equals(C)&&2==A.STATUS_GROUP}).length>0}function existingBusinesses(){return[{LOCATION_ACCOUNT:"0000978516-0001-2",BUSINESS_NAME:"DAVID A HERRERA",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1996, -118.5347",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0000097184-0001-2",BUSINESS_NAME:"DADDY'S PIPES INC",DBA_NAME:"NACCC",COUNCIL_DISTRICT:15,LOCATION:"33.7898, -118.3084",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002033952-0001-0",BUSINESS_NAME:"VALLEY COLLECTIVE CARE INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1698, -118.6062",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002053218-0001-8",BUSINESS_NAME:"CYON CORPORATION INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0752, -118.3836",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002072981-0001-4",BUSINESS_NAME:"HOLISTIC SUPPLEMENTS LLC",DBA_NAME:"COLLECTIVE CAREGIVERS PHARMACY AND 2 AM PHARMACY",COUNCIL_DISTRICT:14,LOCATION:"34.0159, -118.2067",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002072463-0001-5",BUSINESS_NAME:"MARINA CAREGIVERS COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9906, -118.4455",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002581502-0001-3",BUSINESS_NAME:"EAGLE ROCK HERBAL COLLECTIVE LLC",DBA_NAME:"EAGLE ROCK HERBAL CAREGIVERS",COUNCIL_DISTRICT:13,LOCATION:"34.0945, -118.2403",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002086145-0001-8",BUSINESS_NAME:"ADVANCED PATIENTS' COLLECTIVE",DBA_NAME:"KUSH MART",COUNCIL_DISTRICT:14,LOCATION:"34.0446, -118.2544",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002086566-0001-2",BUSINESS_NAME:"MOTHER NATURE'S REMEDY CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1657, -118.624",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002097999-0001-3",BUSINESS_NAME:"CAC VENICE LLC",DBA_NAME:"CALIFORNIA ALTERNATIVE CAREGIVERS",COUNCIL_DISTRICT:11,LOCATION:"34.0021, -118.4696",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002095479-0001-1",BUSINESS_NAME:"CHR HERBAL REMEDIES INC",DBA_NAME:"CALIFORNIA HERBAL REMEDIES",COUNCIL_DISTRICT:11,LOCATION:"34.0116, -118.4203",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002112599-0001-9",BUSINESS_NAME:"CIRCLE OF HOPE ALLIANCE",DBA_NAME:"BLUE GATE/ CIRCLE OF HOPE ALLIANCE",COUNCIL_DISTRICT:12,LOCATION:"34.2216, -118.5012",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002107645-0001-1",BUSINESS_NAME:"HEZEKIAH INCORPORATED",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1, -118.3223",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002192299-0001-5",BUSINESS_NAME:"PEACE OF GREEN INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0296, -118.2466",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002112115-0001-9",BUSINESS_NAME:"IRONWORKS COLLECTIVE INC",DBA_NAME:"IRONWORKS COLLECTIVE",COUNCIL_DISTRICT:11,LOCATION:"33.9926, -118.4233",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002112381-0001-2",BUSINESS_NAME:"STRAIN BALBOA CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2572, -118.5999",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0000382947-0002-9",BUSINESS_NAME:"PATIENTS AGAINST PAIN, INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0235, -118.2448",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002118901-0001-6",BUSINESS_NAME:"SAN FERNANDO VALLEY PATIENTS' COOPERATIVE",DBA_NAME:"SAN FERNANDO VALLEY PATIENTS GROUP",COUNCIL_DISTRICT:12,LOCATION:"0, 0",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002115894-0001-2",BUSINESS_NAME:"BARR CORPORATION",DBA_NAME:"CALIFORNIA CAREGIVER'S ALLIANCE",COUNCIL_DISTRICT:13,LOCATION:"34.082, -118.272",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0000410225-0002-1",BUSINESS_NAME:"TOLABUS STEIN",DBA_NAME:"SILVER LAKE CAREGIVERS GROUP",COUNCIL_DISTRICT:13,LOCATION:"34.107, -118.2552",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002117413-0001-1",BUSINESS_NAME:"MEDICAL CAREGIVERS COOPERATIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0595, -118.2156",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002173768-0001-5",BUSINESS_NAME:"TRINITY MEDICAL ALLIANCE INC",DBA_NAME:"HAPPY LEAF",COUNCIL_DISTRICT:5,LOCATION:"34.0445, -118.4323",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002163060-0001-5",BUSINESS_NAME:"THE HIGHER PATH PATIENT ASSOCIATION",DBA_NAME:"JPHP MANAGEMENT",COUNCIL_DISTRICT:4,LOCATION:"34.1494, -118.4396",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002165101-0001-1",BUSINESS_NAME:"MCFLOWER CORP",DBA_NAME:"DELTA NINE CAREGIVERS",COUNCIL_DISTRICT:2,LOCATION:"34.2096, -118.4486",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002132954-0001-7",BUSINESS_NAME:"KOREA TOWN COLLECTIVE LLC",DBA_NAME:"ASCLEPIUS",COUNCIL_DISTRICT:5,LOCATION:"34.0835, -118.3506",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002168149-0001-3",BUSINESS_NAME:"GREENHOUSE ORGANICS INC",DBA_NAME:"THE GREENHOUSE",COUNCIL_DISTRICT:4,LOCATION:"34.164, -118.4661",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002173088-0001-5",BUSINESS_NAME:"HOLLYWOOD HOLISTIC HEALERS INC",DBA_NAME:"GRACE MEDICAL",COUNCIL_DISTRICT:11,LOCATION:"34.0289, -118.4542",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002172987-0001-7",BUSINESS_NAME:"TLC, INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0178, -118.1986",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002173631-0001-4",BUSINESS_NAME:"MISSION HILLS PATIENTS COLLECTIVE, INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1971, -118.5351",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002174731-0001-0",BUSINESS_NAME:"CALIFORNIA COMPASSIONATE CARE NETWORK INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1558, -118.3702",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002104144-0003-0",BUSINESS_NAME:"THE LITTLE COTTAGE CAREGIVERS LLC",DBA_NAME:"CANNARY",COUNCIL_DISTRICT:11,LOCATION:"34.0116, -118.4203",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002174190-0001-8",BUSINESS_NAME:"UNIVERSAL HERBAL CENTER, LLC",DBA_NAME:"THE MARIJUANA FACTORY",COUNCIL_DISTRICT:12,LOCATION:"34.2368, -118.5962",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002184683-0001-5",BUSINESS_NAME:"CANTODIEM DISPENSING COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1441, -118.3624",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002176979-0001-1",BUSINESS_NAME:"HERBAL REMEDIES CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2167, -118.4715",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002181643-0001-9",BUSINESS_NAME:"THE COMPASSION NETWORK LLC",DBA_NAME:"VENICE BEACH CARE CENTERS",COUNCIL_DISTRICT:11,LOCATION:"34.0004, -118.4659",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002178426-0001-3",BUSINESS_NAME:"RESOURCE REFERRAL SERVICES INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1644, -118.3674",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002179348-0001-9",BUSINESS_NAME:"THE REGISTRY MEDICAL LLC",DBA_NAME:"THERAPEUTIC HERBAL CAREGIVERS/SO.CAL. T.H.C.",COUNCIL_DISTRICT:11,LOCATION:"34.0431, -118.4689",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0000460382-0001-1",BUSINESS_NAME:"JC JOLLY A CALSO",DBA_NAME:"STONEY POINT COLLECTIVE",COUNCIL_DISTRICT:12,LOCATION:"34.2505, -118.6062",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002182264-0001-5",BUSINESS_NAME:"HERBAL SOLUTIONS PRE ICO LLC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1396, -118.3787",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002181863-0001-2",BUSINESS_NAME:"MARY JANES COLLECTIVE CAREGIVERS",DBA_NAME:"MARY JANE'S MEDICAL CANNABIS COLLECTIVE",COUNCIL_DISTRICT:13,LOCATION:"34.0835, -118.3072",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002183298-0001-1",BUSINESS_NAME:"DOWNTOWN COLLECTIVE INC",DBA_NAME:"MAGNOLIA WELLNESS",COUNCIL_DISTRICT:2,LOCATION:"34.1637, -118.3702",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002175639-0001-5",BUSINESS_NAME:"EXCLUSIVE CAREGIVERS OF CALIFORNIA INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9833, -118.3148",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002101730-0002-7",BUSINESS_NAME:"DANIEL J. STEIN",DBA_NAME:"GREEN GODDESS COLLECTIVE",COUNCIL_DISTRICT:11,LOCATION:"33.9877, -118.4708",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002178151-0001-7",BUSINESS_NAME:"LAX CC INC",DBA_NAME:"LAX COMPASSIONATE CAREGIVERS",COUNCIL_DISTRICT:11,LOCATION:"33.9619, -118.421",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002195358-0001-6",BUSINESS_NAME:"KUSH ALLEY COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2357, -118.5728",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002184569-0001-7",BUSINESS_NAME:"SUPERIOR HERBAL HEALTH LLC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2325, -118.5794",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002189179-0001-4",BUSINESS_NAME:"WESTSIDE CAREGIVERS CLUB INC",DBA_NAME:"WESTSIDE CAREGIVERS CLUB",COUNCIL_DISTRICT:6,LOCATION:"34.198, -118.4858",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002189128-0001-1",BUSINESS_NAME:"DTPG, COLLECTIVE INC.",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0282, -118.2322",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002191730-0001-6",BUSINESS_NAME:"SHERMAN OAKS COLLECTIVE CARE INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1498, -118.4421",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002183557-0001-7",BUSINESS_NAME:"SUN VALLEY CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2371, -118.3713",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002209814-0001-1",BUSINESS_NAME:"BOO-KU C.C. INC",DBA_NAME:"BOO KU",COUNCIL_DISTRICT:6,LOCATION:"34.2221, -118.36",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002190335-0001-9",BUSINESS_NAME:"HIGHLAND PARK PATIENT COLLECTIVE INC",DBA_NAME:"TREETOP LA",COUNCIL_DISTRICT:1,LOCATION:"34.0754, -118.2215",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002189025-0001-0",BUSINESS_NAME:"NATURE'S NATURAL COOPERATIVE CARE INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0285, -118.3924",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002201626-0001-0",BUSINESS_NAME:"PATIENTS AND CAREGIVERS LOS ANGELES INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.182, -118.3703",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002289515-0001-2",BUSINESS_NAME:"LOS ANGELES WELLNESS CENTER LLC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1567, -118.6063",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002193580-0001-2",BUSINESS_NAME:"ORGANIC CENTURY FARMACY INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2418, -118.6061",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002178173-0001-3",BUSINESS_NAME:"CRUZ VERDE INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8314, -118.3079",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002195649-0001-1",BUSINESS_NAME:"ASHMOON INC",DBA_NAME:"ASHMOON CAREGIVERS MARIJUANA DISPENSARY",COUNCIL_DISTRICT:4,LOCATION:"34.0911, -118.3431",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002198991-0001-0",BUSINESS_NAME:"THE WELLNESS EARTH ENERGY DISPENSARY LLC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1399, -118.3837",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002202307-0001-0",BUSINESS_NAME:"COMPASSIONATE PATIENT RESOURCES INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2282, -118.537",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002203172-0001-3",BUSINESS_NAME:"ABSOLUTE HERBAL PAIN SOLUTIONS INC",DBA_NAME:"SHOWGROW LA",COUNCIL_DISTRICT:14,LOCATION:"34.0272, -118.2531",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002200695-0001-3",BUSINESS_NAME:"CAHUENGA CAREGIVERS INC",DBA_NAME:"SHERMAN OAKS HEALTH CENTER",COUNCIL_DISTRICT:4,LOCATION:"34.1793, -118.4574",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002198520-0001-7",BUSINESS_NAME:"ORIGINAL BALBOA CAREGIVERS INC",DBA_NAME:"BSE",COUNCIL_DISTRICT:5,LOCATION:"34.0422, -118.4417",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002205101-0001-8",BUSINESS_NAME:"CALIFORNIA ORGANIC TREATMENT CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0256, -118.2329",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002201665-0001-0",BUSINESS_NAME:"JOHN R PYRE/JAVIER MONTES JR",DBA_NAME:"DELTA-9 T.H.C",COUNCIL_DISTRICT:15,LOCATION:"33.7805, -118.2523",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002206249-0001-4",BUSINESS_NAME:"NATURAL REMEDIES, INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0874, -118.3091",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002207035-0001-3",BUSINESS_NAME:"PERENNIAL HOLISTIC WELLNESS CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1414, -118.388",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002207291-0001-3",BUSINESS_NAME:"NORTHRIDGE CAREGIVERS CO-OP INC",DBA_NAME:"HCMA",COUNCIL_DISTRICT:6,LOCATION:"34.2409, -118.39",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002207858-0001-0",BUSINESS_NAME:"GOURMET GREEN ROOM INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0155, -118.2006",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002205123-0001-4",BUSINESS_NAME:"ALTERNATIVE MEDICINAL CAREGIVERS INC",DBA_NAME:"GREEN ANGEL",COUNCIL_DISTRICT:3,LOCATION:"34.1664, -118.6219",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002210244-0001-4",BUSINESS_NAME:"SOUTHWEST CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2916, -118.4125",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002211289-0001-9",BUSINESS_NAME:"CANNA HEALTHCARE INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0177, -118.2438",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002211556-0001-9",BUSINESS_NAME:"THE LIVING EARTH WELLNESS CENTER COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0636, -118.4477",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002210665-0001-9",BUSINESS_NAME:"MID CITY CANNABIS CLUB INC",DBA_NAME:"LA BREA COLLECTIVE",COUNCIL_DISTRICT:10,LOCATION:"34.0478, -118.348",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002211791-0001-7",BUSINESS_NAME:"HHC PLUS INC A CA NON-PROF CORP",DBA_NAME:"HHC PLUS. INC",COUNCIL_DISTRICT:14,LOCATION:"34.0186, -118.2396",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002212464-0001-2",BUSINESS_NAME:"BUDS & ROSES COLLECTIVE INC",DBA_NAME:"BUDS & ROSES",COUNCIL_DISTRICT:2,LOCATION:"34.1457, -118.4172",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002225069-0001-1",BUSINESS_NAME:"CHRONICPRACTOR CAREGIVER INC",DBA_NAME:"EXHALE MED CENTER",COUNCIL_DISTRICT:5,LOCATION:"34.0888, -118.3764",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002231857-0001-1",BUSINESS_NAME:"ALTERNATIVE MEDICINE GROUP INC",DBA_NAME:"ALTERNATIVE MEDICINE GROUP",COUNCIL_DISTRICT:5,LOCATION:"34.0768, -118.4687",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002226675-0001-2",BUSINESS_NAME:"HOLISTIC HEALING ALTERNATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1259, -118.2637",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002212486-0001-9",BUSINESS_NAME:"CORNERSTONE RESEARCH COLLECTIVE",DBA_NAME:"CORNERSTONE COLLECTIVE",COUNCIL_DISTRICT:14,LOCATION:"34.1417, -118.222",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002208457-0001-0",BUSINESS_NAME:"420 FOR THE PEOPLE COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2572, -118.465",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002215717-0001-4",BUSINESS_NAME:"WELLNESS CAREGIVERS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2573, -118.4708",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002208428-0001-3",BUSINESS_NAME:"RELIEF CCR",DBA_NAME:"BEVERLY HILLS ALTERNATIVE RELIEF CENTER",COUNCIL_DISTRICT:5,LOCATION:"34.0706, -118.3759",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002218104-0001-0",BUSINESS_NAME:"SMART COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1522, -118.3649",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002218073-0001-2",BUSINESS_NAME:"RANDY CRUZADO",DBA_NAME:"THE RELIEF COLLECTIVE",COUNCIL_DISTRICT:10,LOCATION:"34.0508, -118.363",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002219954-0001-1",BUSINESS_NAME:"SO CAL CO-OP, INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1849, -118.6233",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002220478-0001-6",BUSINESS_NAME:"NEW AGE COMPASSION CARE CENTER CORP",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0108, -118.2796",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002220929-0001-3",BUSINESS_NAME:"CHINATOWN PATIENT COLLECTIVE GROUP INC",DBA_NAME:"COLLECTIVE GROUP CO",COUNCIL_DISTRICT:14,LOCATION:"0, 0",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002227446-0001-7",BUSINESS_NAME:"LOS ANGELES VALLEY CAREGIVERS, INC.",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.063, -118.3623",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002224451-0001-6",BUSINESS_NAME:"WFARM1045 INC",DBA_NAME:"THE WESTWOOD FARMACY",COUNCIL_DISTRICT:5,LOCATION:"34.0613, -118.4474",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002227550-0001-1",BUSINESS_NAME:"VFARM 1509",DBA_NAME:"ROSE COLLECTIVE",COUNCIL_DISTRICT:11,LOCATION:"33.9979, -118.4749",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002224443-0001-1",BUSINESS_NAME:"BEACH ENLIGHTENMENT AND COMPASSIONATE HEALING CENTER , A COOPERATIVE CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8583, -118.2955",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002225065-0001-2",BUSINESS_NAME:"THE LOS ANGELES COOPERATIVE",DBA_NAME:"HOLLYWEED",COUNCIL_DISTRICT:10,LOCATION:"34.0444, -118.3525",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002225456-0001-6",BUSINESS_NAME:"TANIS INDUSTRIES LLC",DBA_NAME:"WEST VALLEY PATIENTS GROUP",COUNCIL_DISTRICT:3,LOCATION:"34.1647, -118.6271",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002184860-0010-0",BUSINESS_NAME:"CALIFORNIA PATIENTS ALLIANCE A COOPERATIVE CORPORATION",DBA_NAME:"C.P.A.",COUNCIL_DISTRICT:5,LOCATION:"34.084, -118.3697",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002231724-0001-8",BUSINESS_NAME:"HERBAL RELIEF CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.21, -118.3634",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002226606-0001-1",BUSINESS_NAME:"GLEN TIM LEVANGIE",DBA_NAME:"MEDICAL MARIJUANA RELIEF CENTER",COUNCIL_DISTRICT:5,LOCATION:"34.0471, -118.4438",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002228941-0001-2",BUSINESS_NAME:"HEALTHY HERBAL CARE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.1999, -118.4662",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002248388-0002-1",BUSINESS_NAME:"MARC BENSON EARL",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.247, -118.3844",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002236085-0001-3",BUSINESS_NAME:"GREEN AID RECOVERY GROUP, INC.",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0753, -118.1666",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002232461-0001-1",BUSINESS_NAME:"HERBAL PAIN RELIEF CENTER COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2648, -118.4671",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002246867-0001-7",BUSINESS_NAME:"SUNRISE CAREGIVER FOUNDATION INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8176, -118.3065",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002233176-0001-1",BUSINESS_NAME:"TIMOTHY LEARY MEMORIAL DISPENSARY COLLECTIVE INC., A CA NONPROFIT MBC",DBA_NAME:"TIMOTHY LEARY MEMORIAL DISPENSARY",COUNCIL_DISTRICT:10,LOCATION:"34.045, -118.3486",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002233236-0001-4",BUSINESS_NAME:"GREEN DOT MEDICINAL CANNABIS PATIENT'S GROUP",DBA_NAME:"GREEN DOT COLLECTIVE",COUNCIL_DISTRICT:11,LOCATION:"33.9868, -118.4444",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002082405-0002-7",BUSINESS_NAME:"ALANZO ACOSTA",DBA_NAME:"THE LOFT",COUNCIL_DISTRICT:3,LOCATION:"34.1662, -118.5931",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002234992-0001-2",BUSINESS_NAME:"SHERMAN OAKS HOLISTIC OASIS",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0928, -118.2803",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002235309-0001-0",BUSINESS_NAME:"CALIFORNIA'S CHOICE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2738, -118.4314",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002236381-0001-0",BUSINESS_NAME:"HOLISTIC PAIN RELIEF INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"0, 0",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002239633-0001-7",BUSINESS_NAME:"DIVINE WELLNESS CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2018, -118.5954",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002238832-0001-1",BUSINESS_NAME:"RDC COLLECTIVE CORP",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1799, -118.535",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002239627-0001-1",BUSINESS_NAME:"RED MOON INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1793, -118.4453",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002243958-0001-4",BUSINESS_NAME:"ARTS DISTRICT PATIENTS COLLECTIVE INC",DBA_NAME:"ARTS DISTRICT HEALING CENTER",COUNCIL_DISTRICT:14,LOCATION:"34.0523, -118.232",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002228537-0001-3",BUSINESS_NAME:"CITY COMPASSIONATE CAREGIVERS",DBA_NAME:"CITY COMPASSIONATE CAREGIVERS",COUNCIL_DISTRICT:14,LOCATION:"34.0348, -118.2237",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002193730-0002-9",BUSINESS_NAME:"BENEFIT CORPORATION",DBA_NAME:"NACCC",COUNCIL_DISTRICT:9,LOCATION:"33.9919, -118.2568",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002239291-0001-7",BUSINESS_NAME:"MELROSE HERBAL COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9856, -118.2606",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002239788-0001-6",BUSINESS_NAME:"ORGANIC GREEN TREATMENT CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0188, -118.3193",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002240228-0001-4",BUSINESS_NAME:"GREEN DRAGON CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2024, -118.4247",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002247944-0001-1",BUSINESS_NAME:"HOLISTIC ALTERNATIVE INC. #57/D",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2273, -118.5319",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002242390-0001-6",BUSINESS_NAME:"WELCOME THE HEALING TOUCH INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.1646, -118.5248",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002243160-0001-6",BUSINESS_NAME:"THE GREEN EARTH FARMACIE, INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2113, -118.4629",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002262577-0001-0",BUSINESS_NAME:"CALIFORNIA'S FINEST COAST TO COAST INC",DBA_NAME:"CALI'S FINEST",COUNCIL_DISTRICT:3,LOCATION:"34.1998, -118.5977",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002244476-0001-9",BUSINESS_NAME:"KUSHISM INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2078, -118.4836",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002245640-0001-4",BUSINESS_NAME:"NEW APOTHECARY INC",DBA_NAME:"APOTHECARY 420",COUNCIL_DISTRICT:5,LOCATION:"34.1532, -118.4686",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002245971-0001-4",BUSINESS_NAME:"MMD, INC.",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0985, -118.3298",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002246086-0001-4",BUSINESS_NAME:"CARE CALIFORNIA CONSULTATION INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0305, -118.2306",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002245715-0001-4",BUSINESS_NAME:"VENICE CAREGIVER FOUNDATION INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2281, -118.3743",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002248953-0001-8",BUSINESS_NAME:"COLLECTIVE PHARM",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.036, -118.2634",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002275032-0001-0",BUSINESS_NAME:"NILE COOPERATIVE CORPORATION",DBA_NAME:"NILE COLLECTIVE",COUNCIL_DISTRICT:11,LOCATION:"33.957, -118.4432",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002179615-0002-7",BUSINESS_NAME:"ZEN MEDICAL GARDEN CO OP INC",DBA_NAME:"GREEN LIGHT DISCOUNT PHARMACY",COUNCIL_DISTRICT:7,LOCATION:"34.307, -118.4695",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002254141-0001-7",BUSINESS_NAME:"VERMONT HERBAL CENTER INC",DBA_NAME:"AIRSIDE WELLNESS",COUNCIL_DISTRICT:6,LOCATION:"34.2023, -118.4859",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002253054-0001-9",BUSINESS_NAME:"SAFE HARBOR PATIENT'S COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1787, -118.4399",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002257045-0001-9",BUSINESS_NAME:"THERAPEUTIC HEALTH COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.9018, -118.2858",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002255600-0001-6",BUSINESS_NAME:"SUNSET HERBAL CORNER INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1721, -118.3823",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002256288-0001-6",BUSINESS_NAME:"LA WONDERLAND CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0336, -118.2644",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002256972-0001-2",BUSINESS_NAME:"DISCOUNT CAREGIVERS",DBA_NAME:"DC COLLECTIVE",COUNCIL_DISTRICT:3,LOCATION:"34.2164, -118.595",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002257519-0001-7",BUSINESS_NAME:"GREEN PLANT THERAPY INC",DBA_NAME:"BUD KING",COUNCIL_DISTRICT:6,LOCATION:"34.226, -118.467",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002258885-0001-6",BUSINESS_NAME:"PURPLE HEART COMPASSIONATE INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"0, 0",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002257223-0001-9",BUSINESS_NAME:"EIGHT ONE EIGHT COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2022, -118.4661",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002262794-0001-0",BUSINESS_NAME:"NATURAL AID PHARMACY A COOPERATIVE CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1724, -118.4661",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002262211-0002-4",BUSINESS_NAME:"SOUTHERN CALIFORNIA COLLECTIVE A NON PROFIT ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0202, -118.2206",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002269618-0001-1",BUSINESS_NAME:"NORTH HOLLYWOOD COMPASSIONATE CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2177, -118.3898",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002260907-0001-2",BUSINESS_NAME:"NATURES CURE INC",DBA_NAME:"NATURE'S CURE INC | NATURE'S CURE INC.",COUNCIL_DISTRICT:11,LOCATION:"33.9452, -118.3725",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002270444-0001-9",BUSINESS_NAME:"LAHC INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2343, -118.3732",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002270852-0001-6",BUSINESS_NAME:"AMYLEE SMITHWICK",DBA_NAME:"JAHLIFE - TRUE HOME OF RASTAFARI | JALIFE - TRUE HOME OF RASTAFARI",COUNCIL_DISTRICT:10,LOCATION:"34.0561, -118.3449",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002273685-0001-6",BUSINESS_NAME:"FOUNTAIN OF WELLBEING A COOPERATIVE CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2017, -118.391",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002034460-0002-9",BUSINESS_NAME:"ROBERTSON CAREGIVERS BEVERLYWOOD",DBA_NAME:"ROBERTSON CAREGIVERS BEVERLYWOOD",COUNCIL_DISTRICT:6,LOCATION:"34.2362, -118.4116",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002273482-0001-6",BUSINESS_NAME:"DOCTOR KUSH WORLD COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.978, -118.2612",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002274403-0001-9",BUSINESS_NAME:"HYPERION HEALING",DBA_NAME:"BOMBAY",COUNCIL_DISTRICT:3,LOCATION:"34.2314, -118.5838",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002274496-0001-5",BUSINESS_NAME:"THE VAN NUYS GROUP LLC",DBA_NAME:"THE GREEN EASY",COUNCIL_DISTRICT:5,LOCATION:"34.076, -118.3703",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002275038-0001-7",BUSINESS_NAME:"KUSH KORNER II, INC.",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7813, -118.2427",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002274920-0001-3",BUSINESS_NAME:"DEC MEDICAL INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1411, -118.3719",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002275041-0001-9",BUSINESS_NAME:"DOWNTOWN NATURAL CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0476, -118.2439",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002406834-0001-8",BUSINESS_NAME:"LIZBOR INC",DBA_NAME:"WOODLANDHILLS TREATMENT CENTER WHTC",COUNCIL_DISTRICT:4,LOCATION:"34.1358, -118.3619",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002580753-0001-5",BUSINESS_NAME:"GREEN EARTH VITALITY CORPORATION",DBA_NAME:"GREEN EARTH COLLECTIVE",COUNCIL_DISTRICT:1,LOCATION:"34.1222, -118.2109",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002263119-0001-1",BUSINESS_NAME:"VALLEY HERBAL HEALING CENTER INC",DBA_NAME:"HERBAL HEALING CENTER",COUNCIL_DISTRICT:2,LOCATION:"34.1939, -118.3807",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002277718-0001-1",BUSINESS_NAME:"HUNTINGTON PATIENTS ASSOCIATION",DBA_NAME:"WEST VALLEY CAREGIVERS",COUNCIL_DISTRICT:3,LOCATION:"34.1643, -118.6279",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002210774-0001-6",BUSINESS_NAME:"STUDIO CITY CAREGIVERS CO-OP INC",DBA_NAME:"UNIVERSAL COLLECTIVE",COUNCIL_DISTRICT:4,LOCATION:"34.1344, -118.3596",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002265879-0001-5",BUSINESS_NAME:"SAN FERNANDO VALLEY DISCOUNT MEDICAL SUPPLY INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1721, -118.4645",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002220313-0001-3",BUSINESS_NAME:"VALLEY HOLISTIC CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"0, 0",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002237919-0001-7",BUSINESS_NAME:"PATIENTS CORP",DBA_NAME:"FOOTHILL WELLNESS CENTER",COUNCIL_DISTRICT:7,LOCATION:"34.2479, -118.2873",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002248188-0001-6",BUSINESS_NAME:"VENICE ALTERNATIVE HEALING COLLECTIVE CO-OP",DBA_NAME:"VENICE ALTERNATIVE HEALING COLLECTIVE",COUNCIL_DISTRICT:9,LOCATION:"33.9823, -118.2608",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002604287-0001-7",BUSINESS_NAME:"PURA VIDA TRES INC",DBA_NAME:"PURELIFE ALTERNATIVE WELLNESS CENTER",COUNCIL_DISTRICT:12,LOCATION:"34.2484, -118.5862",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002221186-0001-3",BUSINESS_NAME:"HERBALCURE CORPORATION",DBA_NAME:"GRACE",COUNCIL_DISTRICT:15,LOCATION:"33.8706, -118.2831",STATUS_GROUP:1},{LOCATION_ACCOUNT:"0002380246-0009-9",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"MARY JANES COLLECTIVES",COUNCIL_DISTRICT:9,LOCATION:"34.0189, -118.2724",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002380246-0002-1",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"MARY JANES COLLECTIVES",COUNCIL_DISTRICT:14,LOCATION:"0, 0",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002380246-0001-3",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"CLUB MED COLLECTIVE",COUNCIL_DISTRICT:8,LOCATION:"34.0037, -118.3094",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002112222-0001-7",BUSINESS_NAME:"HERBAL LOVE CAREGIVERS ON THE BOULEVARD INC",DBA_NAME:"HERBAL LOVE DOWNTOWN",COUNCIL_DISTRICT:9,LOCATION:"34.0084, -118.2783",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002168000-0001-0",BUSINESS_NAME:"SUPPLEMENTAL ORGANIC SOLUTIONS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2188, -118.4667",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002173946-0001-5",BUSINESS_NAME:"SHANE DIGMAN",DBA_NAME:"CITY OF ANGELS WELLNESS CENTER",COUNCIL_DISTRICT:13,LOCATION:"34.0997, -118.3446",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002185259-0001-6",BUSINESS_NAME:"PALACE OF CARE & GOODWILL LLC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9889, -118.3485",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002185207-0001-9",BUSINESS_NAME:"WISE AND CURE INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2947, -118.4526",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002436130-0001-1",BUSINESS_NAME:"EAGLE ROCK PATIENT COLLECTIVE INC",DBA_NAME:"KINDER MEDS PATIENT CARE",COUNCIL_DISTRICT:12,LOCATION:"34.2214, -118.4738",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002689415-0001-6",BUSINESS_NAME:"KUSH VALLEY INC",DBA_NAME:"KUSH VALLEY COLLECTIVE",COUNCIL_DISTRICT:7,LOCATION:"34.2947, -118.4526",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002217119-0001-9",BUSINESS_NAME:"420 HIGHWAY PHARMACY, INC.",DBA_NAME:"420 HIGHWAY PHARMACY",COUNCIL_DISTRICT:15,LOCATION:"33.8614, -118.2992",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002738349-0001-3",BUSINESS_NAME:"THE CONGLOMERATE GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9888, -118.3517",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002707587-0001-9",BUSINESS_NAME:"KARO DARBINYAN",DBA_NAME:"MEGA GO",COUNCIL_DISTRICT:7,LOCATION:"34.2736, -118.4116",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002824374-0001-1",BUSINESS_NAME:"MEDWELL COLLECTIVE A CALIFORNIA NON-PROFIT MUTUAL BENEFIT CORPORATION",DBA_NAME:"HIGH MAINTENANCE",COUNCIL_DISTRICT:15,LOCATION:"33.736, -118.291",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002787059-0001-7",BUSINESS_NAME:"VERSAG INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0119, -118.2652",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002804368-0001-3",BUSINESS_NAME:"LANCING GROUP",DBA_NAME:"WESTERN PATIENT GROUP",COUNCIL_DISTRICT:8,LOCATION:"33.9535, -118.309",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002326879-0001-2",BUSINESS_NAME:"VENICE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"34.0025, -118.4359",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002095479-0002-9",BUSINESS_NAME:"CHR HERBAL REMEDIES INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0738, -118.1635",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002843430-0001-2",BUSINESS_NAME:"GREEN CITY OF ANGELS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.3005, -118.4618",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002255629-0001-4",BUSINESS_NAME:"HARBOR CAREGIVERS INC",DBA_NAME:"CANNASSEUR'S CLUB",COUNCIL_DISTRICT:7,LOCATION:"34.2953, -118.4127",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002257137-0001-2",BUSINESS_NAME:"NATURAL HERBAL PAIN RELIEF INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1405, -118.3855",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002229201-0002-6",BUSINESS_NAME:"INFINITY PHILANTHROPY GLOBAL",DBA_NAME:"ALLEVIATIONS",COUNCIL_DISTRICT:5,LOCATION:"34.1552, -118.4753",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002203314-0002-5",BUSINESS_NAME:"VIRGIL GRANT III",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.0832, -118.3099",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002730356-0001-5",BUSINESS_NAME:"SAN FERNANDO VALLEY DISCOUNT MEDICAL SUPPLY INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.0885, -118.344",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002203314-0003-3",BUSINESS_NAME:"VIRGIL GRANT III",DBA_NAME:"MED X NOW",COUNCIL_DISTRICT:0,LOCATION:"33.9454, -118.3012",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002866069-0001-6",BUSINESS_NAME:"SCOTTY BEAM COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0315, -118.2738",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002275044-0001-2",BUSINESS_NAME:"KUSH KORNER V /C",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0835, -118.3477",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0002868317-0001-8",BUSINESS_NAME:"1ST CLASS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0369, -118.2627",STATUS_GROUP:2},{LOCATION_ACCOUNT:"0000995653-0001-2",BUSINESS_NAME:"FERMIN FUENTES",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0000032121-0001-2",BUSINESS_NAME:"ALL INDUSTRY POWER SPORTS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.201, -118.517",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002075443-0001-0",BUSINESS_NAME:"MILLENIUM CONCEPTS INC",DBA_NAME:"MCCG",COUNCIL_DISTRICT:9,LOCATION:"33.9932, -118.2786",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002175460-0001-9",BUSINESS_NAME:"THE HOME OF COMPASSION LLC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0392, -118.3881",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002185255-0001-8",BUSINESS_NAME:"PALACE OF CARE  & GOODWILL INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9889, -118.3485",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002179615-0001-9",BUSINESS_NAME:"ZEN MEDICAL GARDEN CO OP INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002181088-0001-7",BUSINESS_NAME:"THE HOLISTIC CAREGIVERS  INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9722, -118.3312",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002318022-0001-5",BUSINESS_NAME:"THE HILLS CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1718, -118.5683",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002346679-0001-9",BUSINESS_NAME:"BIG NINO FLOYD INC",DBA_NAME:"GREENER PATURES CAREGIVERS | GREENES PASTURES COLLECTIVE",COUNCIL_DISTRICT:5,LOCATION:"34.057, -118.3836",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002359483-0001-7",BUSINESS_NAME:"LOVE & SPIRIT CARE CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1732, -118.3615",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002367880-0001-8",BUSINESS_NAME:"FOOTHILL GREEN COLLECTIVE INC",DBA_NAME:"MEDICAL MARIJUANA DISPENSARY",COUNCIL_DISTRICT:7,LOCATION:"34.2525, -118.2949",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002378387-0001-2",BUSINESS_NAME:"HOONTS INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2501, -118.4052",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380986-0001-5",BUSINESS_NAME:"JUSTIN KEIRN",DBA_NAME:"BOULEVARD COLLECTIVE",COUNCIL_DISTRICT:4,LOCATION:"34.1503, -118.4218",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002392118-0001-4",BUSINESS_NAME:"SCOTT PEARSON",DBA_NAME:"EVERGREEN CO",COUNCIL_DISTRICT:13,LOCATION:"34.1, -118.3223",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002401583-0001-1",BUSINESS_NAME:"PRECISION MEDICAL CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0635, -118.3083",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584603-0001-8",BUSINESS_NAME:"HOLISTIC THERAPEUTIC CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1721, -118.4033",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002417543-0001-6",BUSINESS_NAME:"MR GREENS LLC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0906, -118.2781",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002418224-0001-6",BUSINESS_NAME:"SOUTH BAY WELLNESS NETWORK",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7792, -118.2758",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002420077-0001-0",BUSINESS_NAME:"HEALERS ON THIRD INC",DBA_NAME:"HEALERS ON 3RD MEDICAL MARIJUANA COLLECTIVE",COUNCIL_DISTRICT:7,LOCATION:"34.3016, -118.4419",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002417875-0001-1",BUSINESS_NAME:"OH GEE REMEDIES CORP",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2521, -118.2964",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002423726-0001-6",BUSINESS_NAME:"HERBAL MEDICINE CARE INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2548, -118.606",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002424289-0001-8",BUSINESS_NAME:"HARMONY HOUSE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2011, -118.3862",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002427077-0001-1",BUSINESS_NAME:"VALLEY HERBAL REMEDIES INC",DBA_NAME:"VALLEY HERBAL REMEDIES",COUNCIL_DISTRICT:6,LOCATION:"34.2201, -118.3706",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002554812-0001-4",BUSINESS_NAME:"GODFATHER CAREGIVERS INC",DBA_NAME:"DBA WELLNESS CAREGIVERS",COUNCIL_DISTRICT:12,LOCATION:"34.2227, -118.4967",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002438593-0001-4",BUSINESS_NAME:"PRIVATE ORGANIC THERAPY INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1399, -118.3837",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002432704-0001-9",BUSINESS_NAME:"ZHILBERT BABAKHANYAN",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2012, -118.4672",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584537-0001-9",BUSINESS_NAME:"CANCARE COLLECTIVE CA40",DBA_NAME:"ALTMEDX",COUNCIL_DISTRICT:12,LOCATION:"34.2257, -118.536",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002437515-0001-7",BUSINESS_NAME:"WESTERN MEDICAL CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0866, -118.3091",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002437979-0001-0",BUSINESS_NAME:"CALIFORNIA CARE PROVIDERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2157, -118.3965",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002438225-0001-3",BUSINESS_NAME:"STARGATE COLLECTIVE",DBA_NAME:"STARGATE COLLECTIVE",COUNCIL_DISTRICT:4,LOCATION:"34.0973, -118.2755",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002447485-0001-1",BUSINESS_NAME:"VETMED CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2395, -118.3932",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002445423-0001-5",BUSINESS_NAME:"MEGAN RONCONE",DBA_NAME:"CCCMS",COUNCIL_DISTRICT:3,LOCATION:"34.2082, -118.6044",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002470508-0001-1",BUSINESS_NAME:"KUSH CONNECTION",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.039, -118.2645",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002449315-0001-1",BUSINESS_NAME:"CANCARE COLLECTIVE CA20",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.1435, -118.2255",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002450975-0002-1",BUSINESS_NAME:"HERBAL HEALTH RESOURCE CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0757, -118.2176",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002224443-0002-0",BUSINESS_NAME:"BEACH ENLIGHTENMENT AND COMPASSIONATE HEALING CENTER , A COOPERATIVE CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8583, -118.2955",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002480765-0001-2",BUSINESS_NAME:"NIKITA SHUBIN",DBA_NAME:"SWHC",COUNCIL_DISTRICT:2,LOCATION:"34.2012, -118.4102",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002494746-0001-5",BUSINESS_NAME:"REBEKAH BOYLE / JOSEPH M MENESES",DBA_NAME:"EMERALD BLISS",COUNCIL_DISTRICT:14,LOCATION:"34.0505, -118.2406",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002605684-0001-3",BUSINESS_NAME:"COLLECTIVE GROWERS FOUNDATION",DBA_NAME:"CGF",COUNCIL_DISTRICT:2,LOCATION:"34.1649, -118.3674",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780869-0001-5",BUSINESS_NAME:"GREEN RELIEF COMPASSIONATE",DBA_NAME:"BHANG SOCIETY",COUNCIL_DISTRICT:11,LOCATION:"33.9554, -118.3962",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780865-0001-7",BUSINESS_NAME:"GREEN CROSS COMPASSIONATE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0168, -118.21",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002555952-0001-4",BUSINESS_NAME:"CAFE 420 NPO",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0058, -118.334",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002515971-0001-1",BUSINESS_NAME:"NATURE'S HARVEST ALLIANCE INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0421, -118.4302",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002526486-0001-1",BUSINESS_NAME:"NATURES WAY A CALIFORNIA NONPROFIT MUTUAL BENEFIT CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7522, -118.3078",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002533639-0001-7",BUSINESS_NAME:"NO GREY SKY INC",DBA_NAME:"FIGUEROA COLLECTIVE",COUNCIL_DISTRICT:1,LOCATION:"34.0846, -118.2213",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002534171-0001-1",BUSINESS_NAME:"DONOVAN E MOHR",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1672, -118.5322",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002599882-0001-1",BUSINESS_NAME:"PANORAMA PROVIDERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2216, -118.4338",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002544377-0001-1",BUSINESS_NAME:"SAN DIEGO HEALING POINT INC",DBA_NAME:"VAN NUYS HEALING POINT INC",COUNCIL_DISTRICT:4,LOCATION:"34.1793, -118.4582",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002554812-0002-2",BUSINESS_NAME:"GODFATHER CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.1852, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002785652-0001-0",BUSINESS_NAME:"TKMB INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.193, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002535486-0001-0",BUSINESS_NAME:"WESTERN DISCOUNT CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0442, -118.309",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002536692-0001-9",BUSINESS_NAME:"ALL FARMERS, INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1649, -118.3724",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002812338-0001-4",BUSINESS_NAME:"GARNIK PATRIKYAN",DBA_NAME:"GREEN HEAVEN COLLECTIVE",COUNCIL_DISTRICT:7,LOCATION:"34.3007, -118.4612",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002604487-0001-3",BUSINESS_NAME:"VANESSA ARANA",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9676, -118.2871",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002797117-0001-8",BUSINESS_NAME:"ALLAN KARDESHEKIAN",DBA_NAME:"HOUSE OF COMPASSION",COUNCIL_DISTRICT:9,LOCATION:"33.9956, -118.2915",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002537633-0001-9",BUSINESS_NAME:"ST. BERNARD'S PROVISIONS, INC.",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1984, -118.3943",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002778897-0001-9",BUSINESS_NAME:"TYLER JONES",DBA_NAME:"BASH LIFE COLLECTIVE",COUNCIL_DISTRICT:10,LOCATION:"34.0508, -118.3112",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002541972-0001-6",BUSINESS_NAME:"CALPRO ART SUPPLIES & EDUCATION CENTER",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.1544, -118.47",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002701799-0001-4",BUSINESS_NAME:"YOUR TREE PROVIDERS, INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1409, -118.3714",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002551107-0001-4",BUSINESS_NAME:"ALL ORGANIC COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1722, -118.566",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002554583-0001-0",BUSINESS_NAME:"YOUR TREE PROVIDERS",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1409, -118.3714",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002579765-0001-7",BUSINESS_NAME:"MILESTONE ENDEAVORS",DBA_NAME:"MILESTONE HOLISTIC CENTER",COUNCIL_DISTRICT:13,LOCATION:"34.0795, -118.269",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002535283-0001-0",BUSINESS_NAME:"TKT INDUSTRIES INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1939, -118.3687",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002575292-0001-4",BUSINESS_NAME:"THA MAXIMUS INC.",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1794, -118.3815",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583498-0001-0",BUSINESS_NAME:"CCG GROUP INC",DBA_NAME:"RITE MEDS CAREGIVERS",COUNCIL_DISTRICT:2,LOCATION:"34.1866, -118.4323",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002748003-0001-3",BUSINESS_NAME:"NATURE'S NATURAL COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2017, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002565523-0001-1",BUSINESS_NAME:"EXOTIC GARDENS INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1681, -118.5793",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584453-0001-0",BUSINESS_NAME:"LACG INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.1598, -118.501",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584857-0001-1",BUSINESS_NAME:"GREEN SPOT COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.1562, -118.4828",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584771-0001-2",BUSINESS_NAME:"BETTER ALTERNATIVE TREATMENT LLC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0835, -118.3498",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583130-0001-7",BUSINESS_NAME:"FOOTHILL OG CORNER INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.1617, -118.5157",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584762-0001-3",BUSINESS_NAME:"ONE STOP COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.183, -118.4702",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002580810-0001-5",BUSINESS_NAME:"SIT ON CLOUDS COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2596, -118.3039",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583990-0001-4",BUSINESS_NAME:"IVIIO INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.3049, -118.4667",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002434598-0001-8",BUSINESS_NAME:"TRADITIONAL HERBAL CENTER",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9998, -118.2564",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002550381-0001-5",BUSINESS_NAME:"MID-CITY MED CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0479, -118.3485",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584755-0001-3",BUSINESS_NAME:"EARTHS ALTERNATIVE REMEDIES TO HEALING COOPERATIVE INC",DBA_NAME:"EARTHS ALTERNATIVE REMEDIES TO HEALING",COUNCIL_DISTRICT:11,LOCATION:"33.986, -118.4009",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002641279-0001-6",BUSINESS_NAME:"VENICE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"34.0025, -118.4359",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583985-0001-3",BUSINESS_NAME:"PMC NORTHRIDGE INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2238, -118.536",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002593426-0001-1",BUSINESS_NAME:"RITE MEDS COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2257, -118.536",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002585695-0001-7",BUSINESS_NAME:"ORGANIC GREEN HEALTHCARE INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0917, -118.3094",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583506-0001-6",BUSINESS_NAME:"UNIUM GROUP INC",DBA_NAME:"ROSE CITY COLLECTIVE",COUNCIL_DISTRICT:14,LOCATION:"34.1375, -118.1891",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002591521-0001-2",BUSINESS_NAME:"SB ORGANICS INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8314, -118.3073",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002564606-0001-9",BUSINESS_NAME:"GREEN CURE COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2356, -118.4907",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002603874-0001-1",BUSINESS_NAME:"DEVINE WIND INC",DBA_NAME:"GREENGOS DELIVERY",COUNCIL_DISTRICT:3,LOCATION:"34.1681, -118.5793",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584844-0001-3",BUSINESS_NAME:"CANCARE COLLECTIVE CA14",DBA_NAME:"COOL CALM COLLECTIVE CA14",COUNCIL_DISTRICT:4,LOCATION:"34.1731, -118.4661",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002565460-0001-4",BUSINESS_NAME:"WEEDELIVER DC INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1576, -118.3973",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002194623-0002-8",BUSINESS_NAME:"MICHAEL C GUTHRIE",DBA_NAME:"VALLEY INDEPENDENT PHARMACY CAREGIVER OF TARZANA",COUNCIL_DISTRICT:3,LOCATION:"34.1727, -118.5569",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002585609-0001-2",BUSINESS_NAME:"ALAIN LEAR",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0375, -118.2459",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002593941-0001-7",BUSINESS_NAME:"BLUE MOON COLLECTIVE CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0414, -118.3527",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002568614-0001-2",BUSINESS_NAME:"THE HOLLY CAUSE",DBA_NAME:"THE HOLLISTIC CENTER",COUNCIL_DISTRICT:6,LOCATION:"34.2012, -118.4821",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002513372-0001-2",BUSINESS_NAME:"GOOD ENERGY GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.151, -118.4491",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002572669-0003-2",BUSINESS_NAME:"COMMUNITY WELLNESS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1648, -118.4059",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002572669-0002-4",BUSINESS_NAME:"COMMUNITY WELLNESS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.098, -118.3588",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002572669-0004-1",BUSINESS_NAME:"COMMUNITY WELLNESS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0247, -118.4116",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002572669-0005-9",BUSINESS_NAME:"COMMUNITY WELLNESS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7444, -118.2797",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002537633-0002-7",BUSINESS_NAME:"ST. BERNARD'S PROVISIONS, INC.",DBA_NAME:"HANGAR 420",COUNCIL_DISTRICT:11,LOCATION:"34.0111, -118.4392",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002690224-0001-0",BUSINESS_NAME:"HIGHER PATH HOLISTIC CARE INC",DBA_NAME:"HIT THIS",COUNCIL_DISTRICT:1,LOCATION:"34.0714, -118.2506",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002577400-0001-3",BUSINESS_NAME:"HC REMEDIES",DBA_NAME:"VENICE MEDICAL CENTER",COUNCIL_DISTRICT:5,LOCATION:"34.0246, -118.3962",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002624869-0001-1",BUSINESS_NAME:"ALTERNAMEDS INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2597, -118.3185",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002553754-0004-7",BUSINESS_NAME:"GREEN STREET WELLNESS CENTER",DBA_NAME:"GREEN STREET WELLNESS CENTER",COUNCIL_DISTRICT:5,LOCATION:"34.039, -118.4307",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002553754-0001-2",BUSINESS_NAME:"GREEN STREET WELLNESS CENTER",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9598, -118.3939",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592482-0001-8",BUSINESS_NAME:"ST BERNARDS PROVISIONS INC",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9994, -118.4639",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002577238-0001-4",BUSINESS_NAME:"ANGEL CITY PATIENTS ASSOCIATION /C",DBA_NAME:"ELEMENTS OF NATURE",COUNCIL_DISTRICT:12,LOCATION:"34.2648, -118.5144",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002578743-0001-3",BUSINESS_NAME:"TRAVKA DELIVERY INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.18, -118.3703",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002708774-0001-5",BUSINESS_NAME:"PLATINUM HEALING INC",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0546, -118.3831",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002580241-0001-1",BUSINESS_NAME:"DOWN TO EARTH FLOWER",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1647, -118.6271",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002577487-0001-4",BUSINESS_NAME:"HK GREENHOUSE INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2015, -118.6002",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583930-0001-2",BUSINESS_NAME:"FULL FILL INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2074, -118.5535",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002580243-0001-1",BUSINESS_NAME:"KINDNESS MANAGEMENT INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1647, -118.6271",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002583301-0001-7",BUSINESS_NAME:"LAHC 3 COOPERATIVE",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2551, -118.2985",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584587-0001-7",BUSINESS_NAME:"GREEN GRASSHOPPER",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1029, -118.3296",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002580247-0001-9",BUSINESS_NAME:"VNHC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2012, -118.4672",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002582009-0001-1",BUSINESS_NAME:"MAGIC CASTLE SOLUTIONS INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2053, -118.3965",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002581059-0001-2",BUSINESS_NAME:"TRUE LIFE REMEDIES INC",DBA_NAME:"TRUE LIFE REMEDIES",COUNCIL_DISTRICT:6,LOCATION:"34.2172, -118.4635",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002581087-0001-4",BUSINESS_NAME:"GREEN MILE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0485, -118.3341",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002581834-0001-8",BUSINESS_NAME:"BARHAM GREEN COLLECTIVE INC, A CALIFORNIA NON-PROFIT MUTUAL BENEFIT CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1312, -118.3449",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002603879-0001-4",BUSINESS_NAME:"GREEN HOUSE DISPENSARY INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0771, -118.1679",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002582889-0001-6",BUSINESS_NAME:"MGM PATIENT COLLECTIVE",DBA_NAME:"LA BUDS",COUNCIL_DISTRICT:4,LOCATION:"34.1787, -118.3703",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584590-0001-9",BUSINESS_NAME:"MAGIC MARLEY",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2017, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584038-0001-2",BUSINESS_NAME:"GRADEAFLOWERS",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0401, -118.2615",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584580-0001-5",BUSINESS_NAME:"OG WISHLIST",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1524, -118.4575",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584563-0001-1",BUSINESS_NAME:"NEO EVOLUTION DEVELOPMENT LLC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0523, -118.2633",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002584588-0002-0",BUSINESS_NAME:"LA ORGANIC PHARMACY INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.0907, -118.3334",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592092-0001-9",BUSINESS_NAME:"JESUS GONZALES",DBA_NAME:"THE JOINT PATIENTS GROUP",COUNCIL_DISTRICT:1,LOCATION:"34.1006, -118.2345",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002596067-0001-0",BUSINESS_NAME:"911 CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2504, -118.4675",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002586650-0001-7",BUSINESS_NAME:"HEALERS OF TUJUNGA INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2467, -118.2769",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590035-0001-6",BUSINESS_NAME:"KUSH VALLEY INC",DBA_NAME:"HERBARIUM",COUNCIL_DISTRICT:5,LOCATION:"34.0885, -118.3446",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002665338-0001-7",BUSINESS_NAME:"KINGSTON CARE CENTER",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0569, -118.2107",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002589200-0001-8",BUSINESS_NAME:"TRUE NATURAL COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.254, -118.2973",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380246-0006-4",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"CWCC",COUNCIL_DISTRICT:9,LOCATION:"33.9886, -118.2859",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002587812-0001-5",BUSINESS_NAME:"FRESH COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0987, -118.3443",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590287-0003-6",BUSINESS_NAME:"SAN MARCOS QUALIFIED PATIENTS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1021, -118.3333",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002537633-0003-5",BUSINESS_NAME:"ST. BERNARD'S PROVISIONS, INC.",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1665, -118.6217",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590933-0001-1",BUSINESS_NAME:"SEASIDE PATIENT CARE",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1517, -118.4661",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002553754-0003-9",BUSINESS_NAME:"GREEN STREET WELLNESS CENTER",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.3015, -118.4426",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002553754-0002-1",BUSINESS_NAME:"GREEN STREET WELLNESS CENTER",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2477, -118.6063",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590933-0002-9",BUSINESS_NAME:"SEASIDE PATIENT CARE",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0897, -118.2917",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590933-0003-7",BUSINESS_NAME:"SEASIDE PATIENT CARE",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.1269, -118.4444",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590933-0004-5",BUSINESS_NAME:"SEASIDE PATIENT CARE",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0191, -118.4225",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592117-0001-1",BUSINESS_NAME:"KSK ORGANICS INC",DBA_NAME:"HARMONY HERBAL COLLECTIVE",COUNCIL_DISTRICT:13,LOCATION:"34.0795, -118.269",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592488-0001-5",BUSINESS_NAME:"EMERALD TRIANGLE WELLNESS ASSOCIATION",DBA_NAME:"EMERALD TRIANGLE WELLNESS ASSOCIATION",COUNCIL_DISTRICT:2,LOCATION:"34.2012, -118.4142",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592488-0002-3",BUSINESS_NAME:"EMERALD TRIANGLE WELLNESS ASSOCIATION",DBA_NAME:"EMEERALD TRIANGLE WELLNESS ASSOCIATION",COUNCIL_DISTRICT:3,LOCATION:"34.201, -118.6128",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592488-0003-1",BUSINESS_NAME:"EMERALD TRIANGLE WELLNESS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0442, -118.4311",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614765-0003-4",BUSINESS_NAME:"TOGETHER FOR CHANGE COOPERATIVE",DBA_NAME:"VAPORS",COUNCIL_DISTRICT:2,LOCATION:"34.2012, -118.4253",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614765-0002-6",BUSINESS_NAME:"TOGETHER FOR CHANGE COOPERATIVE",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1647, -118.6271",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002594197-0001-4",BUSINESS_NAME:"GREEN STAR COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2011, -118.4945",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002605812-0001-5",BUSINESS_NAME:"HERB ALERT INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.185, -118.4661",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002730062-0001-6",BUSINESS_NAME:"FOOTHILL MARIJUANA DOCTOR",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2529, -118.2956",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614460-0001-1",BUSINESS_NAME:"CANCARE COLLECTIVE CA58",DBA_NAME:"ALL GOOD COLLECTIVE",COUNCIL_DISTRICT:9,LOCATION:"34.0038, -118.2721",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614765-0001-8",BUSINESS_NAME:"TOGETHER FOR CHANGE COOPERATIVE",DBA_NAME:"TOGETHER FOR CHANGE",COUNCIL_DISTRICT:14,LOCATION:"34.1413, -118.221",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002619351-0001-0",BUSINESS_NAME:"LA'S MEDS 4 LESS  GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0258, -118.2404",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621342-0001-9",BUSINESS_NAME:"STICKYG ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.036, -118.2634",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002595899-0001-8",BUSINESS_NAME:"PRACTICAL CURE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1721, -118.3826",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002592531-0001-3",BUSINESS_NAME:"CANATOPIA",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.098, -118.353",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002601611-0001-5",BUSINESS_NAME:"SUNSET GREEN GARDEN INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.098, -118.3202",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002593873-0001-9",BUSINESS_NAME:"ER WELLNESS GROUP",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.1227, -118.2138",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002594446-0001-6",BUSINESS_NAME:"JERVC",DBA_NAME:"2020 HEALING",COUNCIL_DISTRICT:14,LOCATION:"34.0345, -118.2315",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002594897-0001-1",BUSINESS_NAME:"MIKAEL MIKE TASHCHYAN",DBA_NAME:"BEST BUD CAREGIVERS",COUNCIL_DISTRICT:6,LOCATION:"34.229, -118.3664",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002595748-0001-7",BUSINESS_NAME:"THE FLOWER SHOPPE, A PATIENT'S COOPERATIVE",DBA_NAME:"THE FLOWER SHOPPE",COUNCIL_DISTRICT:6,LOCATION:"34.193, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002596817-0001-7",BUSINESS_NAME:"KANDYLAND A PATIENTS COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1002, -118.3295",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002597316-0001-9",BUSINESS_NAME:"DLG INTERNATIONAL LLC",DBA_NAME:"HIGH FIVE COLLECTIVE",COUNCIL_DISTRICT:14,LOCATION:"34.048, -118.2506",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002599502-0001-8",BUSINESS_NAME:"CANOGA SPOT INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2011, -118.5788",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002590646-0001-3",BUSINESS_NAME:"RYAN KARL STRATON",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9994, -118.4639",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002597847-0001-5",BUSINESS_NAME:"OTHERSIDE HEALTH MANAGEMENT CO-OP",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0998, -118.3228",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002597698-0001-1",BUSINESS_NAME:"THE VARK 35",DBA_NAME:"AARDVARKS CO-OP",COUNCIL_DISTRICT:10,LOCATION:"34.0498, -118.3602",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002606803-0001-3",BUSINESS_NAME:"PICO BOULEVARD GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0478, -118.348",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002599975-0001-0",BUSINESS_NAME:"CLOUD 9 COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0518, -118.3685",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002601503-0001-2",BUSINESS_NAME:"WESTERN MEDICINE PATIENTS' COOPERATIVE, INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2572, -118.5371",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002650298-0001-8",BUSINESS_NAME:"ACCESS SOLUTION, INC.",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2257, -118.536",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002708181-0001-6",BUSINESS_NAME:"STATEWIDE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9888, -118.3517",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002613231-0001-1",BUSINESS_NAME:"FUNHOUSE GROUP",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1001, -118.3243",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002603135-0001-4",BUSINESS_NAME:"FRIENDLY MEDS INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0907, -118.3074",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002595187-0001-8",BUSINESS_NAME:"HERB'S HERBS INC A NON PROFIT MUTUAL BENEFIT CORPORATION",DBA_NAME:"PEOPLE'S CHOICE COLLECTIVE",COUNCIL_DISTRICT:14,LOCATION:"34.0378, -118.2596",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002613996-0001-2",BUSINESS_NAME:"PATIENT EDUCATION CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.0976, -118.3674",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002608524-0001-5",BUSINESS_NAME:"ZEN GARDEN GROUP",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1555, -118.3702",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002608006-0001-6",BUSINESS_NAME:"THE OG LAB INC",DBA_NAME:"4G",COUNCIL_DISTRICT:15,LOCATION:"33.8189, -118.2995",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002611586-0001-1",BUSINESS_NAME:"BERRY BUDDZ",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0835, -118.3029",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002607392-0001-8",BUSINESS_NAME:"GREEN PALACE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0759, -118.2873",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002609685-0001-7",BUSINESS_NAME:"GRAND MC INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0382, -118.2646",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002608719-0001-1",BUSINESS_NAME:"BROADVIEW MANAGEMENT INC",DBA_NAME:"FROM THE HEART COLLECTIVE",COUNCIL_DISTRICT:4,LOCATION:"34.1494, -118.4396",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002609305-0001-3",BUSINESS_NAME:"GH SOLUTIONS",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0856, -118.2868",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002611398-0001-8",BUSINESS_NAME:"SAM FARAH",DBA_NAME:"WIND DOCTOR",COUNCIL_DISTRICT:2,LOCATION:"34.142, -118.3946",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002618070-0001-1",BUSINESS_NAME:"SWEETWOOD PATIENTS' COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1052, -118.3164",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002623707-0001-4",BUSINESS_NAME:"GREEN BUDS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2186, -118.5885",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002613219-0001-0",BUSINESS_NAME:"2ND CHANCE WELLNESS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0413, -118.4295",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002612099-0001-5",BUSINESS_NAME:"GREEN DOVE COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7744, -118.262",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002612686-0001-7",BUSINESS_NAME:"MICHAEL B JACKSON",DBA_NAME:"MY PHETISH",COUNCIL_DISTRICT:8,LOCATION:"33.9777, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002613762-0001-7",BUSINESS_NAME:"VILLAS MEDICAL ASSISTING",DBA_NAME:"HALF MOON",COUNCIL_DISTRICT:10,LOCATION:"34.0484, -118.3558",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002611257-0001-1",BUSINESS_NAME:"KETCHUM CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.202, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002609366-0001-0",BUSINESS_NAME:"GREEN MEDICINE COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1672, -118.5322",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614160-0001-6",BUSINESS_NAME:"THE BEARING TREE A CALIFORNIA NON PROFIT MUTUAL BENEFIT CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.723, -118.313",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002170698-0002-4",BUSINESS_NAME:"THE HUMMINGBIRD COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.1213, -118.2058",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614628-0001-9",BUSINESS_NAME:"BUD LEEFS INC A CALIFORNIA NON PROFIT CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2012, -118.4824",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002665482-0001-6",BUSINESS_NAME:"CANAVERSE A COOPERATIVE CORPORATION",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7309, -118.2923",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002615696-0001-2",BUSINESS_NAME:"GIVING TREE WELLNESS",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.193, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002615420-0001-3",BUSINESS_NAME:"G.P. COLLECTIVE, INC.",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0896, -118.3091",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002615865-0001-3",BUSINESS_NAME:"MALEK BARON ABDUL MANSOUR",DBA_NAME:"THE LORD BARON COLLECTIVE",COUNCIL_DISTRICT:10,LOCATION:"34.0325, -118.334",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002616176-0001-1",BUSINESS_NAME:"ELIXIR OF LIFE COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.1235, -118.2178",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002597316-0003-5",BUSINESS_NAME:"DLG INTERNATIONAL LLC",DBA_NAME:"HIGH FIVE COLLECTIVE",COUNCIL_DISTRICT:1,LOCATION:"34.0472, -118.2886",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621772-0001-2",BUSINESS_NAME:"PRIVATE RESERVE PATIENTS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0441, -118.2516",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621639-0001-1",BUSINESS_NAME:"WILLIAM BARELLANO",DBA_NAME:"PICO PATIENTS COLLECTIVE",COUNCIL_DISTRICT:1,LOCATION:"34.0472, -118.2861",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621952-0001-1",BUSINESS_NAME:"GREENAIDE",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2253, -118.4676",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002623844-0001-3",BUSINESS_NAME:"ALEXANDER E BARBA",DBA_NAME:"GWC",COUNCIL_DISTRICT:10,LOCATION:"34.0484, -118.3335",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002617083-0001-1",BUSINESS_NAME:"SUNRISE FLOWERS INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0523, -118.3711",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002623346-0001-1",BUSINESS_NAME:"FIRST CHOICE WELLNESS INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.736, -118.2884",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002619255-0001-0",BUSINESS_NAME:"WILMINGTON CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7792, -118.2758",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002615254-0002-4",BUSINESS_NAME:"JERRY CIARAMITARO",DBA_NAME:"JFG CARE",COUNCIL_DISTRICT:15,LOCATION:"33.7404, -118.2923",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002615254-0001-6",BUSINESS_NAME:"JERRY CIARAMITARO",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7342, -118.293",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002620230-0001-1",BUSINESS_NAME:"DIVINE FLOWERS INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0392, -118.2828",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002620079-0001-0",BUSINESS_NAME:"KRASIN KA INC",DBA_NAME:"WEED ON WHEEL",COUNCIL_DISTRICT:3,LOCATION:"34.1938, -118.5192",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002620781-0001-4",BUSINESS_NAME:"EMERALD APEX INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1312, -118.3449",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621441-0001-2",BUSINESS_NAME:"ULTRACARE",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1506, -118.4469",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621391-0001-2",BUSINESS_NAME:"LIFES REWARDS INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9643, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002614081-0001-0",BUSINESS_NAME:"MICHAEL LANCE DEPALO",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.779, -118.2649",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002621909-0001-5",BUSINESS_NAME:"MEDICAL CAREGIVERS COLLETIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1648, -118.4042",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002622506-0001-6",BUSINESS_NAME:"COSMOCARE",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1726, -118.3793",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002622557-0001-9",BUSINESS_NAME:"CALIFORNIA ALTERNATIVE PATIENTS ASSOCIATION",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.0154, -118.134",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002622800-0001-3",BUSINESS_NAME:"TVA CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1974, -118.5345",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002629184-0002-2",BUSINESS_NAME:"PURPLE LEAF COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0075, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002624260-0001-1",BUSINESS_NAME:"CANNALEX",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.3114, -118.429",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002626527-0001-7",BUSINESS_NAME:"KOSHER HERBAL COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.1939, -118.4902",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002628615-0001-7",BUSINESS_NAME:"A1A COLLECTIVE, INC.",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0771, -118.1679",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002632768-0001-0",BUSINESS_NAME:"PCH CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.791, -118.2465",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002631963-0001-6",BUSINESS_NAME:"FIRST STOP MEDICAL SOLUTIONS",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9936, -118.2871",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002630332-0001-4",BUSINESS_NAME:"THE HOLISTIC PHARMACY INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0472, -118.2959",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002656699-0001-9",BUSINESS_NAME:"ARMEN YEZERYAN",DBA_NAME:"HERB DR",COUNCIL_DISTRICT:2,LOCATION:"34.1866, -118.3752",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002631092-0001-9",BUSINESS_NAME:"CALIFORNIA PALM AND CYCAD COOPERATIVE INC",DBA_NAME:"EMERALD HARBOR",COUNCIL_DISTRICT:15,LOCATION:"33.7792, -118.2758",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002646690-0001-1",BUSINESS_NAME:"SENSEN BOI INC",DBA_NAME:"GOOD LIFE COLLECTIVE",COUNCIL_DISTRICT:13,LOCATION:"34.0835, -118.2946",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002646646-0001-1",BUSINESS_NAME:"LUSHY AZON INC",DBA_NAME:"THE LUSHY COLLECTIVE",COUNCIL_DISTRICT:14,LOCATION:"34.0375, -118.2593",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002250236-0003-1",BUSINESS_NAME:"HAYK KHECHUMYAN",DBA_NAME:"GREEN EYES",COUNCIL_DISTRICT:4,LOCATION:"34.0835, -118.3166",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002682515-0001-3",BUSINESS_NAME:"ARTUR SAHAKYAN",DBA_NAME:"ORGANIC LIFE CAREGIVERS",COUNCIL_DISTRICT:6,LOCATION:"34.2089, -118.5098",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002640452-0001-6",BUSINESS_NAME:"GOOD EARTH COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.098, -118.3225",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002632770-0001-7",BUSINESS_NAME:"MOSA COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0771, -118.1679",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002634244-0001-8",BUSINESS_NAME:"SUREN POGOSYAN",DBA_NAME:"AURORA COLLECTIVE",COUNCIL_DISTRICT:2,LOCATION:"34.185, -118.3757",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002638255-0001-5",BUSINESS_NAME:"DOWNTOWN CARE CENTERS",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0585, -118.239",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002690211-0001-2",BUSINESS_NAME:"ROBERTSON CAREGIVERS INC",DBA_NAME:"SHREKS",COUNCIL_DISTRICT:10,LOCATION:"34.0388, -118.3882",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002641702-0001-0",BUSINESS_NAME:"COLLECTIVE CARE CENTER FOR THE HEALING",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0498, -118.36",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002641633-0001-7",BUSINESS_NAME:"PURPLE MONSTER ORGANICS",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2229, -118.5393",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002647877-0001-0",BUSINESS_NAME:"HYPE DELIVERY",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2938, -118.4617",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002645492-0001-7",BUSINESS_NAME:"MOTO MANAGEMENT CORP",DBA_NAME:"SAN PEDRO ALTERNATIVE SOLUTIONS",COUNCIL_DISTRICT:15,LOCATION:"33.7284, -118.2923",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002646714-0001-9",BUSINESS_NAME:"PERFECT VECTOR CORP",DBA_NAME:"GREEN OPTIONS",COUNCIL_DISTRICT:6,LOCATION:"34.1939, -118.4902",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002648427-0001-6",BUSINESS_NAME:"NEXT DOOR WELLNESS INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0255, -118.2985",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002649708-0001-5",BUSINESS_NAME:"ISMAEL MIRANDA",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0866, -118.3091",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002649973-0001-4",BUSINESS_NAME:"MICHAEL WILLIAMS",DBA_NAME:"WYATT EARTH - WELLNESS | WYATT EARTH-WELLNESS",COUNCIL_DISTRICT:9,LOCATION:"33.9986, -118.2826",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002650724-0001-5",BUSINESS_NAME:"GRAHM JONES",DBA_NAME:"STERLING IMAGE INC",COUNCIL_DISTRICT:14,LOCATION:"34.0277, -118.2504",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002690217-0001-0",BUSINESS_NAME:"UNIVERSAL GREEN AID INC",DBA_NAME:"GREENER ACRES",COUNCIL_DISTRICT:4,LOCATION:"34.1323, -118.3537",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002843577-0001-7",BUSINESS_NAME:"YANA JANASI",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.048, -118.3435",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002650847-0001-4",BUSINESS_NAME:"THE HEALING ALLEY",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0385, -118.2553",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002651189-0001-8",BUSINESS_NAME:"BESTOCARE, A CALIFORNIA MUTUAL BENEFIT CORP.",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2525, -118.2949",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002651651-0001-1",BUSINESS_NAME:"GREEN WORLD EXPRESS, INC.",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2012, -118.4824",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002655749-0001-1",BUSINESS_NAME:"SAFE HARBORS FOUNDATION",DBA_NAME:"VAN NUYS PATIENT CARE",COUNCIL_DISTRICT:6,LOCATION:"34.2011, -118.4494",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002813565-0001-5",BUSINESS_NAME:"MEDICAL MARIJUANA COLLECTIVES",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7395, -118.2923",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002654330-0001-7",BUSINESS_NAME:"DNP MANAGMENT GROUP INC",DBA_NAME:"BROADWAY WELLNESS CENTER",COUNCIL_DISTRICT:8,LOCATION:"33.9597, -118.2782",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002655278-0001-7",BUSINESS_NAME:"BHOC A COOPERATIVE CORPORATION",DBA_NAME:"WESTERN CAREGIVERS CENTER",COUNCIL_DISTRICT:13,LOCATION:"34.0799, -118.3091",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002655364-0001-3",BUSINESS_NAME:"DA B CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0667, -118.2704",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002655735-0001-0",BUSINESS_NAME:"VALLEY HERBAL",DBA_NAME:"CRENSHAW COOPERATIVE",COUNCIL_DISTRICT:8,LOCATION:"33.9789, -118.3308",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002659210-0001-8",BUSINESS_NAME:"TAMERLIJNE-GOLD CORP INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2084, -118.378",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002661336-0001-9",BUSINESS_NAME:"RICHARD E LEWIS",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"33.9839, -118.4587",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002657480-0001-5",BUSINESS_NAME:"THE QUIET HEALING CENTER COOPERATIVE, INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.0804, -118.2702",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002658051-0001-3",BUSINESS_NAME:"GENERAL ORGANICS INC",DBA_NAME:"LOCAL 420 PATIENTS COLLECTIVE",COUNCIL_DISTRICT:15,LOCATION:"33.7387, -118.2879",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002655749-0002-0",BUSINESS_NAME:"SAFE HARBORS FOUNDATION",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1866, -118.3946",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002672414-0001-4",BUSINESS_NAME:"SUNCREST-TANGENT CORP",DBA_NAME:"WESTERN WELLNESS CENTER",COUNCIL_DISTRICT:8,LOCATION:"33.9562, -118.309",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002661365-0001-5",BUSINESS_NAME:"TOPLINE COLLECTIVE",DBA_NAME:"SHERMAN OAKS ORGANIC",COUNCIL_DISTRICT:4,LOCATION:"34.1503, -118.4299",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002663489-0001-3",BUSINESS_NAME:"JOAN FRANCE HALL-WATSON",DBA_NAME:"HEALTH AND HEALING",COUNCIL_DISTRICT:8,LOCATION:"33.9934, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002664638-0001-4",BUSINESS_NAME:"TEMPLE OF OG INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002666224-0001-4",BUSINESS_NAME:"HR HEALING",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2018, -118.5954",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002659691-0001-4",BUSINESS_NAME:"EME MEDICAL COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.069, -118.3011",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002667609-0001-0",BUSINESS_NAME:"ALTERNATIVE MEDICINE COLLECTIVE GROUP INC",DBA_NAME:"HOLLYWOOD SMOKES",COUNCIL_DISTRICT:13,LOCATION:"34.1017, -118.3126",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002667301-0001-9",BUSINESS_NAME:"ALTERNATIVE MEDICINE COLLECTIVE GROUP INC.",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1017, -118.3126",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002671908-0001-2",BUSINESS_NAME:"NATURAL SUPERIOR HEALTH A CALIFORNIA NON PROFIT MUTUAL BENEFIT CORPORATION",DBA_NAME:"CPPG CANOGA PARK PATIENT GROUP",COUNCIL_DISTRICT:6,LOCATION:"34.1926, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002671011-0001-1",BUSINESS_NAME:"GOLDEN COAST ORGANICS",DBA_NAME:"GOLDEN COAST ORGANICS G.C.O.",COUNCIL_DISTRICT:8,LOCATION:"33.9745, -118.3011",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002671150-0001-9",BUSINESS_NAME:"TRUE HEALTH CENTER /C",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0045, -118.333",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002671147-0001-7",BUSINESS_NAME:"CLEAN GREEN CAREGIVERS COLLECTIVE /C",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9618, -118.4208",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002671710-0001-3",BUSINESS_NAME:"MJF PROVIDERS",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.1911, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002588344-0002-0",BUSINESS_NAME:"DENNIS-JAR CORP",DBA_NAME:"NATURES GIFT HEALING CENTER",COUNCIL_DISTRICT:8,LOCATION:"33.9611, -118.2827",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002674968-0001-6",BUSINESS_NAME:"ARAZDONI INC",DBA_NAME:"UNITED PATIENTS GROUP",COUNCIL_DISTRICT:6,LOCATION:"34.2282, -118.4657",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002675135-0001-3",BUSINESS_NAME:"COAST HIGHWAY CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7908, -118.269",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002672771-0001-7",BUSINESS_NAME:"RAMON RODRIGUEZ FR",DBA_NAME:"OCEAN SIDE COLLECTIVE",COUNCIL_DISTRICT:1,LOCATION:"34.0501, -118.2808",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002677151-0001-7",BUSINESS_NAME:"HARMONY HEALING CENTER",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.097, -118.2872",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002677463-0001-4",BUSINESS_NAME:"LOS ANGELES COUNTY COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.036, -118.2634",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002654238-0002-3",BUSINESS_NAME:"MATTHEWS BERDEGUER",DBA_NAME:"CHASEWOODS",COUNCIL_DISTRICT:6,LOCATION:"34.2282, -118.4346",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002706032-0001-0",BUSINESS_NAME:"THERAPEUTIC HERBAL CARE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1866, -118.3946",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002678594-0001-5",BUSINESS_NAME:"UVANITTE 360, INC.",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1522, -118.3636",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002682385-0001-2",BUSINESS_NAME:"NATURAL MINT",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9891, -118.3129",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002680777-0001-6",BUSINESS_NAME:"VINCENZO MERCURI",DBA_NAME:"MERCURI FARMS",COUNCIL_DISTRICT:11,LOCATION:"33.9883, -118.4546",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002681817-0001-0",BUSINESS_NAME:"CRENSHAW'S HOT SPOT",DBA_NAME:"STUDIO 11626",COUNCIL_DISTRICT:2,LOCATION:"34.1405, -118.3855",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002682108-0001-1",BUSINESS_NAME:"PICO DISCOUNT CENTER",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0472, -118.2911",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002682307-0001-2",BUSINESS_NAME:"NATURE'S GREEN CURES",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0172, -118.2199",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002682422-0001-5",BUSINESS_NAME:"MCGREENS INC",DBA_NAME:"3RD STREET CAREGIVERS",COUNCIL_DISTRICT:10,LOCATION:"34.069, -118.298",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002682999-0001-3",BUSINESS_NAME:"CANCARE COLLECTIVE CA 32",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2077, -118.571",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002683754-0001-7",BUSINESS_NAME:"MINH DUONG",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002680987-0001-6",BUSINESS_NAME:"HEALTHY ALTERNATIVE MEDICAL COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002685308-0001-9",BUSINESS_NAME:"HEALING HAZE COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0428, -118.3643",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002687754-0001-6",BUSINESS_NAME:"LA CENTRAL PATIENTS GROUP",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.957, -118.2827",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002690939-0001-3",BUSINESS_NAME:"CANOGA PATIENT CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2018, -118.5954",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002691964-0001-9",BUSINESS_NAME:"MIRACLE HIGHTS INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0039, -118.2408",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002692226-0001-3",BUSINESS_NAME:"LUSH COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1049, -118.2582",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002698545-0001-4",BUSINESS_NAME:"UNIFIED PATIENT ALLIANCE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2228, -118.3877",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002694544-0001-1",BUSINESS_NAME:"OCEANSIDE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0501, -118.2808",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002694533-0001-2",BUSINESS_NAME:"FLORAL GOODS INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1682, -118.6008",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002690946-0001-3",BUSINESS_NAME:"MECHELLE TABOR / CHAD JOSEPH",DBA_NAME:"THE POT SPOT",COUNCIL_DISTRICT:5,LOCATION:"34.0564, -118.4424",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002694536-0001-6",BUSINESS_NAME:"OLIVE MEDICAL CAREGIVERS INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0365, -118.2642",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002698742-0001-7",BUSINESS_NAME:"ENLIGHHHTENED MEDICINALS INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0465, -118.259",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002698740-0001-8",BUSINESS_NAME:"QUALITY TRADE GROUP INC",DBA_NAME:"BOYLE HEIGHTS PATIENTS CENTER",COUNCIL_DISTRICT:0,LOCATION:"34.0155, -118.1344",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002678416-0001-7",BUSINESS_NAME:"DOWNTOWN HIGHWAY COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0248, -118.2392",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002700654-0001-1",BUSINESS_NAME:"EZ LIFE GROUP CENTER",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0736, -118.2161",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002699893-0002-3",BUSINESS_NAME:"CHRISTOPHER BARRAGAN",DBA_NAME:"SAN PEDRO DAILY DEALS",COUNCIL_DISTRICT:15,LOCATION:"33.736, -118.2884",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002700316-0001-1",BUSINESS_NAME:"SKY HIGH CAREGIVERS INC",DBA_NAME:"SKY HIGH",COUNCIL_DISTRICT:2,LOCATION:"34.18, -118.3703",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002701666-0001-1",BUSINESS_NAME:"AVALON CENTER LA CROUP",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002700505-0001-0",BUSINESS_NAME:"GREEN CASA COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.066, -118.2083",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002700681-0001-9",BUSINESS_NAME:"KINGS MEDS COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1793, -118.4424",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002704308-0001-6",BUSINESS_NAME:"DAYSRUS",DBA_NAME:"CLUB ORO",COUNCIL_DISTRICT:1,LOCATION:"34.043, -118.2823",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002703323-0001-3",BUSINESS_NAME:"FLORA SOLIS",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.063, -118.2358",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002704338-0001-7",BUSINESS_NAME:"CITY MEDS COLLECTIVE INC",DBA_NAME:"CITY BUDS COLLECTIVE",COUNCIL_DISTRICT:2,LOCATION:"34.1576, -118.3973",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002704046-0001-7",BUSINESS_NAME:"RESEDAS MEDS INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1971, -118.536",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002705954-0001-2",BUSINESS_NAME:"MILLENIUM FOUNDATION COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1793, -118.4583",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002706775-0001-5",BUSINESS_NAME:"TMY BUDS INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1721, -118.4391",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002704762-0001-3",BUSINESS_NAME:"ASD COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2442, -118.3869",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002705834-0001-7",BUSINESS_NAME:"CANNACARE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.201, -118.517",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002620522-0001-1",BUSINESS_NAME:"ALL AMERICAN HEALTH & HEALING COOPERATIVE INC",DBA_NAME:"THE SPEEZY",COUNCIL_DISTRICT:8,LOCATION:"33.9745, -118.3119",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002706821-0001-7",BUSINESS_NAME:"CCNC DISTRIBUTION LLC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8314, -118.3067",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002706263-0001-1",BUSINESS_NAME:"TEN TEN ASSOCIATED GROUP",DBA_NAME:"TAMPA CARE",COUNCIL_DISTRICT:3,LOCATION:"34.2074, -118.5535",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002706250-0001-4",BUSINESS_NAME:"HEAVENS TOUCH",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2596, -118.3113",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002708399-0001-2",BUSINESS_NAME:"MAGNA RESOURCE CENTER",DBA_NAME:"CLUB 58 GROUP CENTER",COUNCIL_DISTRICT:1,LOCATION:"34.1103, -118.1912",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002707893-0001-9",BUSINESS_NAME:"WILSONS WELLESS CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2216, -118.4278",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002708703-0001-5",BUSINESS_NAME:"CA BUDS INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2033, -118.4487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002709822-0001-3",BUSINESS_NAME:"HOLLYBUDS INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1002, -118.2902",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002751800-0001-1",BUSINESS_NAME:"ZEN MEDICAL GARDEN INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1724, -118.5466",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002715126-0001-1",BUSINESS_NAME:"NATURES GREEN GROUP, INC.",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0001, -118.2783",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002713899-0001-3",BUSINESS_NAME:"GAS STATION GROUP CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1721, -118.4301",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002715357-0001-3",BUSINESS_NAME:"SUMMIT SQUARE",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0479, -118.3487",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002718595-0001-7",BUSINESS_NAME:"VISTA DELIVERY INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.172, -118.6041",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002720591-0001-7",BUSINESS_NAME:"COLLECTIVE CARE GIVERS CENTER INC.",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9745, -118.2964",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002721023-0001-7",BUSINESS_NAME:"SUNSET HILLS WELLNESS CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1682, -118.6008",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002257092-0001-3",BUSINESS_NAME:"HOLLYWOOD HOLISTIC HEALERS INC",DBA_NAME:"HOLLYWOOD HOLISTIC HEALERS",COUNCIL_DISTRICT:4,LOCATION:"34.1573, -118.4057",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780117-0001-1",BUSINESS_NAME:"NATURE'S HEALING PRODUCTS",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9789, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002742011-0001-4",BUSINESS_NAME:"VADIM KHARITONOV",DBA_NAME:"PURE DECISION ASSOCIATION",COUNCIL_DISTRICT:13,LOCATION:"34.0907, -118.3228",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002723788-0001-3",BUSINESS_NAME:"SAFEWAY TREES DELIVERY INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1682, -118.6008",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002723854-0001-2",BUSINESS_NAME:"MK WELLNESS INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0335, -118.2625",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002724186-0001-2",BUSINESS_NAME:"GREEN LOVE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"33.9454, -118.317",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002727622-0001-5",BUSINESS_NAME:"TANNER-VEST INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1939, -118.3869",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002748298-0001-5",BUSINESS_NAME:"POISON IVY INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.3016, -118.442",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002726472-0001-0",BUSINESS_NAME:"TRAVEIL NORWOOD",DBA_NAME:"THE POT SHOP",COUNCIL_DISTRICT:8,LOCATION:"34.0084, -118.3023",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002744951-0001-7",BUSINESS_NAME:"GOOD VIBES INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0417, -118.2585",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002726440-0001-0",BUSINESS_NAME:"ORGANIC HERB PHARMACY INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0398, -118.3422",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002722786-0001-7",BUSINESS_NAME:"FEDRIS CESAR",DBA_NAME:"WESTWOOD WELLNESS",COUNCIL_DISTRICT:5,LOCATION:"34.0243, -118.4112",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002720299-0001-9",BUSINESS_NAME:"DONNA GRAHAM/LAMAR GRAHAM",DBA_NAME:"GRAHAM & GRAHAM",COUNCIL_DISTRICT:10,LOCATION:"34.0232, -118.3383",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002728528-0001-1",BUSINESS_NAME:"COP AREA 51 INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0736, -118.2161",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002730739-0001-4",BUSINESS_NAME:"ROSCOE CARE",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.2197, -118.6004",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002731111-0001-9",BUSINESS_NAME:"SEVENFOURELEVEN INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2052, -118.3877",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002736799-0001-0",BUSINESS_NAME:"LANSING-CHASE CORP",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9535, -118.309",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002791859-0001-5",BUSINESS_NAME:"EAST LOS ANGELES CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.0175, -118.1438",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002735248-0001-9",BUSINESS_NAME:"AGS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0953, -118.2281",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002736922-0001-9",BUSINESS_NAME:"JESSE ORENSTEIN",DBA_NAME:"COAST TO COAST",COUNCIL_DISTRICT:3,LOCATION:"34.1999, -118.5977",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002737127-0001-3",BUSINESS_NAME:"GANJA HOUSE COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0314, -118.1985",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002737922-0001-6",BUSINESS_NAME:"BLACKSTONE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1794, -118.3958",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002739627-0001-9",BUSINESS_NAME:"WORLD ON WHEELS WELLNESS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.0622, -118.3479",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002743543-0001-2",BUSINESS_NAME:"EXHALE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2306, -118.4023",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002744392-0001-7",BUSINESS_NAME:"DGR LLC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1694, -118.5376",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002742664-0001-5",BUSINESS_NAME:"THE RECOVERY GROUP INC",DBA_NAME:"OXNARD HEALTH SOLUTIONS",COUNCIL_DISTRICT:4,LOCATION:"34.1793, -118.4424",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002739347-0001-1",BUSINESS_NAME:"FUSION STOP",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0173, -118.3088",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002744602-0001-9",BUSINESS_NAME:"CALI H COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0513, -118.279",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002745344-0001-5",BUSINESS_NAME:"GNN HEALTH CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1911, -118.3877",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002745345-0001-0",BUSINESS_NAME:"KNH PRE ICO HEALTH CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2216, -118.4278",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002744259-0001-6",BUSINESS_NAME:"HINDSIGHT420 CENTER",DBA_NAME:"BROADWAY CORNER SHOP",COUNCIL_DISTRICT:9,LOCATION:"33.9817, -118.2782",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002745150-0001-4",BUSINESS_NAME:"OLIVES CAREGIVER INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0365, -118.2642",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002745466-0001-0",BUSINESS_NAME:"TOLUCA HEALTH CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0058, -118.334",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002739347-0002-0",BUSINESS_NAME:"FUSION STOP",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0174, -118.3088",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002743003-0001-7",BUSINESS_NAME:"UNIVERSAL HOLISTIC MEDICINE",DBA_NAME:"UNIVERSAL HOLISTIC MEDICINE",COUNCIL_DISTRICT:8,LOCATION:"33.9904, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002758100-0001-4",BUSINESS_NAME:"FIRST ESSENTIAL CARE",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9745, -118.3246",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002757865-0001-9",BUSINESS_NAME:"TRASON-LAN CORP",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2257, -118.536",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380246-0010-2",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0635, -118.3097",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002760747-0001-8",BUSINESS_NAME:"GREEN MILE COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1649, -118.3662",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002761008-0001-8",BUSINESS_NAME:"ROYAL TREATMENT CENTER",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9621, -118.2918",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002765586-0001-8",BUSINESS_NAME:"MMCG SERVICES INC",DBA_NAME:"LUSHY COLLECTIVE",COUNCIL_DISTRICT:14,LOCATION:"34.0375, -118.2593",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002765356-0001-1",BUSINESS_NAME:"CCSP",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7404, -118.2923",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002766233-0001-9",BUSINESS_NAME:"FXS MANAGEMENT",DBA_NAME:"WEEDLAND",COUNCIL_DISTRICT:15,LOCATION:"33.7777, -118.2622",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002767011-0001-3",BUSINESS_NAME:"BY THE SEA INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0501, -118.2808",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002766420-0001-8",BUSINESS_NAME:"GAGIK GAZARIAN",DBA_NAME:"MONARQ CAREGIVERS",COUNCIL_DISTRICT:2,LOCATION:"34.1866, -118.3861",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002782405-0001-7",BUSINESS_NAME:"VERNON COLLECTIVE, INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0039, -118.2408",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002767628-0001-8",BUSINESS_NAME:"SONYA MELKONYAN",DBA_NAME:"INGLEWOOD NATURAL CARE",COUNCIL_DISTRICT:10,LOCATION:"34.0107, -118.3215",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002777184-0001-7",BUSINESS_NAME:"TEAM TGCC",DBA_NAME:"THE GREEN CONDOR COLLECTIVE",COUNCIL_DISTRICT:8,LOCATION:"33.9739, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002775134-0001-4",BUSINESS_NAME:"EVERLINE CORP",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9535, -118.309",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002776235-0001-4",BUSINESS_NAME:"SO CALI ORGANIC CONNECT CORP",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9866, -118.3002",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002776624-0001-9",BUSINESS_NAME:"NEW DAY HEALING",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9936, -118.2871",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780625-0001-6",BUSINESS_NAME:"FRESH FLO",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2382, -118.5362",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002777839-0001-9",BUSINESS_NAME:"GREEN QUALITY INC",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1196, -118.2592",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780441-0001-9",BUSINESS_NAME:"CALI FIREHOUSE",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9581, -118.3961",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002778937-0001-5",BUSINESS_NAME:"HECTOR GARCIA SARINANA",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1727, -118.5602",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002779092-0001-8",BUSINESS_NAME:"WESTERN NATURAL RELIEF",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.1633, -118.2792",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002777340-0001-1",BUSINESS_NAME:"DR GTLA INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9746, -118.2882",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002779042-0001-0",BUSINESS_NAME:"GREEN STAR REMEDIES INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9676, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780278-0001-5",BUSINESS_NAME:"SALVADOR GALLARDO",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"33.9813, -118.2302",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002780343-0001-0",BUSINESS_NAME:"OLDHAMMER",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2319, -118.4378",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002778633-0001-2",BUSINESS_NAME:"THE ROSE HOLISTIC CENTER",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9841, -118.2782",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002781692-0001-5",BUSINESS_NAME:"MASTER TREE SHOP",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0097, -118.2565",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002784378-0001-2",BUSINESS_NAME:"WEST COAST FINEST",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9697, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002783531-0001-5",BUSINESS_NAME:"WAX CITY BREATHING ROOM",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7432, -118.2878",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002787044-0001-1",BUSINESS_NAME:"WILMINGTON ORGANIC WELLNESS, INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7773, -118.2622",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002790940-0001-1",BUSINESS_NAME:"TIKORGANIC COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0249, -118.2592",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002788648-0001-5",BUSINESS_NAME:"THE HIGHWAY COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.5248, -118.0982",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002789925-0001-6",BUSINESS_NAME:"GREENLAND COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0318, -118.2653",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002792510-0001-2",BUSINESS_NAME:"BOB COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2012, -118.4142",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002792270-0001-0",BUSINESS_NAME:"GREEN HEALTH MEDICINALS",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0471, -118.2659",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002794167-0001-4",BUSINESS_NAME:"CROSSOVER COLLECTIVE",DBA_NAME:"MR NATURAL'S",COUNCIL_DISTRICT:1,LOCATION:"34.0602, -118.2744",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002795046-0001-1",BUSINESS_NAME:"GEEISH INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2184, -118.368",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002799833-0001-9",BUSINESS_NAME:"OLMIX INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1405, -118.3705",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002802670-0001-1",BUSINESS_NAME:"S & S DELIVERY INC",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1937, -118.589",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002802672-0001-0",BUSINESS_NAME:"CRENSHAW KINGS COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0102, -118.3351",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002823131-0001-0",BUSINESS_NAME:"OUTER SPACE CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0664, -118.2979",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002796880-0001-1",BUSINESS_NAME:"THE FARM",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"33.9879, -118.471",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002799329-0001-1",BUSINESS_NAME:"COLORADO QUALITY PAIN RELIEF INC",DBA_NAME:"GANJARUNNER",COUNCIL_DISTRICT:0,LOCATION:"0, 0",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002798695-0001-6",BUSINESS_NAME:"SANPRO HEALTH INC",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2596, -118.3117",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002801804-0001-2",BUSINESS_NAME:"KLUB MED INC",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2572, -118.5895",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002834142-0001-1",BUSINESS_NAME:"CCSC/ THE COMPASSIONATE CARE OF STUDIO CITY GROUP",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1518, -118.467",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002796840-0001-7",BUSINESS_NAME:"2 ONE 3 INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2093, -118.3637",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002796784-0001-1",BUSINESS_NAME:"MENDOZUL INC",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.1549, -118.4486",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002796853-0001-4",BUSINESS_NAME:"TINKEROSE INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9745, -118.2991",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002796672-0001-1",BUSINESS_NAME:"THE GREEN FLOWER SHOP, INC.",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9878, -118.3001",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002797013-0001-1",BUSINESS_NAME:"CONSTANT CONTACT ASSOCIATED GROUP",DBA_NAME:"EAST LA WELLNESS CENTER",COUNCIL_DISTRICT:14,LOCATION:"34.0262, -118.2196",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002805422-0001-7",BUSINESS_NAME:"GROW BOYS CULTIVATION INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0092, -118.2793",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002804437-0001-6",BUSINESS_NAME:"CONSTANT STRAIN COLLECTIVE",DBA_NAME:"ORGANIC GARDEN",COUNCIL_DISTRICT:2,LOCATION:"34.2012, -118.4273",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002815166-0001-1",BUSINESS_NAME:"CALIFORNIA BOTANICAL DIVISION LLC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0763, -118.2163",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002627252-0002-6",BUSINESS_NAME:"KML CONSULTANT INC",DBA_NAME:"KML WELLNESS CENTER",COUNCIL_DISTRICT:9,LOCATION:"33.9865, -118.3002",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002804748-0001-9",BUSINESS_NAME:"BROADWAY HEALTH CARE REHAB CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9855, -118.2783",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002805129-0001-4",BUSINESS_NAME:"ROBERT C WHITE",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0028, -118.3314",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002805125-0001-6",BUSINESS_NAME:"PRIORITY WELLNESS",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0399, -118.3023",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002806769-0001-5",BUSINESS_NAME:"VIP COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.1876, -118.4474",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380246-0013-7",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"CLUB MED",COUNCIL_DISTRICT:8,LOCATION:"33.9745, -118.2991",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002818736-0001-1",BUSINESS_NAME:"T.C. METHOD",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1027, -118.3417",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002808156-0001-3",BUSINESS_NAME:"ASSOCIATION FOR BETTER HEALTH INC",DBA_NAME:"SPEEDY GREENS",COUNCIL_DISTRICT:8,LOCATION:"34.0046, -118.3122",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002809698-0001-5",BUSINESS_NAME:"CHRONIC PAIN RELIEF CENTER",DBA_NAME:"",COUNCIL_DISTRICT:4,LOCATION:"34.098, -118.3649",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380246-0014-5",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"DANK STATION",COUNCIL_DISTRICT:10,LOCATION:"34.0586, -118.309",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002812209-0001-0",BUSINESS_NAME:"WEST ADAMS MEDICAL",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0314, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002843425-0001-1",BUSINESS_NAME:"COLLECTIVE PHARMACEUTICAL INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2216, -118.4338",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002817794-0001-7",BUSINESS_NAME:"PALMDALE TREATMENT CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"0, 0",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002818418-0001-9",BUSINESS_NAME:"NEW HARVEST TRADING INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9599, -118.3026",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002819847-0001-5",BUSINESS_NAME:"COLLECTIVE SOLUTIONS INC",DBA_NAME:"WEST COAST PACIFIC ENTERPRISE",COUNCIL_DISTRICT:9,LOCATION:"33.9745, -118.2782",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002821510-0001-6",BUSINESS_NAME:"GREEN HAILO",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.1483, -118.2757",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002830315-0001-1",BUSINESS_NAME:"SFV DISCOUNT",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0453, -118.2464",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002823765-0001-8",BUSINESS_NAME:"SCCG CLUB",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"33.9565, -118.3002",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380246-0015-3",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9299, -118.2915",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002825334-0001-4",BUSINESS_NAME:"FAST 420 INC",DBA_NAME:"",COUNCIL_DISTRICT:14,LOCATION:"34.0498, -118.2533",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002827965-0001-3",BUSINESS_NAME:"TERRENCE MUDFORD",DBA_NAME:"THE IVY ROOM",COUNCIL_DISTRICT:8,LOCATION:"33.9754, -118.3308",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002827335-0001-3",BUSINESS_NAME:"HOUSE OF BUDS CORP",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9643, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002380246-0016-1",BUSINESS_NAME:"TLPC COLLECTIVE LLC",DBA_NAME:"CLUB MED",COUNCIL_DISTRICT:9,LOCATION:"33.9872, -118.3001",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002827461-0001-4",BUSINESS_NAME:"GREEN HARBOR CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7832, -118.2627",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002828432-0001-5",BUSINESS_NAME:"RELEAF CAFE",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.1563, -118.7993",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002799012-0002-0",BUSINESS_NAME:"KELA ENTERPRISES LLC",DBA_NAME:"VENICE WELLNESS CENTER",COUNCIL_DISTRICT:1,LOCATION:"34.0424, -118.2811",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002852420-0001-8",BUSINESS_NAME:"GOLDEN STATE COLLECTIVE INC",DBA_NAME:"WEEDLAND HILLS",COUNCIL_DISTRICT:3,LOCATION:"34.1725, -118.5624",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002870920-0001-7",BUSINESS_NAME:"GRACHIYA VARTAZARYAN",DBA_NAME:"",COUNCIL_DISTRICT:5,LOCATION:"34.0836, -118.3523",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002832555-0001-7",BUSINESS_NAME:"MARTEL G MILLER",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1923, -118.3845",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002835314-0001-3",BUSINESS_NAME:"VANOWEN SPOT",DBA_NAME:"",COUNCIL_DISTRICT:3,LOCATION:"34.1937, -118.589",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002832609-0001-5",BUSINESS_NAME:"LOVEBUDS COLLECTIVE",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0398, -118.331",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002833338-0001-4",BUSINESS_NAME:"NATURAL REM INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1866, -118.3861",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002837822-0001-3",BUSINESS_NAME:"THE HERBAL ANTIDOTE INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"34.0275, -118.2701",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002835199-0001-9",BUSINESS_NAME:"RIO GRANDE GROUP",DBA_NAME:"LA'S FINEST COLLECTIVE",COUNCIL_DISTRICT:10,LOCATION:"34.0417, -118.309",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002856152-0001-2",BUSINESS_NAME:"CRYSTAL GREEN COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"33.9555, -118.3094",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002838602-0001-7",BUSINESS_NAME:"HOLLY MOLLY INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0657, -118.3095",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002855747-0001-3",BUSINESS_NAME:"GREEN VALLEY COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.8819, -118.2905",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002856080-0001-6",BUSINESS_NAME:"MELLOW YELLOW COLLECTIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.1654, -118.3931",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002839066-0001-5",BUSINESS_NAME:"STALK OF LIFE INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"0, 0",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002856362-0001-2",BUSINESS_NAME:"UNIQUE HEALTH SOLUTIONS INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9749, -118.3063",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002835197-0001-0",BUSINESS_NAME:"YOUR GREEN SPOT, INC.",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0065, -118.3345",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002838312-0001-6",BUSINESS_NAME:"GRAND GREEN GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.0543, -118.2919",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002837773-0001-8",BUSINESS_NAME:"GOOD TIMES CARE CENTER INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7313, -118.2922",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002835725-0001-4",BUSINESS_NAME:"HIGHEST VAN NUYS",DBA_NAME:"HIGHEST VAN NUYS",COUNCIL_DISTRICT:6,LOCATION:"34.201, -118.5016",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002836992-0001-0",BUSINESS_NAME:"GEVORG SARYAN",DBA_NAME:"NUTRITIUS WEED",COUNCIL_DISTRICT:13,LOCATION:"34.0849, -118.3157",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002837443-0001-2",BUSINESS_NAME:"THE HOLISTIC CENTER",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2012, -118.4189",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002837595-0001-8",BUSINESS_NAME:"NATIVE AMERICAN CHURCH OF BALBOA",DBA_NAME:"",COUNCIL_DISTRICT:12,LOCATION:"34.2647, -118.504",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002839048-0001-7",BUSINESS_NAME:"NATURAL THERAPY COLLECTIVE CORP",DBA_NAME:5954,COUNCIL_DISTRICT:9,LOCATION:"33.9866, -118.3002",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002860702-0001-6",BUSINESS_NAME:"MELITA INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.1851, -118.4492",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002859861-0001-1",BUSINESS_NAME:"CALI GARDENS INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9528, -118.2781",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002839800-0001-1",BUSINESS_NAME:"GOOD CAUSE GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:11,LOCATION:"34.0537, -118.4654",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002839858-0001-6",BUSINESS_NAME:"BUDWAY GROUP INC",DBA_NAME:"",COUNCIL_DISTRICT:6,LOCATION:"34.2084, -118.508",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002860458-0001-7",BUSINESS_NAME:"POSITIVE ENERGY ASSOCIATED",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7791, -118.2768",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002843793-0001-2",BUSINESS_NAME:"SHEENAH OH",DBA_NAME:"TOTAL HEALING TOUCH COLLECTIVE",COUNCIL_DISTRICT:2,LOCATION:"34.1398, -118.3791",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002844515-0001-3",BUSINESS_NAME:"PURPLE STALLION",DBA_NAME:"",COUNCIL_DISTRICT:7,LOCATION:"34.2599, -118.3085",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002846640-0001-4",BUSINESS_NAME:"GCBC MANAGEMENT INC",DBA_NAME:"",COUNCIL_DISTRICT:9,LOCATION:"33.9855, -118.2783",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002845333-0001-2",BUSINESS_NAME:"THE COSMIC COUGAR INC",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.0264, -118.1439",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002845331-0001-3",BUSINESS_NAME:"GRIZZLY GREEN INC",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"34.0175, -118.1436",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002846254-0001-3",BUSINESS_NAME:"HEALING CAREGIVERS",DBA_NAME:"MEGA MEDS",COUNCIL_DISTRICT:14,LOCATION:"34.046, -118.2525",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002850793-0001-7",BUSINESS_NAME:"A TO Z GREEN GARDEN INC",DBA_NAME:"",COUNCIL_DISTRICT:2,LOCATION:"34.2058, -118.3877",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002846211-0001-5",BUSINESS_NAME:"FREEDOM FARMERS COLLECTIVE INC.",DBA_NAME:"",COUNCIL_DISTRICT:13,LOCATION:"34.114, -118.2555",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002854012-0001-5",BUSINESS_NAME:"GHSP INC",DBA_NAME:"",COUNCIL_DISTRICT:15,LOCATION:"33.7444, -118.2797",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002855828-0001-9",BUSINESS_NAME:"JAMES VCM HEALING CENTER",DBA_NAME:"THE LEAGUE",COUNCIL_DISTRICT:15,LOCATION:"33.8811, -118.2912",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002859714-0001-8",BUSINESS_NAME:"WILDFIRE LOS ANGELES COOPERATIVE INC",DBA_NAME:"",COUNCIL_DISTRICT:1,LOCATION:"34.0577, -118.2843",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002854143-0001-9",BUSINESS_NAME:"GREEN SKY HYDRO INC",DBA_NAME:"GREEN SKY HYDRO",COUNCIL_DISTRICT:7,LOCATION:"34.2517, -118.4273",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002854627-0001-1",BUSINESS_NAME:"ADRIAN JOE",DBA_NAME:"GREEN CROSS OF LOS ANGELES",COUNCIL_DISTRICT:8,LOCATION:"34.0108, -118.3037",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002858250-0001-6",BUSINESS_NAME:"MJ DELIVERY INC",DBA_NAME:"",COUNCIL_DISTRICT:10,LOCATION:"34.069, -118.2932",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002858738-0001-6",BUSINESS_NAME:"PRIMETIME TREATMENT CENTER",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0037, -118.3089",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002681797-0005-3",BUSINESS_NAME:"CA PROP 215 DELIVERY SERVICES INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0037, -118.3062",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002863653-0001-2",BUSINESS_NAME:"EUTOPIA WELLNESS INC",DBA_NAME:"",COUNCIL_DISTRICT:0,LOCATION:"0, 0",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002858789-0001-9",BUSINESS_NAME:"BREDRINS INC",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"34.0095, -118.3351",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002864147-0001-3",BUSINESS_NAME:"SELECT MED CENTER",DBA_NAME:"CANOGA'S FINEST",COUNCIL_DISTRICT:3,LOCATION:"34.2015, -118.5928",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002862328-0001-2",BUSINESS_NAME:"JERRY GLASS",DBA_NAME:"AMG MEDICAL MARIJUANA COLLECTIVE",COUNCIL_DISTRICT:10,LOCATION:"34.0616, -118.3142",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002866084-0001-1",BUSINESS_NAME:"HOOVER STREET CAREGIVERS",DBA_NAME:"",COUNCIL_DISTRICT:8,LOCATION:"33.9782, -118.287",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002867759-0001-7",BUSINESS_NAME:"LUNAR MEDS",DBA_NAME:"MR GREENCH",COUNCIL_DISTRICT:14,LOCATION:"34.0316, -118.2641",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0002869310-0001-3",BUSINESS_NAME:"HCR REMEDIES",DBA_NAME:"HC REMEDIES",COUNCIL_DISTRICT:10,LOCATION:"34.0479, -118.3439",STATUS_GROUP:""},{LOCATION_ACCOUNT:"0000163971-0001-8",BUSINESS_NAME:"BEN OFFER NAZARI",DBA_NAME:"EASY FIT",COUNCIL_DISTRICT:6,LOCATION:"34.186, -118.4487",STATUS_GROUP:""}]}
function feeAmountAll(checkCapId) {
/*---------------------------------------------------------------------------------------------------------/
| Function Intent:
| This function will return the total fee amount for all the fees on the record provided. If optional
| status are provided then it will only return the fee amounts having at status in the lists.
|
| Returns:
| Outcome  Description   Return  Type
| Success: Total fee amount  feeTotal Numeric
| Failure: Error    False  False
|
| Call Example:
| feeAmountAll(capId,"NEW");
|
| 05/15/2012 - Ewylam
| Version 1 Created
|
| Required paramaters in order:
| checkCapId - capId model of the record
|
/----------------------------------------------------------------------------------------------------------*/

 // optional statuses to check for (SR5082)
        var checkStatus = false;
 var statusArray = new Array();

 //get optional arguments
 if (arguments.length > 1)
  {
  checkStatus = true;
  for (var i=1; i<arguments.length; i++)
   statusArray.push(arguments[i]);
  }

 var feeTotal = 0;
 var feeResult=aa.fee.getFeeItems(checkCapId);
 if (feeResult.getSuccess())
  { var feeObjArr = feeResult.getOutput(); }
 else
  { logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false; }

 for (ff in feeObjArr) {
  if ( !checkStatus || exists(feeObjArr[ff].getFeeitemStatus(),statusArray) )
   { feeTotal+=feeObjArr[ff].getFee(); }
   }
 return feeTotal;
}
function generateReportForEmail_BCC(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var vAltId;
	var user = currentUserID;   // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
	var permit;
	var reportResult;
	var reportOutput;
	var vReportName;
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap);
    report.setReportParameters(parameters);

	vAltId = itemCap.getCustomID();
	report.getEDMSEntityIdModel().setAltId(vAltId);

    permit = aa.reportManager.hasPermission(reportName, user);
    if (permit.getOutput().booleanValue()) {
        reportResult = aa.reportManager.getReportResult(report);
        if (!reportResult.getSuccess()) {
            logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
        else {
            reportOutput = reportResult.getOutput();
			vReportName = reportOutput.getName();
			logDebug("Report " + vReportName + " generated for record " + itemCap.getCustomID() + ". " + parameters);
            return vReportName;
        }
    }
    else {
        logDebug("Permissions are not set for report " + reportName + ".");
        return false;
    }
}
function getACAUrl(){

	// returns the path to the record on ACA.  Needs to be appended to the site

	itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
   	var acaUrl = "";
	var id1 = capId.getID1();
	var id2 = capId.getID2();
	var id3 = capId.getID3();
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();

	acaUrl += "/urlrouting.ashx?type=1000";
	acaUrl += "&Module=" + cap.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	acaUrl += "&fromACA=Y";
	return acaUrl;
	}

function getAddress(capId)
{
	capAddresses = null;
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses == null || capAddresses.length == 0)
		{
			logDebug("WARNING: no addresses on this CAP:" + capId);
			capAddresses = null;
		}
	}
	else
	{
		logDebug("Error: Failed to address: " + s_result.getErrorMessage());
		capAddresses = null;
	}
	return capAddresses;
}





function getAddressInALine() {

	var capAddrResult = aa.address.getAddressByCapId(capId);
	var addressToUse = null;
	var strAddress = "";

	if (capAddrResult.getSuccess()) {
		var addresses = capAddrResult.getOutput();
		if (addresses) {
			for (zz in addresses) {
  				capAddress = addresses[zz];
				if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
					addressToUse = capAddress;
			}
			if (addressToUse == null)
				addressToUse = addresses[0];

			if (addressToUse) {
			    strAddress = addressToUse.getHouseNumberStart();
			    var addPart = addressToUse.getStreetDirection();
			    if (addPart && addPart != "")
			    	strAddress += " " + addPart;
			    var addPart = addressToUse.getStreetName();
			    if (addPart && addPart != "")
			    	strAddress += " " + addPart;
			    var addPart = addressToUse.getStreetSuffix();
			    if (addPart && addPart != "")
			    	strAddress += " " + addPart;
			    var addPart = addressToUse.getCity();
			    if (addPart && addPart != "")
			    	strAddress += " " + addPart + ",";
			    var addPart = addressToUse.getState();
			    if (addPart && addPart != "")
			    	strAddress += " " + addPart;
			    var addPart = addressToUse.getZip();
			    if (addPart && addPart != "")
			    	strAddress += " " + addPart;
				return strAddress
			}
		}
	}
	return null;
}

function getAllParents(pAppType) {
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	//

	parentArray = getRoots(capId);

	myArray = new Array();

	if (parentArray.length > 0) {
		if (parentArray.length) {
			for (x in parentArray) {
				if (pAppType != null) {
					//If parent type matches apType pattern passed in, add to return array
					if (appMatch(pAppType, parentArray[x]))
						myArray.push(parentArray[x]);
				} else
					myArray.push(parentArray[x]);
			}

			return myArray;
		} else {
			logDebug("**WARNING: GetParent found no project parent for this application");
			return null;
		}
	} else {
		logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
}

/*--------------------------------------------------------------------------------------------------------------------/
| Start ETW 09/16/14 Added getAppName Function
/--------------------------------------------------------------------------------------------------------------------*/
function getAppName() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    { logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false }

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}
/*--------------------------------------------------------------------------------------------------------------------/
| End ETW 09/16/14 Added getAppName Function
/--------------------------------------------------------------------------------------------------------------------*/
function getAppSpecificInfo(capId)
{
	capAppSpecificInfo = null;
	var s_result = aa.appSpecificInfo.getByCapID(capId);
	if(s_result.getSuccess())
	{
		capAppSpecificInfo = s_result.getOutput();
		if (capAppSpecificInfo == null || capAppSpecificInfo.length == 0)
		{
			aa.print("WARNING: no appSpecificInfo on this CAP:" + capId);
			capAppSpecificInfo = null;
		}
	}
	else
	{
		aa.print("ERROR: Failed to appSpecificInfo: " + s_result.getErrorMessage());
		capAppSpecificInfo = null;
	}
	// Return AppSpecificInfoModel[]
	return capAppSpecificInfo;
}
function getContactASI(cContact, asiName) {
	try {
		peopleModel = cContact.getPeople();
		peopleTemplate = peopleModel.getTemplate();
		if (peopleTemplate == null) return null;
		var templateGroups = peopleTemplate.getTemplateForms(); //ArrayList
		var gArray = new Array();
		if (!(templateGroups == null || templateGroups.size() == 0)) {
			thisGroup = templateGroups.get(0);
			var subGroups = templateGroups.get(0).getSubgroups();
			for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
				var subGroup = subGroups.get(subGroupIndex);
				var fArray = new Array();
				var fields = subGroup.getFields();
				for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
					var field = fields.get(fieldIndex);
					fArray[field.getDisplayFieldName()] = field.getDefaultValue();
					if(field.getDisplayFieldName().toString().toUpperCase()==asiName.toString().toUpperCase()) {
						return field.getChecklistComment();
					}
				}
			}
		}
	}
	catch (err) { logDebug(err);}
	return null;
}

function getContactName_BCC(vConObj) {
	if (vConObj.people.getContactTypeFlag() == "organization") {
		return vConObj.people.getBusinessName();
	}
	else {
		if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "") {
			return vConObj.people.getFullName();
		}
		else if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null) {
			return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
		}
	}
}
function getContactObj(itemCap,typeToLoad)
{
    // returning the first match on contact type
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "class com.accela.aa.aamain.cap.CapModel")   { // page flow script
        var capContactGroup = itemCap.getContactsGroup();
        if (capContactGroup) {
			capContactArray = capContactGroup.toArray();
			}
        }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (capContactArray[yy].getPeople().contactType.toUpperCase().equals(typeToLoad.toUpperCase())) {
                logDebug("getContactObj returned the first contact of type " + typeToLoad);
                return new contactObj(capContactArray[yy]);
            }
        }
    }

    logDebug("getContactObj could not find a contact of type " + typeToLoad);
    return false;

}
function getContactObjsByCap_BCC(itemCap) {
    // optional typeToLoad
    var typesToLoad = false;
    if (arguments.length == 2) {
		typesToLoad = arguments[1];
	}
    var capContactArray = null;
    var cArray = [];
    var yy = 0;

    var capContactResult = aa.people.getCapContactByCapID(itemCap);
    if (capContactResult.getSuccess()) {
        capContactArray = capContactResult.getOutput();
    }

    //aa.print("getContactObj returned " + capContactArray.length + " contactObj(s)");
    //aa.print("typesToLoad: " + typesToLoad);

    if (capContactArray) {
        for (yy in capContactArray) {
            //exclude inactive contacts
            if (capContactArray[yy].getPeople().getAuditStatus() == 'I') {
                continue;
            }
            if (!typesToLoad || capContactArray[yy].getPeople().contactType == typesToLoad) {
                cArray.push(new contactObj(capContactArray[yy]));
            }
        }
    }
    //logDebug("getContactObj returned " + cArray.length + " contactObj(s)");
    return cArray;
}
function getContactTypes_BCC() {
	var bizDomScriptResult = aa.bizDomain.getBizDomain('CONTACT TYPE');
	var vContactTypeArray = [];
	var i;

	if (bizDomScriptResult.getSuccess()) {
		bizDomScriptArray = bizDomScriptResult.getOutput().toArray();

		for (i in bizDomScriptArray) {
			if (bizDomScriptArray[i].getAuditStatus() != 'I') {
				vContactTypeArray.push(bizDomScriptArray[i].getBizdomainValue());
			}
		}
	}

	return vContactTypeArray;
}
function getCurrentEnvironment() {
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var firstPart = acaSite.substr(0, acaSite.indexOf(".accela.com"));
    var dotArray = firstPart.split(".");

    return dotArray[dotArray.length-1];
}
function getDenialAge(c) {

	var r = aa.workflow.getHistory(c);
	if (r.getSuccess()) {
		var wh = r.getOutput();
		for (var i in wh) {

		fTask = wh[i];
			var t = fTask.getTaskDescription();
			var s = fTask.getDisposition();
			var d = fTask.getStatusDate();
			if ((t.equals("Initial Review") || t.equals("Supervisory Review")) && s.equals("Denied")) {
				logDebug("Found a denial " + d);
				logDebug(new Date(d.getTime()));
				var today = new Date();
				today.setHours(0); today.setMinutes(0); today.setSeconds(0); today.setMilliseconds(0);
				return (new Date(today)-new Date(d.getTime()))/(1000*60*60*24);
				}
			}
	}
}

function getPartialCapID(vCapId) {
	if (vCapId == null || aa.util.instanceOfString(vCapId))
	{
		return null;
	}
	//1. Get original partial CAPID  from related CAP table.
	var result = aa.cap.getProjectByChildCapID(vCapId, "EST", null);
	if(result.getSuccess())
	{
		projectScriptModels = result.getOutput();
		if (projectScriptModels == null || projectScriptModels.length == 0)
		{
			logDebug("ERROR: Failed to get partial CAP with CAPID(" + vCapId + ")");
			return null;
		}
		//2. Get original partial CAP ID from project Model
		projectScriptModel = projectScriptModels[0];
		return projectScriptModel.getProjectID();
	}
	else
	{
		logDebug("ERROR: Failed to get partial CAP by child CAP(" + vCapId + "): " + result.getErrorMessage());
		return null;
	}
}

/*--------------------------------------------------------------------------------------------------------------------/
| Start ETW 12/3/14 getPeople3_0
/--------------------------------------------------------------------------------------------------------------------*/
function getPeople3_0(capId) {
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if (s_result.getSuccess()) {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr != null || capPeopleArr.length > 0) {
            for (loopk in capPeopleArr) {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess()) {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        }
        else {
            logDebug("WARNING: no People on this CAP:" + capId);
            capPeopleArr = null;
        }
    }
    else {
        logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;
    }
    return capPeopleArr;
}
/*--------------------------------------------------------------------------------------------------------------------/
| End ETW 12/3/14 getPeople3_0
/--------------------------------------------------------------------------------------------------------------------*/
function getProcessCode(vTaskName, vCapId) { // optional process name
	var useProcess = false;

	var processName = "";
	if (arguments.length == 5) {
		processName = arguments[4]; // process name
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(vCapId, vTaskName, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(vTaskName.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			return fTask.getProcessCode();
		}
	}
}

function getProcessID(vTaskName, vCapId) { // optional process name
	var useProcess = false;

	var processName = "";
	if (arguments.length == 5) {
		processName = arguments[4]; // process name
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(vCapId, vTaskName, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(vTaskName.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			return fTask.getProcessID();
		}
	}
}

function getRefAddContactList(peoId){
	var conAdd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
	conAdd.setEntityID(parseInt(peoId));
	conAdd.setEntityType("CONTACT");
	var addList =  aa.address.getContactAddressList(conAdd).getOutput();
	var tmpList = aa.util.newArrayList();
	var pri = true;
	for(x in addList){
		if(pri){
			pri=false;
			addList[x].getContactAddressModel().setPrimary("Y");
		}
		tmpList.add(addList[x].getContactAddressModel());
	}

	return tmpList;
}
function getRefASIACADisplayConfig(vASIGroup, vASISubgroup, vASIField) {
	var vASIList = aa.appSpecificInfo.getRefAppSpecInfoWithFieldList(vASIGroup,vASISubgroup,vASIField);
	var x = 0;
	var vASI;
	if (vASIList.getSuccess()) {
		vASIList = vASIList.getOutput().getFieldList().toArray();
		for (x in vASIList) {
			vASI = vASIList[x];
			if (vASI.getDispFieldLabel() == vASIField) {
				return vASI.getVchDispFlag();
			}
		}
	}
	return null;
}
function getRefASIReqFlag(vASIGroup, vASISubgroup, vASIField) {
	var vASIList = aa.appSpecificInfo.getRefAppSpecInfoWithFieldList(vASIGroup,vASISubgroup,vASIField);
	var x = 0;
	var vASI;
	if (vASIList.getSuccess()) {
		vASIList = vASIList.getOutput().getFieldList().toArray();
		for (x in vASIList) {
			vASI = vASIList[x];
			if (vASI.getDispFieldLabel() == vASIField) {
				return vASI.getRequiredFlag();
			}
		}
	}
	return null;
}

function getRefContactForPublicUser(userSeqNum) {
	contractorPeopleBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput();
	userList = aa.util.newArrayList();
	userList.add(userSeqNum);
	peopleList = contractorPeopleBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(), userList);
	if (peopleList != null) {
		peopleArray = peopleList.toArray();
		if (peopleArray.length > 0)
			return peopleArray[0];
	}
	return null;
}

function getRequiredDocuments(isPageFlow) {

	logDebug("start getRequiredDocuments(" + [].slice.call(arguments) + ")");

	//TODO: put in checks to validate record types and reference conditions.

	var capToUse = capId;
	if (isPageFlow) {
		capToUse = cap;
	}
	var requirementArray = [];

	/*------------------------------------------------------------------------------------------------------/
	| Load up Record Types : NEEDS REVIEW, map variables to record types
	/------------------------------------------------------------------------------------------------------*/
	var isMedical = appMatch("Licenses/Medical Cannabis/*/*");
	var isAdultUse = appMatch("Licenses/Adult Use Cannabis/*/*");
	var isCannabis = appMatch("Licenses/Cannabis/*/*"); // combined

	var isApplication = appMatch("Licenses/*/*/Application");
	var isAttestationAmendment = appMatch("Licenses/*/*/Incomplete Attestation");
	var isRenewal = appMatch("Licenses/*/*/Renewal");
	var isOwner = appMatch("Licenses/*/*/Owner Submittal");
	var isOwnerAttestation = appMatch("Licenses/Cannabis/Application Amendment/Incomplete Attestation");

	var isDispensary = appMatch("Licenses/*/Dispensary/*"); // No longer exists
	var isProducingDispensary = appMatch("Licenses/*/Producing Dispensary/*"); // No longer exists
	var isDistributor = appMatch("Licenses/*/Distributor/*");  // Type A11, M11
	var isTesting = appMatch("Licenses/*/Testing/*");  // Type 8
	var isTransporter = appMatch("Licenses/*/Transporter/*"); // No longer exists
	var isRetailer = appMatch("Licenses/*/Retailer/*"); // Type A10, M10
	var isRetailerNonStore = appMatch("Licenses/*/Retailer Nonstorefront/*");  // Type A9, M9
	var isMicroBusiness = appMatch("Licenses/*/Microbusiness/*");  // Type A12, M12
	var isDistribTransportOnly = appMatch("Licenses/*/Distributor-Transport Only/*");  // Type A13, M13
	var isDeficiency = appMatch("Licenses/*/*/Attestation Deficiency");


	/*------------------------------------------------------------------------------------------------------/
	| Load up Workflow Requirements :
	/------------------------------------------------------------------------------------------------------*/

	var wfStopAll = [{
			task: "Supervisory Review",
			status: "Approved"
		}, {
			task: "Supervisory Review",
			status: "Provisionally Approved"
		}, {
			task: "Supervisory Review",
			status: "Temporarily Approved"
		}
	];
	var wfStopPermanentOnly = [{
			task: "Supervisory Review",
			status: "Approved"
		}, {
			task: "Supervisory Review",
			status: "Provisionally Approved"
		}
	];
	/*------------------------------------------------------------------------------------------------------/
	| Load up Standard Conditions :
	/------------------------------------------------------------------------------------------------------*/
	var businessFormationDocuments = {
		condition: "Business Formation Documents",
		document: "Business Formation Documents",
		workflow: wfStopPermanentOnly
	}; // 5006(b)(15)
	var financialInformation = {
		condition: "Financial Information",
		document: "Financial Information",
		workflow: wfStopPermanentOnly
	}; // 5006(b)(18)
	var documentationOfLocalCompliance = {
		condition: "Documentation of Local Compliance",
		document: "Documentation of Local Compliance",
		workflow: wfStopAll
	}; // 5006(b)(23)
	var laborPeaceAgreement = {
		condition: "Labor Peace Agreement",
		document: "Labor Peace Agreement",
		workflow: wfStopPermanentOnly
	}; // 5006(b)(26)
	var documentForLaborPeace = {
		condition: "Document for Labor Peace Requirement",
		document: "Document for Labor Peace Requirement",
		workflow: wfStopPermanentOnly

	}; // user story 2213
	var waiverOfSovereignImmunity = {
		condition: "Waiver of Sovereign Immunity",
		document: "Waiver of Sovereign Immunity",
		workflow: wfStopPermanentOnly
	}; // 5006(b)(33)
	var evidenceOfLegalRightToOccupy = {
		condition: "Evidence of Legal Right to Occupy",
		document: "Evidence of Legal Right to Occupy",
		workflow: wfStopAll
	}; // 5006(b)(24)
	var proofOfSuretyBond = {
		condition: "Proof of Surety Bond",
		document: "Proof of Surety Bond",
		workflow: wfStopPermanentOnly
	}; // 5006(b)(28)
	var diagramOfPremises = {
		condition: "Diagram of Premises",
		document: "Diagram of Premises",
		workflow: wfStopAll
	}; // 5006(b)(28)
/* no longer used see story 2062
	var operatingProceduresDistrib = {
		condition: "Operating Procedures - Distribution",
		document: "Operating Procedures"
	}; // 5006(b)(30)
	var operatingProceduresTransport = {
		condition: "Operating Procedures - Transport",
		document: "Operating Procedures"
	}; // 5006(b)(31)
	var operatingProceduresDispense = {
		condition: "Operating Procedures - Dispensary",
		document: "Operating Procedures"
	}; // 5006(b)(32)
	var operatingProceduresMicro = {
		condition: "Operating Procedures - MicroBusiness",
		document: "Operating Procedures"
	}; // AUMA regs
	var operatingProceduresTesting = {
		condition: "Operating Procedures - Testing",
		document: "Operating Procedures"
	}; // 5292 (a)
*/
	var labEmployeeQualifications = {
		condition: "Laboratory Employee Qualifications",
		document: "Laboratory Employee Qualifications",
		workflow: wfStopPermanentOnly
	}; // 5238(b)
	var proofOfIsoAccreditationStatus = {
		condition: "Proof of ISO Accreditation Status",
		document: "Proof of ISO Accreditation Status",
		workflow: wfStopPermanentOnly
	}; // 5238(b)
	var submittedFingerPrintImages = {
		condition: "Submitted Application for Fingerprint Images",
		document: "Submitted Application for Fingerprint Images",
		workflow: wfStopPermanentOnly
	}; // 5238(b)
	var governmentIssuedIdentification = {
		condition: "Government-Issued Identification",
		document: "Government-Issued Identification",
		workflow: wfStopPermanentOnly
	}; // 5238(b)
	var descriptionOfConvictions = {
		condition: "Description of Convictions",
		document: "Description of Convictions",
		workflow: wfStopPermanentOnly
	}; // 5238(b)
	var proofOfMilitaryStatus = {
		condition: "Proof of Military Status",
		document: "Proof of Military Status",
		workflow: wfStopPermanentOnly
	}; // 5006(b)(4)
	var priorityProcessingRequest = {
		condition: "Priority Processing Request",
		document: "Priority Processing Request",
		workflow: wfStopPermanentOnly
	};
	var proofOfInsurance = {
		condition: "Proof of Commercial General Liability Insurance",
		document: "Proof of Commercial General Liability Insurance",
		workflow: wfStopPermanentOnly
	};
	var evidencePremiseLessThan600ft = {
		condition: "Evidence of Premise Less Than 600ft Compliance",
		document: "Evidence of Premise Less Than 600ft Compliance",
		workflow: wfStopPermanentOnly
	};

	var transportationProcess = {
		condition: "Transportation Process",
		document: "Transportation Process",
		workflow: wfStopPermanentOnly
	};
	var inventoryProcedures = {
		condition: "Inventory Procedures",
		document: "Inventory Procedures",
		workflow: wfStopPermanentOnly
	};
	var qualityControlProcedures = {
		condition: "Quality Control Procedures",
		document: "Quality Control Procedures",
		workflow: wfStopPermanentOnly
	};
	var securityProtocols = {
		condition: "Security Protocols",
		document: "Security Protocols",
		workflow: wfStopPermanentOnly
	};
	var standardOperatingProcedures = {
		condition: "Standard Operating Procedures",
		document: "Standard Operating Procedures",
		workflow: wfStopPermanentOnly
	};
	/*
	// removed user story 2229
	var chainOfCustodyProtocol = { condition: "Chain of Custody Protocol",document: "Chain of Custody Protocol"	};
	var labAnalysesStandard = {condition: "Laboratory Analyses Standard",document: "Laboratory Analyses Standard"	};
	var testingMethods = { condition: "Testing Methods",document: "Testing Methods"	};
	*/

	/*------------------------------------------------------------------------------------------------------/
	| Load up Conditionals from Record
	/------------------------------------------------------------------------------------------------------*/
	var isLargeEmployer = isASITrue(AInfo["20 or more employees?"]); // see user story 5135
	var isWaivingSovereignImmunity = isASITrue(AInfo["Are they Sovereign Entity"]); // see user story 5135, 1890
	var isPriorityRequest = isASITrue(AInfo["Are you requesting priority processing?"]); // see user story 340
	var isTemporaryRequest = isASITrue(AInfo["Are you requesting a temporary license?"]); // see user story 340
	var isLessThan600ft = isASITrue(AInfo["Attest no prohibited location Within specified requirement"]); //se user story 2203
	var needsLaborPeaceAgreement = isASITrue(AInfo["Attest they will abide to the Labor Peace Agreement"]); //see story 2213
	var hasDistributorTransportOnlyActivity = isASITrue(AInfo["Distributor-Transport Only"]); // see user story 2079
	var hasDistributorActivity = isASITrue(AInfo["Distributor"]); // see user story 2079
	var hasIsoLicense = isASITrue(AInfo["Accreditation/Provisional Testing Laboratory License"]); // see user story


	var isCriminal = false;
	var isSoleOwner = false;
	isMilitary = isASITrue(AInfo["Military Service"]);

	var ownerApplicant = getContactObj(capToUse, "Owner Applicant");
	if (ownerApplicant && ownerApplicant.asi) {
		isCriminal = isASITrue(ownerApplicant.asi["Criminal Convictions"]);
	}

	var businessOwner = getContactObj(capToUse, "Business Owner");
	if (businessOwner && businessOwner.asi) {
		isCriminal = isASITrue(businessOwner.asi["Criminal Convictions"]);

	}

	var business = getContactObj(capToUse, "Business");
	if (business && business.asi) {
		isSoleOwner = business.asi["5006(b)(14) Business Organization Structure"] == "Sole Proprietorship";
	}

	/*------------------------------------------------------------------------------------------------------/
	| Business Rules : NEEDS REVIEW, map variables to standard condition
	/------------------------------------------------------------------------------------------------------*/
	if (isOwner || isOwnerAttestation) {
		// removed requirement 5/24 after sprint story acceptance per Connie
		//requirementArray.push(submittedFingerPrintImages);
		requirementArray.push(governmentIssuedIdentification);

		if (isCriminal) {
			// Removed doc requirement per Connie 5/24 sprint acceptance meeting
			// requirementArray.push(descriptionOfConvictions);
		}
	}

	if (isOwner) {
		if (isMilitary) {
			requirementArray.push(proofOfMilitaryStatus);
		}
	}

	if ((isApplication || isAttestationAmendment) && !isOwnerAttestation) {
		// exclude items not needed for temp applications as submitted in ACA
		if (isPageFlow && isTemporaryRequest) {
			//requirementArray.push(documentationOfLocalCompliance);
			requirementArray.push(evidenceOfLegalRightToOccupy);
			requirementArray.push(diagramOfPremises);
		} else {
			//requirementArray.push(documentationOfLocalCompliance); only required for temp
			requirementArray.push(evidenceOfLegalRightToOccupy);
			requirementArray.push(diagramOfPremises);
			requirementArray.push(proofOfSuretyBond); //not needed for temp
			requirementArray.push(financialInformation); //not needed for temp
		}

		if (isPriorityRequest) {
			requirementArray.push(priorityProcessingRequest);
		}

		//if (isTemporaryRequest) {
		//	requirementArray.push(temporaryLicenseRequest);
		//}

		if (!isTemporaryRequest) {
			requirementArray.push(businessFormationDocuments);

			if (isLargeEmployer) {
				if (needsLaborPeaceAgreement) {
					requirementArray.push(laborPeaceAgreement);
				} else	{
					requirementArray.push(documentForLaborPeace);
				}
			}
		}

		if (isWaivingSovereignImmunity) {
			requirementArray.push(waiverOfSovereignImmunity);
		}

		if (isLessThan600ft) {
			requirementArray.push(evidencePremiseLessThan600ft);
		}

		if (hasIsoLicense) {
			requirementArray.push(proofOfIsoAccreditationStatus)
		}

		if (isDistributor || isRetailer || isRetailerNonStore || isMicroBusiness || isDistribTransportOnly) {
			// exclude items not needed for temp applications as submitted in ACA
			if (isPageFlow && isTemporaryRequest) {
				//nothing to do here
			} else {
				// user story 2062
				requirementArray.push(transportationProcess);
				requirementArray.push(inventoryProcedures);
				requirementArray.push(qualityControlProcedures);
				requirementArray.push(securityProtocols);			}
		}

		if (isTesting) {
			// exclude items not needed for temp applications as submitted in ACA
			if (isTemporaryRequest) {
				//nothing to do here
			} else {
				//requirementArray.push(operatingProceduresTesting);
				//removed in user story 1604
				//requirementArray.push(labEmployeeQualifications);
				// user story 2062

				requirementArray.push(standardOperatingProcedures);

				/*
				// removed in user story 2229
				requirementArray.push(labAnalysesStandard);
				requirementArray.push(chainOfCustodyProtocol);
				requirementArray.push(testingMethods);
        requirementArray.push(proofOfIsoAccreditationStatus);
				*/
				}
		}

		if (isDistributor || isDistribTransportOnly || (isMicroBusiness && (hasDistributorActivity || hasDistributorTransportOnlyActivity))) {
				// exclude items not needed for temp applications as submitted in ACA
			if (isPageFlow && isTemporaryRequest) {
				//nothing to do here
			} else {
				//use story 2079
				requirementArray.push(proofOfInsurance);
			}
	}

	}
	logDebug("Num of Req Docs:" + requirementArray.length + " docs.");
	logDebug("All req docs: " + requirementArray);

	return requirementArray;
}

function getRequiredDocumentsFromCOA() {

	logDebug("start getRequiredDocumentsFromCOA(" + [].slice.call(arguments) + ")");

	//TODO: put in checks to validate record types and reference conditions.

	var requirementArray = [];
	var parentCapId;
	parentCapIdString = "" + cap.getParentCapID();
	if (parentCapIdString) {
		pca = parentCapIdString.split("-");
		parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
	}

	if (parentCapId) {  // should always be true for amendment
	var c = aa.capCondition.getCapConditions(parentCapId).getOutput();
	for (var i in c) {
		var coa = c[i];
		if ("Y".equals(coa.getConditionOfApproval())) {
			var cm = coa.getCapConditionModel();
			if("Incomplete".equals(cm.getConditionStatus())) {  // only prompt for COA marked Incomplete
				var req = {};
				req.condition = cm.getConditionDescription();
				// call this a bad doc.  Even if it's uploaded, we will ask again since the COA is incomplete.
				req.document = "Bad Doc " + cm.getConditionDescription();
				requirementArray.push(req);
				}
			}
		}
	}

	logDebug("Num of Req Docs:" + requirementArray.length + " docs.");
	logDebug("All req docs: " + requirementArray);

	return requirementArray;
}

function getSubProcessCode(vStepNumber, vParentProcessID) {
	var relationResult = aa.workflow.getProcessRelationByPK(capId, vStepNumber, vParentProcessID, systemUserObj);
	var relObj;
	var fTask;
	var fRel;

	var subTask;
	var substepnumber;
	var subprocessCode;
	var subwftask;
	var subwfnote = " ";
	var subTaskResult;
	var subTaskObj;
	var k = 0;

	if (relationResult.getSuccess()) {
		relObj = relationResult.getOutput();
		return relObj.getProcessCode();
	} else {
		logMessage("**ERROR: Failed to get workflow process relation object: " + relationResult.getErrorMessage());
		return false;
	}
}
function getSubProcessID(vStepNumber, vParentProcessID) {
	var relationResult = aa.workflow.getProcessRelationByPK(capId, vStepNumber, vParentProcessID, systemUserObj);
	var relObj;
	var fTask;
	var fRel;

	var subTask;
	var substepnumber;
	var subprocessCode;
	var subwftask;
	var subwfnote = " ";
	var subTaskResult;
	var subTaskObj;
	var k = 0;

	if (relationResult.getSuccess()) {
		relObj = relationResult.getOutput();
		return relObj.getProcessID();
	} else {
		logMessage("**ERROR: Failed to get workflow process relation object: " + relationResult.getErrorMessage());
		return false;
	}
}
function getTaskActionBy(wfstr) // optional process name.
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var taskItem = fTask.getTaskItem();
			var vStaffUser = aa.cap.getStaffByUser(taskItem.getSysUser().getFirstName(),taskItem.getSysUser().getMiddleName(),taskItem.getSysUser().getLastName(),taskItem.getSysUser().toString()).getOutput();
			return vStaffUser.getUserID();
		}
	}
}
function getTaskAssignedStaff(wfstr) // optional process name.
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var vStaffUser = aa.cap.getStaffByUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName(),fTask.getAssignedStaff().toString()).getOutput();
			if (vStaffUser != null) {
				return vStaffUser.getUserID();
			}
		}
	}
	return false;
}

function getTaskSpecific(wfName,itemName) {  // optional: itemCap
                var i=0;
                var itemCap = capId;
                if (arguments.length == 4) itemCap = arguments[3]; // use cap ID specified in args

                //
               // Get the workflows
               //
               var workflowResult = aa.workflow.getTasks(itemCap);
               if (workflowResult.getSuccess())
                               var wfObj = workflowResult.getOutput();
               else
                               { logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

               //
               // Loop through workflow tasks
               //
               for (i in wfObj) {
                               var fTask = wfObj[i];
                               var stepnumber = fTask.getStepNumber();
                               var processID = fTask.getProcessID();
                               if (wfName.equals(fTask.getTaskDescription())) { // Found the right Workflow Task
                                               var TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
                                               if (TSIResult.getSuccess()) {
                                                               var TSI = TSIResult.getOutput();
                                                                if (TSI != null) {
                                                                                var TSIArray = new Array();
                                                                                var TSInfoModel = TSI.getTaskSpecificInfoModel();
                                                                                var itemValue = TSInfoModel.getChecklistComment();
                                                                                return itemValue;
                                                                }
                                                                else {
                                                                                logDebug("No task specific info field called "+itemName+" found for task "+wfName);
                                                                                return false;
                                                                }
                                               }
                                               else {
                                                               logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
                                                               return false;
                                               }
                               }  // found workflow task
                } // each task
        return false;
}

function getTaskStepNumber(vProcess, vTask, vCapId) {
	var workflowResult = aa.workflow.getTaskItems(vCapId, vTask, vProcess, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	var i = 0;
	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(vTask.toUpperCase()) && fTask.getProcessCode().equals(vProcess)) {
			return fTask.getStepNumber();
		}
	}
}
function handleError(err,context) {
	var rollBack = true;
	var showError = true;

	if (showError) showDebug = true;
	logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);

	// Log to Slack Channel in ETechConsultingLLC.slack.com BCC_EMSE_Debug

	var headers=aa.util.newHashMap();

    headers.put("Content-Type","application/json");

    var body = {};
	body.text = err.message + " In " + context + " Line " + err.lineNumber + "Stack: " + err.stack;
	body.attachments = [{"fallback": "Full Debug Output"}];
	body.attachments[0].text = debug;

    var apiURL = "https://hooks.slack.com/services/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";


    var result = aa.httpClient.post(apiURL, headers, JSON.stringify(body));
    if (!result.getSuccess()) {
        logDebug("Slack get anonymous token error: " + result.getErrorMessage());
	} else {
		aa.print("Slack Results: " + result.getOutput());
        }
  	}

function hideAppSpecific4ACA(vASIField) {
	// uses capModel in this event
	var capASI = cap.getAppSpecificInfoGroups();
	if (!capASI) {
		logDebug("No ASI for the CapModel");
	} else {
		var i = cap.getAppSpecificInfoGroups().iterator();
		while (i.hasNext()) {
			var group = i.next();
			var fields = group.getFields();
			if (fields != null) {
				var iteFields = fields.iterator();
				while (iteFields.hasNext()) {
					var field = iteFields.next();
					if (field.getCheckboxDesc() == vASIField) {
						field.setAttributeValueReqFlag('N');
						field.setVchDispFlag('H');
						logDebug("Updated ASI: " + field.getCheckboxDesc() + " to be ACA not displayable.");
					}
				}
			}
		}
	}
}
/*------------------------------------------------------------------------------------------------------/
| Program : initiateCatPut.js
| Event   : N/A
|
| Usage   : Initiates PUT to the CAT Licensing API
| By: John Towell
|
| Notes   : Houses all functions for communicating with the CAT Licensing API.
| Converts to JSON then Initiates Apache Common Http Client.  Currently only supports
| PUT as per CAT Idempotence Requirement.  This interface is one directional with Accela
| as the system of record.
|
| Dependencies : licenseNumberToCatJson.js
/------------------------------------------------------------------------------------------------------*/

function initiateCatPut(licenseNumStrings, url, key) {
    logDebug("license number strings: " + licenseNumStrings);
    var result = {
        totalCount : licenseNumStrings.length,
        activeCount : 0,
        inactiveCount: 0,
        errorRecordCount: 0,
        errorRecords: [],
        errors: [],
        resultCode: null,
        resultBody: null
    };
    var dataJsonArray = [];

    for (var i = 0, len = licenseNumStrings.length; i < len; i++) {
        try {
            var jsonData = licenseNumberToCatJson(licenseNumStrings[i]);
            if (jsonData["LicenseStatus"] === 'Active') {
                result.activeCount++;
            } else {
                result.inactiveCount++;
            }
            dataJsonArray.push(jsonData);
        } catch (err) {
            aa.print(err.stack);
            result.errorRecordCount++;
            var errorMessage = 'Error processing licenseNum ' + licenseNumStrings[i] + ' ' + err;
            result.errors.push(errorMessage);
            result.errorRecords.push(licenseNumStrings[i]);
            logDebug(errorMessage);
        }
    }

    ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
    var nData = {
        "Key": key,
        "Data": dataJsonArray
    };
    logDebug(JSON.stringify(nData, null, 4));
    var nDataJson = JSON.stringify(nData);

    var postResp = httpClientPut(url, nDataJson, 'application/json', 'utf-8');

    //if success, write out the response code and message. Otherwise, get the error message
    logDebug("//------------ begin JSON results -------------//");

    var response = postResp.getOutput();
    logDebug("Response code: " + response.resultCode);

    if (postResp.getSuccess()) {
        logDebug("Response message: " + response.result);
        exploreObject(response);
        result.resultCode = response.resultCode;
        result.resultBody = String(response.result);
        return new com.accela.aa.emse.dom.ScriptResult(true, null, null, result);
    } else {
        logDebug("Error message: " + postResp.getErrorMessage());
        return postResp;
    }
    logDebug("//------------ end JSON results -------------//");

    /**
     * ======================= PRIVATE FUNCTIONS ===========================
     *
     * Nested functions to reduce global namespace pollution
     */

    /**
     * Builds an Apache 3.1 Http client and submits the contents to the external service.
     *
     * @param {any} url  - The endpoint URL
     * @param {any} jsonString - The content string to be posted
     * @param {any} contentType - Optional. If undefined or empty, default to application/json
     * @param {any} encoding - Optional. If undefined or empty, default to utf-8
     * @returns ScriptResult object with status flag, error type, error message, and output
     */
    function httpClientPut(url, jsonString, contentType, encoding) {
        //content type and encoding are optional; if not sent default values
        contentType = (typeof contentType != 'undefined') ? contentType : "application/json";
        encoding = (typeof encoding != 'undefined') ? encoding : "utf-8";

        //build the http client, request content, and post method from the apache classes
        var httpClientClass = org.apache.commons.httpclient;
        var httpMethodParamsClass = org.apache.commons.params.HttpMethodParams;
        var httpClient = new httpClientClass.HttpClient();
        var putMethod = new httpClientClass.methods.PutMethod(url);

        httpClient.getParams().setParameter(httpMethodParamsClass.RETRY_HANDLER, new httpClientClass.DefaultHttpMethodRetryHandler());
        putMethod.addRequestHeader("Content-Type", contentType);
        putMethod.addRequestHeader("Content-Length", jsonString.length);

        var requestEntity = new httpClientClass.methods.StringRequestEntity(jsonString, contentType, encoding);
        putMethod.setRequestEntity(requestEntity);

        //set variables to catch and logic on response success and error type. build a result object for the data returned
        var resp_success = true;
        var resp_errorType = null;

        var resultObj = {
            resultCode: 999,
            result: null
        };

        try {
            resultObj.resultCode = httpClient.executeMethod(putMethod);
            resultObj.result = putMethod.getResponseBodyAsString();
        } finally {
            putMethod.releaseConnection();
        }

        //if any response other than transaction success, set success to false and catch the error type string
        if (resultObj.resultCode.toString().substr(0, 1) !== '2') {
            resp_success = false;
            resp_errorType = httpStatusCodeMessage(resultObj.resultCode);
        }

        //create script result object with status flag, error type, error message, and output and return
        var scriptResult = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);

        return scriptResult;
    }

    /**
     * returns the object methods and properties
     *
     * @param {any} objExplore
     */
    function exploreObject(objExplore) {
        logDebug("Methods:");
        for (var x in objExplore) {
            if (typeof (objExplore[x]) == "function") {
                logDebug("   " + objExplore[x]);
            }
        }
        logDebug("");
        logDebug("Properties:");
        for (x in objExplore) {
            if (typeof (objExplore[x]) != "function") {
                logDebug("  <b> " + x + ": </b> " + objExplore[x]);
            }
        }
    }

    /**
     * Takes a status code and returns the standard HTTP status code string
     *
     * @param {any} statusCode
     * @returns string of HTTP status code
     */
    function httpStatusCodeMessage(statusCode) {
        switch (statusCode) {
            case 100:
                return "100 - Continue";
            case 101:
                return "101 - Switching Protocols";
            case 200:
                return "200 - OK, Tranmission Accepted";
            case 201:
                return "201 - Created";
            case 202:
                return "202 - Accepted";
            case 203:
                return "203 - Non-Authoritative Information";
            case 204:
                return "204 - No Content";
            case 205:
                return "205 - Reset Content";
            case 206:
                return "206 - Partial Content";
            case 300:
                return "300 - Multiple Choices";
            case 301:
                return "301 - Moved Permanently";
            case 302:
                return "302 - Found";
            case 303:
                return "303 - See Other";
            case 304:
                return "304 - Not Modified";
            case 305:
                return "305 - Use Proxy";
            case 306:
                return "306 - (Unused)";
            case 307:
                return "307 - Temporary Redirect";
            case 400:
                return "400 - Bad Request";
            case 401:
                return "401 - Unauthorized";
            case 402:
                return "402 - Payment Required";
            case 403:
                return "403 - Forbidden";
            case 404:
                return "404 - Not Found";
            case 405:
                return "405 - Method Not Allowed";
            case 406:
                return "406 - Not Acceptable";
            case 407:
                return "407 - Proxy Authentication Required";
            case 408:
                return "408 - Request Timeout";
            case 409:
                return "409 - Conflict";
            case 410:
                return "410 - Gone";
            case 411:
                return "411 - Length Required";
            case 412:
                return "412 - Precondition Failed";
            case 413:
                return "413 - Request Entity Too Large";
            case 414:
                return "414 - Request-URI Too Long";
            case 415:
                return "415 - Unsupported Media Type";
            case 416:
                return "416 - Requested Range Not Satisfiable";
            case 417:
                return "417 - Expectation Failed";
            case 500:
                return "500 - Internal Server Error";
            case 501:
                return "501 - Not Implemented";
            case 502:
                return "502 - Bad Gateway";
            case 503:
                return "503 - Service Unavailable";
            case 504:
                return "504 - Gateway Timeout";
            case 505:
                return "505 - HTTP Version Not Supported";
        }
        return statusCode + " - Unknown Status Code";
    }
}

function invoiceFeeAllNew(itemCap) {
	//invoices all assessed fees with a status of NEW
	var vFeeSeqList = [];
	var vPaymentPeriodList = [];
	var vFeeList;
	var vGetFeeResult = new Array();
	var vFeeNum;
	var vFeeSeq;
	var vFperiod
	vGetFeeResult = aa.fee.getFeeItems(itemCap);
	if (vGetFeeResult.getSuccess()) {
		vFeeList = vGetFeeResult.getOutput();
		for (vFeeNum in vFeeList)
			if (vFeeList[vFeeNum].getFeeitemStatus().equals("NEW")) {
				vFeeSeq = vFeeList[vFeeNum].getFeeSeqNbr();
				vFperiod = vFeeList[vFeeNum].getPaymentPeriod();
				vFeeSeqList.push(vFeeSeq);
				vPaymentPeriodList.push(vFperiod);
			}
		vInvoiceResult = aa.finance.createInvoice(itemCap, vFeeSeqList, vPaymentPeriodList);
		if (vInvoiceResult.getSuccess())
			logDebug("Invoicing assessed fee items is successful.");
		else
			logDebug("**ERROR: Invoicing the fee items assessed to app # " + itemCap.getCustomID() + " was not successful.  Reason: " + vInvoiceResult.getErrorMessage());
	}
}
function isAmendment() {
	var result = aa.cap.getProjectByChildCapID(capId, "Amendment", null);
	if (result.getSuccess()) {
		projectScriptModels = result.getOutput();
		if (projectScriptModels != null && projectScriptModels.length > 0) {
			return true;
		} else {
			return false;
		}
	}
	return false;
}
function isASITrue(val) {
	var sVal = String(val).toUpperCase();
    return (sVal.substr(0,1).equals("Y") || sVal.equals("CHECKED"));
}
function isMatchAddress(addressScriptModel1, addressScriptModel2)
{
	if (addressScriptModel1 == null || addressScriptModel2 == null)
	{
		return false;
	}
	var streetName1 = addressScriptModel1.getStreetName();
	var streetName2 = addressScriptModel2.getStreetName();
	if ((streetName1 == null && streetName2 != null)
		|| (streetName1 != null && streetName2 == null))
	{
		return false;
	}
	if (streetName1 != null && !streetName1.equals(streetName2))
	{
		return false;
	}
	return true;
}
/*--------------------------------------------------------------------------------------------------------------------/
| Start ETW 12/3/14 isMatchPeople3_0
/--------------------------------------------------------------------------------------------------------------------*/
function isMatchPeople3_0(capContactScriptModel, capContactScriptModel2) {
    if (capContactScriptModel == null || capContactScriptModel2 == null) {
        return false;
    }

    var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
    var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
    var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
    var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
    var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
    var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
    var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
    var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();

    if ((contactType1 == null && contactType2 != null) || (contactType1 != null && contactType2 == null)) {
        return false;
    }

    if (contactType1 != null && !contactType1.equals(contactType2)) {
        return false;
    }

    if ((firstName1 == null && firstName2 != null) || (firstName1 != null && firstName2 == null)) {
        return false;
    }

    if (firstName1 != null && !firstName1.equals(firstName2)) {
        return false;
    }

    if ((lastName1 == null && lastName2 != null) || (lastName1 != null && lastName2 == null)) {
        return false;
    }

    if (lastName1 != null && !lastName1.equals(lastName2)) {
        return false;
    }

    if ((fullName1 == null && fullName2 != null) || (fullName1 != null && fullName2 == null)) {
        return false;
    }

    if (fullName1 != null && !fullName1.equals(fullName2)) {
        return false;
    }

    return true;
}
/*--------------------------------------------------------------------------------------------------------------------/
| End ETW 12/3/14 isMatchPeople3_0
/--------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Program : licenseNumberToCatJson.js
| Event   : N/A
|
| Usage   : Converts a license number into a CAT JSON object.
| By: John Towell
|
| Notes   : This file should contain all BCC specific code for gathering CAT data.
/------------------------------------------------------------------------------------------------------*/
function licenseNumberToCatJson(licenseNumber) {
    useAppSpecificGroupName = false;
    licenseNumber = '' + licenseNumber;
    capId = aa.cap.getCapID(licenseNumber).getOutput();
    var capScriptObj = aa.cap.getCap(capId);
    var capModel = (capScriptObj.getOutput()).getCapModel();
    var capSubType = '' + capModel.getCapType().getSubType();

    var legalBusinessName = '' + getAppName(capId);
    var licenseType = getLicenseType(licenseNumber, capSubType);
    var licenseStatus = getLicenseStatus('' + capModel.getCapStatus());
    var licenseValidityStart = '' + taskStatusDate('Active');
    var vLicenseObj = new licenseObject(null, capId);
    var licenseExpiration = '' + vLicenseObj.b1ExpDate;

    var vPrimary = getContactObj(capId, 'Primary Contact Person');
    var phone1 = null;
    var email = null;
    var firstName = null;
    var lastName = null;
    if(vPrimary) { //in case 'Primary Contact Person' doesn't exist. Shouldn't happen in production
        if(vPrimary.people.phone1) {
            phone1 = '' + vPrimary.people.phone1;
        }
        if(vPrimary.people.email) {
            email = '' + vPrimary.people.email;
        }
        if(vPrimary.people.firstName) {
            firstName = '' + vPrimary.people.firstName;
        }
        if(vPrimary.people.lastName) {
            lastName = '' + vPrimary.people.lastName;
        }
    }

    var vBusinesses = getContactObj(capId, 'Business');
    var phone2 = null;
    if(vBusinesses) { //in case 'Business' doesn't exist. Shouldn't happen in production
        if(vBusinesses.people.phone1) {
            phone2 = '' + vBusinesses.people.phone1;
        }
    }

    var addressModel = getAddressModel(capId);
    var premiseAddress = '' + addressModel.addressLine1;
    var premiseCity = '' + addressModel.city;
    var premiseState = '' + addressModel.state;
    var premiseZip = '' + addressModel.zip;
    var sellersPermitNumber = '' + getAppSpecific("Seller's Permit Number");

    ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
    var jsonResult = {
        "LicenseNumber": licenseNumber,
        "LicenseName": legalBusinessName,
        "LicenseType": licenseType,
        "LicenseSubtype": "N/A",
        "LicenseStatus": licenseStatus,
        "LicenseValidityStart": licenseValidityStart,
        "LicenseExpiration": licenseExpiration,
        "MobilePhoneNumber": phone1,
        "MainPhoneNumber": phone2,
        "MainEmail": email,
        "PhysicalAddress": {
            "Street1": premiseAddress,
            "Street2": null,
            "Street3": null,
            "Street4": null,
            "City": premiseCity,
            "County": null,
            "State": premiseState,
            "PostalCode": premiseZip
        },
        "ManagerFirstName": firstName,
        "ManagerMiddleName": null,
        "ManagerLastName": lastName,
        "AssessorParcelNumber" : "N/A",
        "SellersPermitNumber" : sellersPermitNumber
    };

    return jsonResult;

    /**
     * ======================= PRIVATE FUNCTIONS ===========================
     *
     * Nested functions to reduce global namespace pollution
     */

    /**
     * Returns the CAT license status based on this license status
     */
    function getLicenseStatus(licenseStatus) {
        if(licenseStatus == 'Active') { //using "evil twins" because === doesn't work in this environment, sorry Douglas
            return 'Active';
        } else  {
            return 'Inactive';
        }
    }

    /**
     * Returns the CAT license type based on license number and license Type
     */
    function getLicenseType(licenseNumber, subType) {
        var licenseType = licenseNumber.substring(0, licenseNumber.indexOf("-"));
        var firstChar = licenseNumber.substring(0, 1);
        var licenseDigits = licenseType.substring(1, licenseType.length);
        if (firstChar === 'C') {
            return 'Type '+licenseDigits + ' ' + subType;
        } else {
            return firstChar + '-Type ' + licenseDigits + ' ' + subType;
        }
    }

    /**
     * Returns the 'Business' contact 'Premise' address model. It assumes there is only one.
     */
    function getAddressModel(capId) {
        var vBusinesses = getContactObjsByCap_BCC(capId, 'Business');

        if (vBusinesses) {
            // Assume only one business contact
            vBusiness = vBusinesses[0];
            vAddresses = vBusiness.addresses;
            if (vAddresses) {
                x = 0;
                for (x in vAddresses) {
                    vAddress = vAddresses[x];
                    // Use only the Premise address type - assumes only one
                    if (vAddress.getAddressType() == "Premise") { //using "evil twins" because === doesn't work in this environment, sorry Douglas
                        return vAddress;
                    }
                }
            }
        }
    }
}


function loadASITable4ACA(tname, cap) {
	var gm = cap.getAppSpecificTableGroupModel()
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      	  if (!tn.equals(tname)) continue;
	  if (tsm.rowIndex.isEmpty()) {
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;

		}
		tempArray.push(tempObject);  // end of record
	  }
	  return tempArray;
	}

function recordHasNoAppliedConditionInType(pConditionType) {
	var appliedStatuses = ["Incomplete","Applied"];
	var condResult = aa.capCondition.getCapConditions(capId);

	//Convert to Uppercase for compare
	pConditionType = pConditionType.toUpperCase();

	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else {
		logMessage("**ERROR: getting record conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting record conditions: " + condResult.getErrorMessage());
		return false;
	}

	for (cc in capConds) {
		var thisCond = capConds[cc];

		var conditionStatusType = "" + thisCond.getConditionStatus(); //"Applied" or "Not Applied"
		var ConditionType = thisCond.getConditionType().toUpperCase(); //Condition Group to compare the parameter to

		logDebug(ConditionType)
		logDebug(conditionStatusType);

		if (pConditionType == ConditionType && exists(conditionStatusType,appliedStatuses)) {
			logDebug("A Condition with Type " + pConditionType + " was found in the Status type of " + conditionStatusType + ". Return False.");
			return false;
		}
	}

	//Default, return true if no Applied conditions found for group
	logDebug("A Condition with Type " + pConditionType + " was NOT found in the Status type of " + conditionStatusType + ". Return True.");
	return true;
}
function replaceASITable4ACAPageFlow(destinationTableGroupModel, tableName, tableValueArray) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	//

	var itemCap = capId
		if (arguments.length > 3)
			itemCap = arguments[3]; // use cap ID specified in args

		var ta = destinationTableGroupModel.getTablesMap().values();
	var tai = ta.iterator();

	var found = false;
	while (tai.hasNext()) {
		var tsm = tai.next(); // com.accela.aa.aamain.appspectable.AppSpecificTableModel
		if (tsm.getTableName().equals(tableName)) {
			found = true;
			break;
		}
	}

	if (!found) {
		logDebug("cannot update asit for ACA, no matching table name");
		return false;
	}

	var i = -1; // row index counter
	if (tsm.getTableFields() != null) {
		i = 0 - tsm.getTableFields().size()
	}

	for (thisrow in tableValueArray) {
		var fld = aa.util.newArrayList(); // had to do this since it was coming up null.
		var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();

			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue ? tableValueArray[thisrow][colname.getColumnName()].fieldValue : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);

			} else // we are passed a string
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()] ? tableValueArray[thisrow][colname.getColumnName()] : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");

			}
		}

		i--;

		if (tsm.getTableFields() == null) {
			tsm.setTableFields(fld);
		} else {
			if (thisrow == 0)
				tsm.setTableFields(fld);
			else
				tsm.getTableFields().addAll(fld);
		}

		if (tsm.getReadonlyField() == null) {
			tsm.setReadonlyField(fld_readonly); // set readonly field
		} else {
			if (thisrow == 0)
				tsm.setReadonlyField(fld_readonly);
			else
				tsm.getReadonlyField().addAll(fld_readonly);
		}
	} // end for loop

	tssm = tsm;
	return destinationTableGroupModel;
}

function resetAppSpecific4ACA(vASIField) {
	// uses capModel in this event
	var capASI = cap.getAppSpecificInfoGroups();
	if (!capASI) {
		logDebug("No ASI for the CapModel");
	} else {
		var i = cap.getAppSpecificInfoGroups().iterator();
		while (i.hasNext()) {
			var group = i.next();
			var fields = group.getFields();
			if (fields != null) {
				var iteFields = fields.iterator();
				while (iteFields.hasNext()) {
					var field = iteFields.next();
					if (field.getCheckboxDesc() == vASIField) {
						//get reference ASI configuration
						var vDisp = getRefASIACADisplayConfig(field.getGroupCode(), field.getCheckboxType(), field.getCheckboxDesc());
						if (vDisp != null) {
							field.setVchDispFlag(vDisp);
						}
						var vReq = getRefASIReqFlag(field.getGroupCode(), field.getCheckboxType(), field.getCheckboxDesc());
						if (vReq != null) {
							field.setAttributeValueReqFlag(vReq);
						}
						logDebug("Reset ASI: " + field.getCheckboxDesc() + " to reference configuration for ACA display and required.");
					}
				}
			}
		}
	}
}
/**
 * results workflow task and sets the status and performs next step based on configured status
 * @param wfstr
 * @param wfstat
 * @param wfcomment
 * @param wfnote
 * @returns {Boolean}
 */
function resultWorkflowTask(wfstr, wfstat, wfcomment, wfnote) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) {
		processName = arguments[4]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var statObj = aa.workflow.getTaskStatus(fTask, wfstat);
			var dispo = "U";
			if (statObj.getSuccess()) {
				var status = statObj.getOutput();
				dispo = status.getResultAction();
			} else {
				logDebug("Could not get status action resulting to no change")
			}

			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, dispo);
			else
				aa.workflow.handleDisposition(capId, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, dispo);

			logMessage("Resulting Workflow Task: " + wfstr + " with status " + wfstat);
			logDebug("Resulting Workflow Task: " + wfstr + " with status " + wfstat);
		}
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| Start ETW 06/13/14 Custom functions for runWTUA
/--------------------------------------------------------------------------------------------------------------------*/
function runWTUAForWFTaskWFStatus(vTaskName, vProcessID, vStepNum, vStatus, vCapId) {
	/*---------------------------------------------------------------------------------------------------------/
	| Function Intent:
	|              This function is designed to run the WorkflowTaskUpdateAfter (WTUA) script actions.
	|              for the CapId provided.
	| Call Example:
	|              runWTUAForWFTaskWFStatus('PRMT_TRADE','Application Acceptance','Accepted',capId)
	|
	| 11/13/2013 - Ewylam
	|              Version 1 Created
	|
	| Required parameters in order:
	|              vTaskName = Name of task to run the event for. string
	|			   vProcessID = Workflow process that contains the task. string
	|			   vStepNum = Step number of the task to run the event for. number
	|              vStatus = Status to rqun the event for. string
	|              vCapId = CapId object
	|
	| Optional paramaters:
	|              None
	/----------------------------------------------------------------------------------------------------------*/

	//Set Variables
	//Save the existing system variables so that they can be reset after the function
	var pvScriptName = vScriptName;
	var pvEventName = vEventName;
	var pprefix = ((typeof prefix === 'undefined') ? null : prefix);
	var pcapId = capId;
	var pcap = cap;
	var pcapIDString = capIDString;
	var pappTypeResult = appTypeResult;
	var pappTypeString = appTypeString;
	var pappTypeArray = appTypeArray;
	var pcapName = capName;
	var pcapStatus = capStatus;
	var pfileDateObj = fileDateObj;
	var pfileDate = fileDate;
	var pfileDateYYYYMMDD = fileDateYYYYMMDD;
	var pparcelArea = parcelArea;
	var pestValue = estValue;
	var pbalanceDue = balanceDue;
	var phouseCount = houseCount;
	var pfeesInvoicedTotal = feesInvoicedTotal;
	var pcapDetail = capDetail;
	var pAInfo = AInfo;
	var ppartialCap;
	if (typeof(partialCap) !== "undefined") {
		ppartialCap = partialCap;
	} else {
		ppartialCap = null;
	}
	var pparentCapId;
	if (typeof(parentCapId) !== "undefined") {
		pparentCapId = parentCapId;
	} else {
		pparentCapId = null;
	}
	var pCreatedByACA;
	if (typeof(CreatedByACA) !== "undefined") {
		pCreatedByACA = CreatedByACA;
	} else {
		CreatedByACA = 'N';
	}

	//WTUA Specific variables.
	var pwfTask = ((typeof wfTask === 'undefined') ? null : wfTask);
	var pwfTaskObj = ((typeof wfTaskObj === 'undefined') ? null : wfTaskObj);
	var pwfStatus = ((typeof wfStatus === 'undefined') ? null : wfStatus);
	var pwfDate = ((typeof wfDate === 'undefined') ? null : wfDate);
	var pwfDateMMDDYYYY = ((typeof wfDateMMDDYYYY === 'undefined') ? null : wfDateMMDDYYYY);
	var pwfProcessID = ((typeof wfProcessID === 'undefined') ? null : wfProcessID);
	var pwfStep = ((typeof wfStep === 'undefined') ? null : wfStep);
	var pwfComment = ((typeof wfComment === 'undefined') ? null : wfComment);
	var pwfNote = ((typeof wfNote === 'undefined') ? null : wfNote);
	var pwfDue = ((typeof wfDue === 'undefined') ? null : wfDue);
	var pwfHours = ((typeof wfHours === 'undefined') ? null : wfHours);
	var pwfProcess = ((typeof wfProcess === 'undefined') ? null : wfProcess);
	var pwfObj = ((typeof wfObj === 'undefined') ? null : wfObj);
	var pwfStaffUserID = ((typeof wfStaffUserID === 'undefined') ? null : wfStaffUserID);
	var ptimeAccountingArray = ((typeof timeAccountingArray === 'undefined') ? null : timeAccountingArray);
	var pwfTimeBillable = ((typeof wfTimeBillable === 'undefined') ? null : wfTimeBillable);
	var pwfTimeOT = ((typeof wfTimeOT === 'undefined') ? null : wfTimeOT);
	var ptimeLogModel = ((typeof timeLogModel === 'undefined') ? null : timeLogModel);
	var ptimeLogSeq = ((typeof timeLogSeq === 'undefined') ? null : timeLogSeq);
	var pdateLogged = ((typeof dateLogged === 'undefined') ? null : dateLogged);
	var pstartTime = ((typeof startTime === 'undefined') ? null : startTime);
	var pendTime = ((typeof endTime === 'undefined') ? null : endTime);
	var ptimeElapsedHours = ((typeof timeElapsedHours === 'undefined') ? null : timeElapsedHours);
	var ptimeElapsedMin = ((typeof timeElapsedMin === 'undefined') ? null : timeElapsedMin);

	//Run simulate the WTUA event for the child record
	logDebug("***Begin WTUA Sim");

	vScriptName = "function: runWTUAForWFTaskWFStatus";
	vEventName = "WorkflowTaskUpdateAfter";

	prefix = 'WTUA';

	//Clear global variables so that they can be set with the supplied
	capId = null;
	cap = null;
	capIDString = "";
	appTypeResult = null;
	appTypeString = "";
	appTypeArray = new Array();
	capName = null;
	capStatus = null;
	fileDateObj = null;
	fileDate = null;
	fileDateYYYYMMDD = null;
	parcelArea = 0;
	estValue = 0;
	balanceDue = 0;
	houseCount = 0;
	feesInvoicedTotal = 0;
	capDetail = "";
	AInfo = new Array();
	partialCap = false;
	parentCapId = null;
	CreatedByACA = 'N';

	//Clear event specific variables;
	//wfTask = null;
	wfTaskObj = null;
	wfStatus = null;
	wfDate = null;
	wfDateMMDDYYYY = null;
	wfProcessID = null;
	wfStep = null;
	wfComment = null;
	wfNote = null;
	wfDue = null;
	wfHours = null;
	wfProcess = null;
	wfObj = null;
	wfStaffUserID = null;
	timeAccountingArray = null;
	wfTimeBillable = null;
	wfTimeOT = null;
	timeLogModel = null;
	timeLogSeq = null;
	dateLogged = null;
	startTime = null;
	endTime = null;
	timeElapsedHours = null;
	timeElapsedMin = null;

	//Set capId to the vCapId variable provided
	capId = vCapId;
	//Update global variables based on child capId
	if (capId !== null) {
		parentCapId = pcapId;
		servProvCode = capId.getServiceProviderCode();
		capIDString = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		if (appTypeArray[0].substr(0, 1) != "_") {
			var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput();
			if (currentUserGroupObj)
				currentUserGroup = currentUserGroupObj.getGroupName();
		}
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		partialCap = !cap.isCompleteCap();
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
		var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();
		if (valobj.length) {
			estValue = valobj[0].getEstimatedValue();
			calcValue = valobj[0].getCalculatedValue();
			feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
		}

		var capDetailObjResult = aa.cap.getCapDetail(capId);
		if (capDetailObjResult.getSuccess()) {
			capDetail = capDetailObjResult.getOutput();
			houseCount = capDetail.getHouseCount();
			feesInvoicedTotal = capDetail.getTotalFee();
			balanceDue = capDetail.getBalance();
		}
		loadAppSpecific(AInfo);
		loadTaskSpecific(AInfo);
		loadParcelAttributes(AInfo);
		loadASITables();

		CreatedByACA = 'N';

		logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
		logDebug("capId = " + capId.getClass());
		logDebug("cap = " + cap.getClass());
		logDebug("currentUserID = " + currentUserID);
		logDebug("currentUserGroup = " + currentUserGroup);
		logDebug("systemUserObj = " + systemUserObj.getClass());
		logDebug("appTypeString = " + appTypeString);
		logDebug("capName = " + capName);
		logDebug("capStatus = " + capStatus);
		logDebug("fileDate = " + fileDate);
		logDebug("fileDateYYYYMMDD = " + fileDateYYYYMMDD);
		logDebug("sysDate = " + sysDate.getClass());
		logDebug("parcelArea = " + parcelArea);
		logDebug("estValue = " + estValue);
		logDebug("calcValue = " + calcValue);
		logDebug("feeFactor = " + feeFactor);

		logDebug("houseCount = " + houseCount);
		logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
		logDebug("balanceDue = " + balanceDue);
	}

	//set WTUA specific variables
	wfTask = vTaskName; // Workflow Task Triggered event
	wfStatus = vStatus; // Status of workflow that triggered event
	wfDate = sysDate.getYear() + '-' + sysDate.getMonth() + '-' + sysDate.getDayOfMonth(); // date of status of workflow that triggered event
	wfDateMMDDYYYY = wfDate.substr(5, 2) + "/" + wfDate.substr(8, 2) + "/" + wfDate.substr(0, 4); // date of status of workflow that triggered event in format MM/DD/YYYY
	// Go get other task details
	wfObj = aa.workflow.getTasks(capId).getOutput();
	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription() == wfTask && fTask.getProcessID() == vProcessID && fTask.getStepNumber() == vStepNum) {
			wfStep = fTask.getStepNumber();
			wfProcess = fTask.getProcessCode();
			wfProcessID = fTask.getProcessID();
			wfComment = fTask.getDispositionComment();
			wfNote = fTask.getDispositionNote();
			wfDue = fTask.getDueDate();
			wfHours = fTask.getHoursSpent();
			wfTaskObj = fTask
		}
	}
	logDebug("wfTask = " + wfTask);
	logDebug("wfTaskObj = " + wfTaskObj.getClass());
	logDebug("wfStatus = " + wfStatus);
	logDebug("wfDate = " + wfDate);
	logDebug("wfDateMMDDYYYY = " + wfDateMMDDYYYY);
	logDebug("wfStep = " + wfStep);
	logDebug("wfComment = " + wfComment);
	logDebug("wfProcess = " + wfProcess);
	logDebug("wfProcessID = " + wfProcessID);
	logDebug("wfNote = " + wfNote);

	/* Added for version 1.7 */
	wfStaffUserID = aa.env.getValue("StaffUserID");
	timeAccountingArray = new Array()
		if (aa.env.getValue("TimeAccountingArray") != "") {
			timeAccountingArray = aa.env.getValue("TimeAccountingArray");
		}
		wfTimeBillable = aa.env.getValue("Billable");
	wfTimeOT = aa.env.getValue("Overtime");

	logDebug("wfStaffUserID = " + wfStaffUserID);
	logDebug("wfTimeBillable = " + wfTimeBillable);
	logDebug("wfTimeOT = " + wfTimeOT);
	logDebug("wfHours = " + wfHours);

	if (timeAccountingArray != null || timeAccountingArray != '') {
		for (var i = 0; i < timeAccountingArray.length; i++) {
			timeLogModel = timeAccountingArray[i];
			timeLogSeq = timeLogModel.getTimeLogSeq();
			dateLogged = timeLogModel.getDateLogged();
			startTime = timeLogModel.getStartTime();
			endTime = timeLogModel.getEndTime();
			timeElapsedHours = timeLogModel.getTimeElapsed().getHours();
			timeElapsedMin = timeLogModel.getTimeElapsed().getMinutes();

			logDebug("TAtimeLogSeq = " + timeLogSeq);
			logDebug("TAdateLogged = " + dateLogged);
			logDebug("TAstartTime = " + startTime);
			logDebug("TAendTime = " + endTime);
			logDebug("TAtimeElapsedHours = " + timeElapsedHours);
			logDebug("TAtimeElapsedMin = " + timeElapsedMin);
		}
	}
	//

	//Run WTUA scripts for the variables provided
	doScriptActions();

	//Reset global variables to the original records
	vScriptName = pvScriptName;
	vEventName = pvEventName;
	prefix = pprefix;
	capId = pcapId;
	cap = pcap;
	capIDString = pcapIDString;
	appTypeResult = pappTypeResult;
	appTypeString = pappTypeString;
	appTypeArray = pappTypeArray;
	capName = pcapName;
	capStatus = pcapStatus;
	fileDateObj = pfileDateObj;
	fileDate = pfileDate;
	fileDateYYYYMMDD = pfileDateYYYYMMDD;
	parcelArea = pparcelArea;
	estValue = pestValue;
	feesInvoicedTotal = pfeesInvoicedTotal;
	balanceDue = pbalanceDue;
	houseCount = phouseCount;
	feesInvoicedTotal = pfeesInvoicedTotal;
	capDetail = pcapDetail;
	AInfo = pAInfo;
	partialCap = ppartialCap;
	parentCapId = pparentCapId;
	CreatedByACA = pCreatedByACA;

	//Reset WTUA Specific variables.
	wfTask = pwfTask;
	wfTaskObj = pwfTaskObj;
	wfStatus = pwfStatus;
	wfDate = pwfDate;
	wfDateMMDDYYYY = pwfDateMMDDYYYY;
	wfProcessID = pwfProcessID;
	wfStep = pwfStep;
	wfComment = pwfComment;
	wfNote = pwfNote;
	wfDue = pwfDue;
	wfHours = pwfHours;
	wfProcess = pwfProcess;
	wfObj = pwfObj;
	wfStaffUserID = pwfStaffUserID;
	timeAccountingArray = ptimeAccountingArray;
	wfTimeBillable = pwfTimeBillable;
	wfTimeOT = pwfTimeOT;
	timeLogModel = ptimeLogModel;
	timeLogSeq = ptimeLogSeq;
	dateLogged = pdateLogged;
	startTime = pstartTime;
	endTime = pendTime;
	timeElapsedHours = ptimeElapsedHours;
	timeElapsedMin = ptimeElapsedMin;

	logDebug("***End WTUA Sim");

}
/*--------------------------------------------------------------------------------------------------------------------/
| End ETW 06/13/14 Custom functions for runWTUA
/--------------------------------------------------------------------------------------------------------------------*/

function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile) {
	// custom for BMCR
	logDebug("start sendNotification(" + [].slice.call(arguments) + ")");

	if (!SENDEMAILS) { logDebug("SENDEMAILS global is false, exiting without sending email") ; return false}

	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args

	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;

	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function setInitialWorkflowTaskStatus() {
	//use optional parameter #1 "Y" to re-execute WTUA event
	var executeWTUA = false;

	if (arguments.length == 1) {
		executeWTUA = true;
	}

	var vWF = aa.workflow.getTasks(capId);

	if (vWF.getSuccess()) {
		vWF = vWF.getOutput();
	} else {
		logDebug("Failed to get workflow tasks");
	}

	var vEnvTask = null;
	if (typeof(wfTask) !== "undefined") {
		vEnvTask = wfTask;
	}

	var vEnvStatus = null;
	if (typeof(wfStatus) !== "undefined") {
		vEnvStatus = wfStatus;
	}

	for (x in vWF) {
		var vTask = vWF[x];
		var vTaskItem = vTask.getTaskItem();
		var vTaskName = vTask.taskDescription;
		var vProcessID = vTask.getProcessID();
		var vProcessCode = vTask.getProcessCode();
		var vStepNum = vTask.getStepNumber();

		//logDebug("Here in setInitialWorkflowTaskStatus. Task Informaiton:");
		//logDebug("TaskActive: " + isTaskActive(vTaskName));
		//logDebug("TaskName: " + vTaskName);
		//logDebug("TaskDisposition: " + vTask.getDisposition());
		//logDebug("TaskDispositionDate: " + vTask.getDispositionDate());
		//logDebug("vEnvTask: " + vEnvTask);
		//logDebug("vEnvStatus: " + vEnvStatus);

		//When the task is active and it has as status (Disposition) but no status date (Disposition Date),
		//and is also not the environments task or status (when triggered by WTUA), then save the status with a date
		//by using the updateTask function.
		if (isTaskActive(vTaskName) == true && vTask.getDisposition() != null && vTask.getDisposition() != "" && vTask.getDispositionDate() == null
			 && (vEnvTask == null || vEnvTask != vTaskName) && (vEnvStatus == null || vEnvStatus != vTask.getDisposition())) {

			//logDebug("Here in setInitialWorkflowTaskStatus. Updating task with initial status");
			//logDebug("TaskActive: " + isTaskActive(vTaskName));
			//logDebug("TaskName: " + vTaskName);
			//logDebug("TaskDisposition: " + vTask.getDisposition());
			//logDebug("TaskDispositionDate: " + vTask.getDispositionDate());

			updateTask(vTaskName, vTask.getDisposition(), "Initial status updated via script", "Initial status updated via script", vProcessCode);

			//Execute Worfklow task scripts
			if (executeWTUA) {
				//logDebug("Calling WTUA in ASync for wfTask: " + vTask.taskDescription + " and wfStatus: " + vTask.getDisposition() + " for capId: " + capId);
				runWTUAForWFTaskWFStatus(vTaskName, vProcessID, vStepNum, vTask.getDisposition(), capId);
			}
		}
		//new code
		//When the task is active and it has as status (Disposition) but no status date (Disposition Date),
		//and IS the environments task or status (when triggered by WTUA), then save the status with a date
		if (isTaskActive(vTaskName) == true
			 && vTask.getDisposition() != null
			 && vTask.getDisposition() != ""
			 && vTask.getDispositionDate() == null
			 && vEnvTask == vTaskName
			 && vEnvStatus == vTask.getDisposition()) {
			//set the disposition date
			vTaskItem.setDispositionDate(new Date());
			var updateResult = aa.workflow.adjustTaskWithNoAudit(vTaskItem);
			if (updateResult.getSuccess()) {
				logDebug("Updated Workflow Task : " + vTaskName + " Disposition Date to " + aa.date.getCurrentDate());
			} else {
				logDebug("Error updating wfTask : " + updateResult.getErrorMessage());
			}
		}
		//end new code
	}
}

function slackDebug(msg) {

	var headers=aa.util.newHashMap();

    headers.put("Content-Type","application/json");

    var body = {};
	body.text = msg;
	//body.attachments = [{"fallback": "Full Debug Output"}];
	//body.attachments[0].text = debug;

    var apiURL = "https://hooks.slack.com/services/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";


    var result = aa.httpClient.post(apiURL, headers, JSON.stringify(body));
    if (!result.getSuccess()) {
        logDebug("Slack get anonymous token error: " + result.getErrorMessage());
	} else {
		aa.print("Slack Results: " + result.getOutput());
        }
  	}

function updateFeeByDate(feeCap, fdate, fcode, fsched, fperiod, fqty, finvoice, pDuplicate, pFeeSeq) {
	// Updates an assessed fee with a new Qty.  If not found, adds it; else if invoiced fee found, adds another with adjusted qty.
	// optional param pDuplicate -if "N", won't add another if invoiced fee exists (SR5085)
	// Script will return fee sequence number if new fee is added otherwise it will return null (SR5112)
	// Optional param pSeqNumber, Will attempt to update the specified Fee Sequence Number or Add new (SR5112)
	// 12/22/2008 - DQ - Correct Invoice loop to accumulate instead of reset each iteration

	// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
	if (pDuplicate == null || pDuplicate.length == 0)
		pDuplicate = "Y";
	else
		pDuplicate = pDuplicate.toUpperCase();

	var invFeeFound = false;
	var adjustedQty = fqty;
	var feeSeq = null;
	feeUpdated = false;

	if (pFeeSeq == null)
		getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
	else
		getFeeResult = aa.finance.getFeeItemByPK(capId, pFeeSeq);

	if (getFeeResult.getSuccess()) {
		if (pFeeSeq == null)
			var feeList = getFeeResult.getOutput();
		else {
			var feeList = new Array();
			feeList[0] = getFeeResult.getOutput();
		}
		for (feeNum in feeList) {
			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
				if (pDuplicate == "Y") {
					logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
					adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
					invFeeFound = true;
					feeSeq = feeList[feeNum].getFeeSeqNbr();
				} else {
					invFeeFound = true;
					logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
				}
			}

			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
			}
		}

		for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
			{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				var editResult = aa.finance.editFeeItemUnit(capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
				feeUpdated = true;
				if (editResult.getSuccess()) {
					logDebug("Updated Qty on Existing Fee Item" + "(" + feeSeq + "): " + fcode + " to Qty: " + fqty);
					if (finvoice == "Y") {
						feeSeqList.push(feeSeq);
						paymentPeriodList.push(fperiod);
					}
				} else {
					logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
					break
				}
			}
	} else {
		logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
	}

	// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
	if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y")) {
		feeSeq = addFeeByDate(feeCap, fdate, fcode, fsched, fperiod, adjustedQty, finvoice);
	}
	updateFeeItemInvoiceFlag(feeSeq, finvoice);
	return feeSeq;
}

function voidAllFees(capId) {
	var getFeeResult = aa.fee.getFeeItems(capId,null,"INVOICED");
	if (getFeeResult.getSuccess())
		{
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList)
			{
			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED"))
				{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();

				var editResult = aa.finance.voidFeeItem(capId, feeSeq);
				if (editResult.getSuccess())
				{
				   logDebug("Voided existing Fee Item: " + feeList[feeNum].getFeeCod());
				}
				else
				{ logDebug( "**ERROR: Voiding fee item (" + feeList[feeNum].getFeeCod() + "): " + editResult.getErrorMessage());
				  break;
 			    }
				//Invoice the void creating a "Credit"
				var cfeeSeqArray = new Array();
				   var paymentPeriodArray = new Array();
      			   cfeeSeqArray.push(feeSeq);
				   paymentPeriodArray.push(feeSeq.period);
			  	   var invoiceResult_L = aa.finance.createInvoice(capId, cfeeSeqArray, paymentPeriodArray);
 				   if (!invoiceResult_L.getSuccess())
				   {
					logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
					return false;
				    }

					break;  // done with this payment
				}

			if (feeList[feeNum].getFeeitemStatus().equals("VOIDED"))
				{
					var feeSeq = feeList[feeNum].getFeeSeqNbr();
					//Invoice the void creating a "Credit"
					var cfeeSeqArray = new Array();
					var paymentPeriodArray = new Array();
					cfeeSeqArray.push(feeSeq);
					paymentPeriodArray.push(feeSeq.period);
					var invoiceResult_L = aa.finance.createInvoice(capId, cfeeSeqArray, paymentPeriodArray);
					if (!invoiceResult_L.getSuccess())
					{
						logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
						return false;
				    }

					break;
				}


			if (feeList[feeNum].getFeeitemStatus().equals("CREDITED"))
				{
				logDebug("Credited fee "+feeList[feeNum].getFeeCod()+" found, not voided");
				}
			}
		}
	else
		{ logDebug( "**ERROR: getting fee items (" + feeList[feeNum].getFeeCod() + "): " + getFeeResult.getErrorMessage())}
	}

//FUNCTIONS ADDED BY TRUEPOINT/MHELVICK 06/12/2021

/*-----DEFINE AGENCY VARIABLES FOR DIGEPLAN SCRIPTS-----*/
var digEplanAPIUser = ["DIGEPLAN","EPC"];
var inReviewDocStatus = "In Review";
var interimDocStatus = "Comments Available";
var reviewCompleteDocStatus = "Review Complete";
var revisionsRequiredDocStatus = "Revision Required";
var docInternalCategory = "Internal";
var approvedDocStatus = "Approved";
var approvedPendingDocStatus = "Approved - Pending";
var approvedFinalDocStatus = "Review Complete";
var approvedIssuedDocStatus = "Approved";
/*------------------------------------------------------------------------------------------------------/
|  Notification Template Functions (Start)
/------------------------------------------------------------------------------------------------------*/

function generateReportSavetoEDMS(reportName,parameters,rModule)
{
	// Specific to SL
	var itemCap = capId;
	var capIdStr = String(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
	// var capIdStr = "";

    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();

    report.setModule(rModule);
    report.setCapId(capIdStr);

	  // specific to EGV
      report.setReportParameters(parameters);
      var ed1 = report.getEDMSEntityIdModel();
      ed1.setCapId(capIdStr);
      // Needed to determine which record the document is attached
      ed1.setAltId(itemCap.getCustomID());
      // Needed to determine which record the document is attached
      report.setEDMSEntityIdModel(ed1);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);

       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

 function getRecordParams4Notification(params) {
	itemCapId = (arguments.length == 2) ? arguments[1] : capId;
	// pass in a hashtable and it will add the additional parameters to the table
	var itemCapIDString = itemCapId.getCustomID();
	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	var itemCapName = itemCap.getSpecialText();
	var itemCapStatus = itemCap.getCapStatus();
	var itemFileDate = itemCap.getFileDate();
	var itemCapTypeAlias = itemCap.getCapType().getAlias();
	var itemHouseCount;
	var itemFeesInvoicedTotal;
	var itemBalanceDue;
	var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);
	if (itemCapDetailObjResult.getSuccess())
	{
		itemCapDetail = capDetailObjResult.getOutput();
		itemHouseCount = itemCapDetail.getHouseCount();
		itemFeesInvoicedTotal = itemCapDetail.getTotalFee();
		itemBalanceDue = itemCapDetail.getBalance();
	}
	var workDesc = workDescGet(itemCapId);
	addParameter(params, "$$altID$$", itemCapIDString);
	addParameter(params, "$$capName$$", itemCapName);
	addParameter(params, "$$recordTypeAlias$$", itemCapTypeAlias);
	addParameter(params, "$$capStatus$$", itemCapStatus);
	addParameter(params, "$$fileDate$$", itemFileDate);
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(itemBalanceDue).toFixed(2));
	addParameter(params, "$$workDesc$$", (workDesc) ? workDesc : "");
	return params;
}

function getACARecordParam4Notification(params,acaUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));

	return params;
}


function getAARecordParam4Notification(params,avUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$aaRecordUrl$$", getAARecordUrl(avUrl));

	return params;
}

function getACADeepLinkParam4Notification(params,acaUrl,pAppType,pAppTypeAlias,module) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
	addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);

	return params;
}

function getAPOParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
	//Get Address Line Param
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addressLine = ad.getDisplayAddress();
		}
	addParameter(params, "$$addressLine$$", addressLine);
	//Get Parcel Number Param
	var parcelNumber = "";
	paResult = aa.parcel.getParcelandAttribute(capId,null);
	if (paResult.getSuccess()) {
		Parcels = paResult.getOutput().toArray();
		for (zz in Parcels) {
			if(Parcels[zz].getPrimaryParcelFlag() == "Y") {
				parcelNumber = Parcels[zz].getParcelNumber();
			}
		}
	}
	addParameter(params,"$$parcelNumber$$",parcelNumber);
	//Get Owner Param
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				break;
			}
		}
	}
	return params;
}


function getAARecordUrl(avUrl) {
	var aaRecordUrl = "";
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

   	aaRecordUrl = avUrl + "/portlets/cap/capsummary/CapTabSummary.do?mode=tabSummary";
	aaRecordUrl += "&serviceProviderCodee=" + aa.getServiceProviderCode();
	aaRecordUrl += "&ID1=" + id1 + "&ID2=" + id2 + "&ID3=" + id3;
	aaRecordUrl += "&requireNotice=YES";
	aaRecordUrl += "&clearForm=clearForm";
	aaRecordUrl += "&module=" + cap.getCapModel().getModuleName();

   	return aaRecordUrl;
}

function getDeepLinkUrl(acaUrl, appType, module) {
	var acaDeepLinkUrl = "";

	acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
	acaDeepLinkUrl += appType;
	acaDeepLinkUrl += "&Module=" + module;

	return acaDeepLinkUrl;
}


function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
        aa.print(key + " = " + value);
	}
}

function getACADocDownloadParam4Notification(params,acaUrl,docModel) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl,docModel));

	return params;
}

function getContactParams4Notification(params,pContact) {
	// pass in a hashtable and it will add the additional parameters to the table
	// pass in contact to retrieve information from

		thisContact = pContact;
		conType = thisContact["contactType"];
		//logDebug("Contact Array: " + thisContact["contactType"] + " Param: " + conType);

		addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
		addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
		addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
		addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);
		addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);
		addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);
		addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);
		addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);
		addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);
		addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);
		addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);
		addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);
		addParameter(params, "$$" + conType + "City$$", thisContact["city"]);
		addParameter(params, "$$" + conType + "State$$", thisContact["state"]);
		addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);
		addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);
		addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);
		addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);
		addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

	return params;
}

function getPrimaryAddressLineParam4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

    var addressLine = "";

	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");

	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();

		addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
	}

	return params;
}

function getPrimaryOwnerParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	capOwnerResult = aa.owner.getOwnerByCapId(capId);

	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();

		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone);
				break;
			}
		}
	}
	return params;
}


function getACADocumentDownloadUrl(acaUrl,documentModel) {

   	//returns the ACA URL for supplied document model

	var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);
	if(acaUrlResult.getSuccess())
	{
		acaDocUrl = acaUrlResult.getOutput();
		return acaDocUrl;
	}
	else
	{
		logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
		return false;
	}
}


function getACARecordURL(acaUrl) {

	var acaRecordUrl = "";
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

   	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";
	acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

   	return acaRecordUrl;
}


 function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

/*------------------------------------------------------------------------------------------------------/
|  Notification Template Functions (End)
/------------------------------------------------------------------------------------------------------*/

function loadCustomScript(scriptName) {

    try {
        scriptName = scriptName.toUpperCase();
        var emseBiz = aa.proxyInvoker.newInstance(
                "com.accela.aa.emse.emse.EMSEBusiness").getOutput();
        var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),
                scriptName, "ADMIN");
        eval(emseScript.getScriptText() + "");

    } catch (error) {
        showDebug = true;
        logDebug("<font color='red'><b>WARNING: Could not load script </b></font>" + scriptName + ". Verify the script in <font color='blue'>Classic Admin>Admin Tools>Events>Scripts</font>");
    }
}

function getVendor(sourceValue, sourceName)
{
	var _sourceVal = "STANDARD";
	if(sourceValue != null && sourceValue != '')
	{
		logDebug("sourceValue was not null or empty string.");
		_sourceVal = sourceValue;
	}
	else if(sourceName != null && sourceName != '')
	{
		logDebug("sourceName was not null or empty string.");
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue("EDMS",sourceName.toUpperCase());

		if (bizDomScriptResult.getSuccess())
	   {
			logDebug("bizDomScriptResult is successful.");
			bizDomScriptObj = bizDomScriptResult.getOutput();
			var bizDescStr = bizDomScriptObj.getDescription();
			var startPos = bizDescStr.indexOf("EDMS_VENDOR=");
			var endPos = bizDescStr.indexOf(";",startPos);
			if(startPos > -1 && endPos >-1)
			{
				_sourceVal = bizDescStr.substring(startPos+12,endPos).trim();
				logDebug("_sourceVal set to " + _sourceVal);
			}
		}
		else
			logDebug("bizDomScriptResult.getSuccess() was false.  Will not attempt to search for Vendor.");
	}

	logDebug("Function getVendor returns a value of " + _sourceVal);

	return _sourceVal;
}

/*--------START DIGEPLAN EDR CUSTOM FUNCTIONS---------*/
function getAssignedToStaff() // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ 	logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
			return false;
		}

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ 	logDebug("**ERROR: No cap detail script object") ;
			return false;
		}

	cd = cdScriptObj.getCapDetailModel();

	//cd.setCompleteDept(iName.getDeptOfUser());
	var returnValue = cd.getAsgnStaff();
	//cdScriptObj.setCompleteDate(sysDate);

	//logDebug("Returning Assigned To Staff value: " + returnValue);

	return returnValue;
}

function edrPlansExist(docGroupArray,docCategoryArray) {
	var edrPlans = false;

	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) if(exists(docArray[d]["docGroup"],docGroupArray) && exists(docArray[d]["docCategory"],docCategoryArray)) edrPlans = true;
	}

	return edrPlans;
}


function emailReviewCompleteNotification(wfStatus,revisionStatus,approvedStatus,docGroupArray) {
		showMessageDefault = showMessage;
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var emailTemplate = "";
		var fileNames = [];

		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		getACARecordParam4Notification(emailParameters,acaSite);
		var emailEnv = "";
		if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
        addParameter(emailParameters,"$$emailEnv$$",emailEnv);
		addParameter(emailParameters,"$$wfTask$$",wfTask);
		addParameter(emailParameters,"$$wfComment$$",wfComment);
		addParameter(emailParameters,"$$wfStatus$$",wfStatus);
		addParameter(emailParameters, "$$openedDate$$", fileDate);

		var applicantEmail = "";
		var assignedTo = getAssignedToStaff();
		var assignedToEmail = "";
		var assignedToFullName = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if(typeof(contObj) == "object") {
			for (co in contObj) {
				if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
			}
		}

		addParameter(emailParameters,"$$applicantEmail$$",applicantEmail);

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(applicantEmail != "") {
			if(matches(wfStatus,revisionStatus))	{
				if(appMatch("Building/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_RESUBMIT_BLD";
				if(appMatch("Engineering/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_RESUBMIT_ENG";
				if(appMatch("Planning/*/*/*")) {
					if(wfProcess == "P_PROJ") emailTemplate = "WTUA_CONTACT NOTIFICATION_RESUBMIT_PLN";
					if(wfProcess == "P_PRE") emailTemplate = "WTUA_CONTACT NOTIFICATION_COMMENTS_PRE";
				}


				var fileNameArray = [];
				var fileNameString = "";
				docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
				if(docArray != null && docArray.length > 0) {
					for (d in docArray) {
						if(exists(docArray[d]["docGroup"],docGroupArray) && matches(docArray[d]["docStatus"],reviewCompleteDocStatus,revisionsRequiredDocStatus) && docArray[d]["fileUpLoadBy"] == digEplanAPIUser && docArray[d]["allowActions"] != null && docArray[d]["allowActions"].indexOf("RESUBMIT") >=0) {
							//fileNameArray.push(docArray[d]["fileName"]);
							getResubmitFileName(docArray[d],fileNameArray);
						}
					}
				}
				if(fileNameArray.length >0) fileNameString = "Document(s) requiring correction: " + fileNameArray;
				addParameter(emailParameters,"$$correctionFileNames$$",fileNameString);
			}
			if(matches(wfStatus,approvedStatus))	{
				if(appMatch("Building/*/*/*"))  emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED_BLD";
				if(appMatch("Engineering/*/*/*"))  emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED_ENG";
				if(appMatch("Planning/*/*/*") && wfProcess != "P_PRE") emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED_PLN";

			}
			if(emailTemplate != "") sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
		}
		else {
			if(applicantEmail == "" && assignedToEmail != "") {
			var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCOMPLETE";
			addParameter(emailParameters,"$$wfStatus$$",wfStatus);sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
			showMessage = true;
			comment("There is no applicant email associated to this permit. Permit Coordinator has been notified via email to contact this applicant directly.");
			showMessage = showMessageDefault;
			}
		}
}

function getResubmitFileName(documentModel,fileNameArray) {
	logDebug(documentModel["fileName"]);
	var parentFileName = "";
	var parentDocSeq = documentModel.getParentSeqNbr();
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null) {
		//Get parent document fileName
		parentFileName = parentDocModel.getOutput().getFileName();
		logDebug("The original document file name is " + parentFileName);
	}
	if (parentFileName != "") fileNameArray.push(parentFileName);
	return fileNameArray;
}

function emailCorrectionsRequiredNotification(wfTask,wfStatus,wfComment) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];

		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		getACARecordParam4Notification(emailParameters,acaSite);
		var emailEnv = "";
		if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
        addParameter(emailParameters,"$$emailEnv$$",emailEnv);
		addParameter(emailParameters,"$$wfTask$$",wfTask);
		addParameter(emailParameters,"$$wfStatus$$",wfStatus);
		addParameter(emailParameters,"$$wfComment$$",wfComment);
		addParameter(emailParameters, "$$openedDate$$", fileDate);

		var applicantEmail = "";
		var assignedTo = currentUserID;
		var assignedToEmail = "";
		var assignedToFullName = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if(typeof(contObj) == "object") {
			for (co in contObj) {
				if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
			}
		}

		addParameter(emailParameters,"$$applicantEmail$$",applicantEmail);

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(applicantEmail != "") {
			if(appMatch("Building/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INTERIM_BLD";
			if(appMatch("Engineering/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INTERIM_ENG";
			if(appMatch("Planning/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INTERIM_PLN";
			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
		}
		else {
			if(applicantEmail == "" && assignedToEmail != "") {
			var emailTemplate = "WTUA_INTERNAL NOTIFICATION_INTERIM";
			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
			showMessage = true;
			comment("There is no applicant email associated to this permit. A notification regarding this workflow task status update has not been sent via email. Please contact this applicant directly.");
			}
		}
}

function emailPermitIssuedNotification() {
		showMessageDefault = showMessage;
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];

		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		getACARecordParam4Notification(emailParameters,acaSite);
		addParameter(emailParameters,"$$wfComment$$",wfComment);
		addParameter(emailParameters,"$$wfStatus$$",wfStatus);

		var applicantEmail = "";
		var assignedTo = getAssignedToStaff();
		var assignedToEmail = "";
		var assignedToFullName = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if(typeof(contObj) == "object") {
			for (co in contObj) {
				if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
			}
		}

		addParameter(emailParameters,"$$applicantEmail$$",applicantEmail);

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(applicantEmail != "") {
				//if(appMatch("Building/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED_BLD";
				if(appMatch("Engineering/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED_ENG";
				//if(appMatch("Planning/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED_PLN";

			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
		}
		else {
			if(applicantEmail == "" && assignedToEmail != "") {
			var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCOMPLETE";
			addParameter(emailParameters,"$$wfStatus$$",wfStatus);sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
			showMessage = true;
			comment("There is no applicant email associated to this permit. Permit Coordinator has been notified via email to contact this applicant directly.");
			showMessage = showMessageDefault;
			}
		}
}

function emailFinalActionNotification(wfTask,wfStatus,wfComment) {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];

	getRecordParams4Notification(emailParameters);
	getAPOParams4Notification(emailParameters);
	var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
	acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters,acaSite);
	var emailEnv = "";
	if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
	addParameter(emailParameters,"$$emailEnv$$",emailEnv);
	addParameter(emailParameters,"$$wfTask$$",wfTask);
	addParameter(emailParameters,"$$wfStatus$$",wfStatus);
	addParameter(emailParameters,"$$wfComment$$",wfComment);
	addParameter(emailParameters, "$$openedDate$$", fileDate);

	var applicantEmail = "";
	var assignedTo = currentUserID;
	var assignedToEmail = "";
	var assignedToFullName = "";
	var contObj = {};
	contObj = getContactArray(capId);
	if(typeof(contObj) == "object") {
		for (co in contObj) {
			if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
		}
	}

	addParameter(emailParameters,"$$applicantEmail$$",applicantEmail);

	if(assignedTo != null) {
			assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
			if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
				assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
			}
	}
	addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
	addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

	if(applicantEmail != "") {
		if(appMatch("Planning/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED_PLN";
		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function doResubmitActions(documentModel,docGroups,docCategories,routingTask,routingResubmittalStatus,originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit) {
	afterResubmitParentDocument(originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit);
	disableToBeResubmit(documentModel["documentNo"]);
    if(publicUser) emailDocResubmitNotification(docGroups,docCategories);
    updateTask(routingTask,routingResubmittalStatus,"","");
}

function afterResubmitParentDocument(originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit)
{
	var docModelList = aa.env.getValue("DocumentModelList");
	//var originalDocStatusOnResubmit = "Resubmitted";
	//var parentDocStatusOnResubmit = "Resubmitted";
	//var resubmitDocStatusOnResubmit = "Uploaded";
	var it = docModelList.iterator();
	while(it.hasNext())
	{
		var docModel = it.next();
		if(docModel == null)
		{
			aa.print("docModel is null");
			break;
		}
		//Set resubmit document status as "Uploaded"
		docModel.setDocStatus(resubmitDocStatusOnResubmit);
		var affectResubmitDocNum = aa.document.updateDocument(docModel);
		if(affectResubmitDocNum != null && affectResubmitDocNum.getOutput() != null && affectResubmitDocNum.getOutput() > 0)
		{
			aa.print("The resubmit document status has been set to " + resubmitDocStatusOnResubmit);
		}
/*		//Get all original document associations by resubmit document model.
		var originalDocModel = aa.document.getOriginalDoc(docModel);
		if(originalDocModel != null && originalDocModel.getOutput() != null)
		{
		    //Set original document status as "Resubmitted"
			originalDocModel.getOutput().setDocStatus(originalDocStatusOnResubmit)
			var affectOriginalDocNum = aa.document.updateDocument(originalDocModel.getOutput());
			if(affectOriginalDocNum != null && affectOriginalDocNum.getOutput() != null && affectOriginalDocNum.getOutput() > 0)
			{
				aa.print("The original document status has been set to " + originalDocStatusOnResubmit);
			}
		}
*/
		//Get parent document associations by resubmit document model.
		var parentDocSeq = docModel.getParentSeqNbr();
		var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
		if(parentDocModel != null && parentDocModel.getOutput() != null)
		{
		    //Set parent document status as "Resubmitted"
			parentDocModel.getOutput().setDocStatus(parentDocStatusOnResubmit)
			var affectParentDocNum = aa.document.updateDocument(parentDocModel.getOutput());
			if(affectParentDocNum != null && affectParentDocNum.getOutput() != null && affectParentDocNum.getOutput() > 0)
			{
				aa.print("The parent document status has been set to " + parentDocStatusOnResubmit);
			}
		}
	}
}

function disableToBeResubmit(documentID)
{
	//get current document model by documentID
	var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();

	if ("RESUBMIT".equals(adsDocumentModel.getCategoryByAction()))
	{
		//get parent seq number
		var checkInDocumentId = adsDocumentModel.getParentSeqNbr();
		if(checkInDocumentId != null || !"".equals(checkInDocumentId))
		{
			//get check-in document by documentID
			var checkInDocument = aa.document.getDocumentByPK(checkInDocumentId).getOutput();

			//set original check-in document model's resubmit is false
			checkInDocument.setResubmit(false);

			//update original check-in document model
			aa.document.updateDocument(checkInDocument);
		}
	}
}

function emailDocUploadNotification(docGroups,docCategories) {
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();

	for (dl in newDocModelArr) {
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories) && matches(newDocModelArr[dl]["categoryByAction"],null)) {
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}

	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];

		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var emailEnv = "";
		if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
        addParameter(emailParameters,"$$emailEnv$$",emailEnv);
		var assignedToFullName = "";
		var assignedToEmail = "";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);

		emailTemplate = "DUA_INTERNAL NOTIFICATION_UPLOAD";
		//if(appMatch("Building/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_UPLOAD_BLD";
		//if(appMatch("Engineering/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_UPLOAD_ENG";
		//if(appMatch("Planning/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_UPLOAD_PLN";

		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function emailDocResubmitNotification(docGroups,docCategories) {
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();

	for (dl in newDocModelArr) {
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories) && matches(newDocModelArr[dl]["categoryByAction"],"RESUBMIT")) {
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}

	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];

		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var emailEnv = "";
		if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
        addParameter(emailParameters,"$$emailEnv$$",emailEnv);
		var assignedToFullName = "";
		var assignedToEmail = "";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);
		//build paramters for DigEplan URL
		var digEplanUrl = lookup("EXTERNAL_DOC_REVIEW","WEB_SERVICE_URL");
		getDigEplanRecordUrl(digEplanUrl);
		getDigEplanRecordUrlParam4Notification(emailParameters,digEplanUrl);

		emailTemplate = "DUA_INTERNAL NOTIFICATION_RESUBMIT";
		//if(appMatch("Building/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_RESUBMIT_BLD";
		//if(appMatch("Engineering/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_RESUBMIT_ENG";
		//if(appMatch("Planning/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_RESUBMIT_PLN";

		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function getDigEplanRecordUrl(digEplanUrl) {

	var digEplanRecordUrl = "";

   	digEplanRecordUrl = digEplanUrl;
	digEplanRecordUrl += "" + capId.getCustomID();

   	return digEplanRecordUrl;
}

function getDigEplanRecordUrlParam4Notification(params,digEplanUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$digEplanRecordUrl$$", getDigEplanRecordUrl(digEplanUrl));

	return params;
}

function synchronizeDocFileNames() {
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("*Document Name: " + docArray[d].getDocName());
			//logDebug("*File Name: " + docArray[d].getFileName());
			if(docArray[d].getDocName() != docArray[d].getFileName()) {
				var docNameExt = null;
				//logDebug("*-------------*");
				//logDebug("* Document Name: " + docArray[d].getDocName());
				//logDebug("* File Name: " + docArray[d].getFileName());

				var fileTypeIndex = docArray[d].getFileName().lastIndexOf(".");
				if(fileTypeIndex>1) var fileExt = docArray[d].getFileName().substring(docArray[d].getFileName().lastIndexOf("."));
				//logDebug("fileExt: " + fileExt);

				var docTypeIndex = docArray[d].getDocName().lastIndexOf(".");
				if(docTypeIndex>1) {
					var docExt = docArray[d].getDocName().substring(docArray[d].getDocName().lastIndexOf("."));
					if(docExt != fileExt) {
						docNameExt = docArray[d].getDocName() + fileExt;
						docArray[d].setDocName(docArray[d].getDocName() + fileExt);
						//logDebug("---UPDATE DOCNAME TO : " + docNameExt);
					} else {
						docNameExt = docArray[d].getDocName();
						//logDebug("----DOCNAME DOESN'T CHANGE : " + docNameExt);
						}
				}
				if(docTypeIndex == -1) {
					docNameExt = docArray[d].getDocName() + fileExt;
					docArray[d].setDocName(docArray[d].getDocName() + fileExt);
					//logDebug(" ---UPDATE DOCNAME TO : " + docNameExt);
				}

				if(docNameExt != docArray[d].getFileName()){
					logDebug("<font color='blue'>---UPDATE FILE NAME TO: " + docNameExt + "</font>");
					docArray[d].setFileName(docNameExt);
				}
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}

		}
	}
}

function updateCheckInDocStatus(documentModel,revisionStatus,approvedStatus,approvedPendingStatus) {
	var docAutoStatus = documentModel["docStatus"]; //logDebug("Original Doc Status: " + docAutoStatus);
	//var docDescription = String(documentModel["docDescription"]); //logDebug("docDescription: " + docDescription);
	var docAutoStatus = getParentDocStatus(documentModel); logDebug("Parent Doc Status: " + docAutoStatus);
	if(docAutoStatus == revisionStatus) docAutoStatus = revisionStatus;
	if(docAutoStatus == approvedStatus) docAutoStatus = approvedPendingStatus;
    if(docAutoStatus == approvedPendingStatus) docAutoStatus = approvedPendingStatus;
	//logDebug("docAutoStatus: " + docAutoStatus);

	if(docAutoStatus != documentModel["docStatus"]) {
		documentModel.setDocStatus(docAutoStatus);
		documentModel.setRecStatus("A");
		documentModel.setSource(getVendor(documentModel.getSource(), documentModel.getSourceName()));
		updateDocResult = aa.document.updateDocument(documentModel);
		logDebug("<font color='blue'>Document Status updated to " + docAutoStatus + "</font>");
	} else {
		logDebug("Document Status not updated.");
	}

}

function updateDocPermissionsbyCategory(documentModel,updateCategory) {
	if (documentModel["docCategory"] != updateCategory) {
		documentModel.setDocCategory(updateCategory);
		aa.document.updateDocument(documentModel);
		logDebug("<font color='blue'>Document Category updated to " + updateCategory + "</font>");
	} else {
		logDebug("Document Category not updated.");
	}

}


function getParentDocCategory(documentModel) {
	var parentDocCategory = "";
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		//Get parent document category
		parentDocCategory = parentDocModel.getOutput().getDocCategory();
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent category is " + parentDocCategory);
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent name is " + parentDocModel.getOutput().getDocName());
	}
	return parentDocCategory;
}

function getParentDocStatus(documentModel) {
	var parentDocStatus = "";
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		//Get parent document status
		parentDocStatus = parentDocModel.getOutput().getDocStatus();
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent status is " + parentDocStatus);
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent name is " + parentDocModel.getOutput().getDocName());
	}
	return parentDocStatus;
}

function checkForPendingReviews(reviewTasksArray,reviewTaskStatusPendingArray) //function checks for all review tasks resulted and/or completed
	{
	var tasksPending = false;
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	for (i in wfObj)
		{
		var fTask = wfObj[i];
 		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray))
			{
			//logDebug("Workflow Task: " + fTask.getTaskDescription().toUpperCase() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
			if(fTask.getActiveFlag() == "Y" && exists(fTask.getDisposition(),reviewTaskStatusPendingArray)) tasksPending = true;
			}
		}
		return tasksPending;
}

function updatePlanReviewTasks4Resubmittal(reviewTasksArray,taskStatusArray,reviewTaskResubmittalReceivedStatus) {
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray) && fTask.getDisposition() != null && exists(fTask.getDisposition().toUpperCase(),taskStatusArray)) {
			if(!isTaskActive(fTask.getTaskDescription())) {activateTask(fTask.getTaskDescription());}
			if(!isTaskStatus(fTask.getTaskDescription(),reviewTaskResubmittalReceivedStatus)) updateTask(fTask.getTaskDescription(),reviewTaskResubmittalReceivedStatus,"Documents Resubmitted for Review","");
		}
	}
}

function digEplanPreCache(client,altId,thisEnv)
{
	var soapresp = "DigEplan precache did not work";
	var preCacheURL = "";
	if(thisEnv == "PROD") preCacheURL = "https://api.usw.digeplan.app/api/precache/folders?product=app&client=" + client + "&originalFolderId=" + altId;
	if(!matches(thisEnv,"PROD")) preCacheURL = "https://api.us-stage.digeplan.io/api/precache/folders?product=app&client=" + client + "&originalFolderId=" + altId;
	logDebug("preCacheURL: " + preCacheURL);

	soapresp = aa.util.httpPost(preCacheURL,'').getOutput();
	if(soapresp) logDebug("<font color='green'>Calling " + thisEnv + " API: " + soapresp + "</font>");
	if(!soapresp) logDebug("<font color='red'>COULD NOT REACH DIGEPLAN API</font>");
	return soapresp;
}

function updateRevisionDocumentsForResubmit(docGroupArray,docCategoryArray,digEplanAPIUser){
    docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			if(exists(docArray[d]["docGroup"],docGroupArray) && exists(docArray[d]["docCategory"],docCategoryArray) && matches(docArray[d]["docStatus"],"Review Complete","Revision Required") && exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser) && docArray[d].getDocName().indexOf("Reviewed - Revision") >= 0) {
			logDebug("<font color='green'>DocumentID: " + docArray[d]["documentNo"] + "</font>");
			logDebug("<font color='green'>DocumentGroup: " + docArray[d]["docGroup"] + "</font>");
			logDebug("<font color='green'>DocumentCategory: " + docArray[d]["docCategory"] + "</font>");
			logDebug("<font color='green'>DocName: " + docArray[d]["docName"] + "</font>");
			logDebug("<font color='green'>DocumentStatus: " + docArray[d]["docStatus"] + "</font>");
			logDebug("<font color='green'>UploadBy: " + docArray[d]["fileUpLoadBy"] + "</font>");
			logDebug("<font color='green'>AllowActions: " +  docArray[d].getAllowActions() + "</font>");
			if(docArray[d].getAllowActions() == null || docArray[d].getAllowActions().indexOf("RESUBMIT") == -1) enableToBeResubmit(docArray[d].getDocumentNo(),["Review Complete","Revision Required"]);
			}
		}
	}
}

function enableToBeResubmit(documentID,docStatusArray)
{
	//get current document model by documentID
	var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();

	if (exists(adsDocumentModel.getDocStatus(),docStatusArray))
	{
		//set this doc resubmit
		adsDocumentModel.setResubmit(true);
		adsDocumentModel.setCategoryByAction("CHECK-IN");
		adsDocumentModel.setAllowActions("RESBUMIT;ACA_RESUBMIT");
		//adsDocumentModel.setDocStatus("Pending Resubmittal");

		//update this document model
        aa.document.updateDocument(adsDocumentModel);
        logDebug("<font color='blue'>Doc RESUBMIT enabled: " + adsDocumentModel["docName"] + "</font>");
	}
}

function emailReviewConsolidationNotification(reviewStatus) {
    showMessageDefault = showMessage;
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    getAPOParams4Notification(emailParameters);
	var emailEnv = "";
	if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
	addParameter(emailParameters,"$$emailEnv$$",emailEnv);
    addParameter(emailParameters, "$$openedDate$$", fileDate);
    addParameter(emailParameters,"$$reviewStatus$$",reviewStatus);

    var assignedTo = getAssignedToStaff();
    var assignedToEmail = "";
    var assignedToFullName = "";

    if(assignedTo != null) {
            assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
            if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
                assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
            }
    }
    addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
    addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

    var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCONSOLIDATION";
    sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
}

function checkForRevisionsNeeded(reviewTasksArray,reviewTaskResubmitStatusArray) { //function checks for any review tasks revisions needed status
	var revisionsNeeded = false;
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	for (i in wfObj)
		{
		var fTask = wfObj[i];
 		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray))
			{
			//logDebug("Workflow Task: " + fTask.getTaskDescription().toUpperCase() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
			if(exists(fTask.getDisposition(),reviewTaskResubmitStatusArray)) revisionsNeeded = true;
			}
		}
		return revisionsNeeded;
}

function emailAppSubmittedACA() {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];

	getRecordParams4Notification(emailParameters);
	getAPOParams4Notification(emailParameters);
	var emailEnv = "";
	if(ENVIRON != "PROD") emailEnv = "[TEST EMAIL]";
	addParameter(emailParameters,"$$emailEnv$$",emailEnv);
	addParameter(emailParameters, "$$openedDate$$", fileDate);

	var emailTemplate = "CTRCA_INTERNAL NOTIFICATION_NEW_APP_SUBMITTED";
	sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);

}

function getCapProcessCode(itemCap) {
var capProcessCode = "";
	var capTypeDetail = getCapTypeDetail(itemCap);
	if (capTypeDetail) {
		if(capTypeDetail.getProcessCode() != null) capProcessCode = capTypeDetail.getProcessCode();

	}
	logDebug("PROCESS CODE: " + capProcessCode);
	return capProcessCode;
}

function getCapTypeDetail(itemCap) {
	var capTypeDetail = null;
	var capScriptModelResult = aa.cap.getCap(itemCap);
	if (!capScriptModelResult.getSuccess())
	{ logDebug("**WARNING: Retrieving Cap Script Model: " + itemCap + ".  Reason is: " + capScriptModelResult.getErrorType() + ":" + capScriptModelResult.getErrorMessage()) ; return false }

	capType = capScriptModelResult.getOutput().getCapType();
	var capTypeDetailResult = aa.cap.getCapTypeDetailByPK(capType);
	if (!capTypeDetailResult.getSuccess())
	{ logDebug("**WARNING: Retrieving Cap Type Detail for cap type: " + capType + " of cap: " + itemCap + ".  Reason is: " + capTypeDetailResult.getErrorType() + ":" + capTypeDetailResult.getErrorMessage()) ; return false }

	capTypeDetail = capTypeDetailResult.getOutput();
	return capTypeDetail;
}

/*--------END DIGEPLAN EDR CUSTOM FUNCTIONS---------*/

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
        logDebug("CSLB call failed: " + res.getErrorMessage() + " " + res.getErrorType() + " for " + licNum);
        returnObj.message = "The California Contractor State License Board website is temporarily down, please save the permit application you were creating so you can resume once the CSLB website is back up.";
        //returnObj.message = "CSLB call failed: " + res.getErrorMessage() + " " + res.getErrorType() + " for " + licNum;
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
        var classification = String(ClassificationList[classificationIndex]).toUpperCase().trim();
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

function generateReport4Save(itemCap, reportName, module, parameters) {

    //returns the report file which can be attached to an email.
    var user = currentUserID;   // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap.getCustomID());
    report.setReportParameters(parameters);

    var edms = new com.accela.v360.reports.proxy.EDMSEntityIdModel();
    edms.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
    edms.setAltId(itemCap.getCustomID());
    report.setEDMSEntityIdModel(edms)

    var permit = aa.reportManager.hasPermission(reportName, "ADMIN");

    if (permit.getOutput().booleanValue()) {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult) {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else {
            logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else {
        logDebug("You have no permission.");
        return false;
    }
}

/*
GQ_DOCU_SIGN_LIBRARY.js
Author: Gray Quarter Inc. (c)2023
Usage: Used with Gray Quarter Sign UI with Adobe Sign.  See help.grayquarter.com for documentation.
Version: 1.0
Ticket: CASANLEAN-2965
*/
function adobeSignerObj(FullName, Email) {
    this.FullName = FullName || "";
    this.Email = Email || "";

    this.SignHere = [];
    this.DateHere = [];
    this.FullNameHere = [];
    this.InitialHere = [];

    /**
     * Load from Primary Contact Type
     * @param {capIdModel} pCapId
     */
    this.SignerFromPrimary = function (pCapId) {
        this.FullName = "";
        this.Email = "";
        //Get primary contact and fill full name and email
        var conArr = new Array();
        var capContResult = aa.people.getCapContactByCapID(pCapId);
        if (capContResult.getSuccess()) {
            conArr = capContResult.getOutput();
            for (contact in conArr) {
                if (conArr[contact].getPeople().getFlag() == "Y") {
                    var fullName = conArr[contact].getPeople().getFullName() || "";
                    var fName = conArr[contact].getPeople().getFirstName() || "";
                    var lName = conArr[contact].getPeople().getLastName() || "";
                    var busName = String(conArr[contact].getPeople().getBusinessName())
                    var email = String(conArr[contact].getPeople().getEmail());
                    if (fName != "" || lName != "") {
                        this.FullName = String(fName + " " + lName).trim();
                    }
                    else if (fullName != "") {
                        this.FullName = String(fullName);
                    }
                    else {
                        this.FullName = String(busName);
                    }
                    if (email.indexOf("@") > 0) {
                        this.Email = String(email);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Load a signer from contact type, if multiple of same type grabs first one
     * @param {capIdModel} pCapId
     * @param {string} contactType
     */
    this.SignerFromContactType = function (pCapId, contacType) {
        //TODO: lookup primary contact and them
        this.FullName = "";
        this.Email = "";
        //Get primary contact and fill full name and email
        var conArr = new Array();
        var capContResult = aa.people.getCapContactByCapID(pCapId);
        if (capContResult.getSuccess()) {
            conArr = capContResult.getOutput();
            for (contact in conArr) {
                if (String(conArr[contact].getPeople().getContactType()).toLowerCase() == String(contacType).toLowerCase()) {
                    var fullName = conArr[contact].getPeople().getFullName() || "";
                    var fName = conArr[contact].getPeople().getFirstName() || "";
                    var lName = conArr[contact].getPeople().getLastName() || "";
                    var busName = String(conArr[contact].getPeople().getBusinessName())
                    var email = String(conArr[contact].getPeople().getEmail());
                    if (fName != "" || lName != "") {
                        this.FullName = String(fName + " " + lName).trim();
                    }
                    else if (fullName != "") {
                        this.FullName = String(fullName);
                    }
                    else {
                        this.FullName = busName;
                    }
                    if (email.indexOf("@") > 0) {
                        this.Email = email;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Pulls just object members out for sending envelope
     */
    this.BuildSignerObj = function () {

        var obj = {
            FullName: this.FullName,
            Email: this.Email,
            SignHere: this.SignHere,
            DateHere: this.DateHere,
            FullNameHere: this.FullNameHere
        }
        return obj;
    }

    /**
     * Adds a new token for signing
     * @param {string} token
     * @param {int} offx defaults 20 if null
     * @param {int} offy defualts 5 if null
     */
    this.AddSignHere = function (token, offx, offy) {
        var tmp = {
            token: token,
            offX: (offx == null ? "20" : offx),
            offY: (offy == null ? "5" : offy),
            XPosition: ""
        }
        this.SignHere.push(tmp);
    }
    /**
     * Adds new token replacement for where date should go
     * @param {string} token
     * @param {int} offx defaults to 0
     * @param {int} offy defaults to 0
     */
    this.AddDateHere = function (token, offx, offy) {
        var tmp = {
            token: token,
            offX: (offx == null ? "0" : offx),
            offY: (offy == null ? "0" : offy),
            XPosition: ""
        }
        this.DateHere.push(tmp);
    }
    /**
     * Adds a new token where full name of signer should be pushed to
     * @param {string} token
     * @param {int} offx defaults to 0
     * @param {int} offy defaults to 0
     */
    this.AddFullNameHere = function (token, offx, offy) {
        var tmp = {
            token: token,
            offX: (offx == null ? "0" : offx),
            offY: (offy == null ? "0" : offy),
            XPosition: ""
        }
        this.FullNameHere.push(tmp);
    }

    this.signatureAnchor = function (xPos, yPos, docId, pageNumber, pageWidth, pageHeight) {
        var tmp = {
            "Token": null,
            "offX": null,
            "offY": null,
            "XPosition": xPos,
            "YPosition": yPos,
            "StampType": "signature",
            "DocumentId": docId,
            "PageNumber": pageNumber,
            "RecipientId": 0,
            "Name": "SignHere",
            "Height": pageHeight,
            "Width": pageWidth
        }
        this.SignHere.push(tmp);
    }

    this.dateAnchor = function (xPos, yPos, docId, pageNumber, pageWidth, pageHeight) {
        var tmp = {
            "Token": null,
            "offX": null,
            "offY": null,
            "XPosition": xPos,
            "YPosition": yPos,
            "StampType": null,
            "DocumentId": docId,
            "PageNumber": pageNumber,
            "RecipientId": 0,
            "Name": "Date",
            "Height": pageHeight,
            "Width": pageWidth
        }
        this.DateHere.push(tmp);
    }
}

function doAdobeSign(Organization, itemCap, ReturnDocType, EmailSubject, Signers, Documents, message) {
    this.URL = String(lookup("INTERFACE_ADOBESIGN", "REST_URL"));
    this.APIKEY = String(lookup("INTERFACE_ADOBESIGN", "API_KEY"));
    this.Organization = String(lookup("INTERFACE_ADOBESIGN", "ORGANIZATION"));
    this.pCapId = itemCap;
    this.Alias = aa.cap.getCap(itemCap).getOutput().getCapType().getAlias();
    this.RecordId = String(itemCap.getCustomID());
    this.RecordKey = aa.getServiceProviderCode() + "-" + itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3();
    this.ReturnDocType = ReturnDocType || "";
    this.Message = message;
    this.EmailSubject = EmailSubject || (Organization + " eSignature for record " + itemCap.getCustomID());
    this.Signers = Signers || [];
    this.CCs = [];
    if (this.Signers.length == null) {
        this.Signers = [this.Signers]; //cast it to an array if not an array already.
    }
    this.Documents = Documents || [];
    if (this.Documents.length == null) {
        this.Documents = [this.Documents]; //cast it to an array if not an array already.
    }

    /**
     * Adds a new Signer
     * @param {AdobeSignerObj} dsObj
     */
    this.AddSigner = function (dsObj) {
        this.Signers.push(dsObj);
    }

    this.AddCC = function (FullName, Email) {
        var o = {};
        o.FullName = FullName;
        o.Email = Email;
        this.CCs.push(o);
    }

    /**
     * Adds a new doc to the signing array
     * @param {int} docId
     */
    this.AddDocument = function (docId, pageNum) {
        var docObj = {};
        docObj.DocumentType = 1;
        docObj.docLong = String(docId);
        docObj.docurl = "";
        docObj.order = String(this.Documents.length + 1);
        //TODO pageCount
        docObj.pageCount = String(pageNum);
        this.Documents.push(docObj);
    }

    /**
     * Adds document from envelop record by type, if multiple grabs first occurance
     * @param {string} docType
     */
    this.AddDocumentType = function (docType, pages) {
        //TODO: LOOKUP DOCUMENT ID AND TO ARRAY
        var docList = aa.document.getDocumentListByEntity(this.pCapId, "CAP").getOutput().toArray();
        if (docList.length > 0) {
            //Convert list to upper case
            for (docItem in docList) {
                if (String(docList[docItem].getDocCategory()).toLowerCase() == String(docType).toLowerCase()) {
                    var dsDocObj = {};
                    dsDocObj.DocumentType = 1;
                    dsDocObj.docLong = String(docList[docItem].getDocumentNo(), 10);
                    dsDocObj.docurl = "";
                    dsDocObj.order = String(this.Documents.length + 1);
                    dsDocObj.pageCount = pages;
                    this.Documents.push(dsDocObj);
                    logDebug("Added Doc #" + docList[docItem].getDocumentNo());
                    return;
                }
            }
        }
    }

    /**
     * Posts the object to the REST endpoint for signing should only be invoked once after everything loaded
     */
    this.Send = function () {
        var tmpSigners = [];
        if (this.Documents) {
            if (this.Documents.length) {
                if (this.Documents.length == 0) {
                    return { success: false, message: "One or more documents required for signing" };
                }
            }
            else {
                return { success: false, message: "One or more documents required for signing" };
            }
        }
        else {
            return { success: false, message: "Documents must be a numeric array of document ids to be signed" };
        }
        if (this.Signers.length) {
            if (this.Signers.length > 0) {
                for (var i = 0; i < this.Signers.length; i++) {
                    if (this.Signers[i]) {
                        if (this.Signers[i].Email == "" || this.Signers[i].Email == null) {
                            return { success: false, message: "Email address is required for all signers" };
                        }
                        /*if (this.Signers[i].SignHere.length == 0) {
                            this.Signers[i].AddSignHere("/sn" + (i + 1) + "/");
                        }
                        if (this.Signers[i].DateHere.length == 0) {
                            this.Signers[i].AddDateHere("/dt" + (i + 1) + "/");
                        }
                        if (this.Signers[i].FullNameHere.length == 0) {
                            this.Signers[i].AddFullNameHere("/fn" + (i + 1) + "/");
                        }*/
                    }
                    tmpSigners.push(this.Signers[i].BuildSignerObj());
                }
            }
            else {
                return { success: false, message: "1 or more signers required" };
            }
        }
        else {
            return { success: false, message: "Signers must be an Array" };
        }
        var Envelope = {
            Organization: this.Organization,
            RecordId: this.RecordId,
            RecordKey: this.RecordKey,
            ReturnDocType: this.ReturnDocType,
            EmailSubject: this.EmailSubject,
            Message: this.Message,
            Signers: tmpSigners,
            Documents: this.Documents,
            CCs: this.CCs
        };

        return httpPostJsonToService(this.URL, Envelope, this.APIKEY);
    }

}

function httpPostJsonToService(url, postObj, apikey) {
    if(!apikey) {
        apikey = "";
    }
    var map = aa.httpClient.initPostParameters();
    resp = {};
    map.put("Content-Type", "application/json");
    if(apikey != ""){
        map.put("X-API-Key", apikey);
    }
    var contents = JSON.stringify(postObj);

    logDebug("******************");
    logDebug("POST: " + url);
    logDebug("Contents: " + contents);
    logDebug("******************");

    //return { success: true, message:"TEST MODE" };
    var resp = aa.httpClient.post(url, map, contents);
    if (resp.getSuccess()) {
        respString = String(resp.getOutput());
        logDebug("Response: " + respString);
        try {
            resp = JSON.parse(respString);
        }
        catch (err) {
            logDebug("Failed to parse JSON " + err.message);
            return { success: false, message: "Failed to parse JSON " + err.message };
        }
    }
    else {
        logDebug("Failed to post " + resp.getErrorMessage());
        return { success: false, message: "Failed to post " + resp.getErrorMessage() };
    }
    return { success: true, message: String(resp) };

}

/**
 * Uses script tester and executs the script in the code section
 * requires EVENT_FOR_ASYNC.js
 * @param {*} pScriptName
 * @param {*} pRecordId
 * @param {*} pCurrentUserId
 */
function runAsyncEvent(pScriptName,pRecordId,pCurrentUserId){
    var parameters = aa.util.newHashMap();
    if(pCurrentUserId==null){
        pCurrentUserId=currentUserID;
    }
    parameters.put("recordId",pRecordId);
    parameters.put("AsyncScriptName",pScriptName);
    parameters.put("currentUserID",pCurrentUserId);

    aa.runAsyncScript("EVENT_FOR_ASYNC", parameters);
}

function generateReportSavetoEDMS(itemCap, reportName, rModule, parameters) {
	// Specific to MIS
	var capIdStr = String(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
	// var capIdStr = "";

    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();

    report.setModule(rModule);
    report.setCapId(capIdStr);

	  // specific to MIS
      report.setReportParameters(parameters);
      var ed1 = report.getEDMSEntityIdModel();
      ed1.setCapId(capIdStr);
      // Needed to determine which record the document is attached
      ed1.setAltId(itemCap.getCustomID());
      // Needed to determine which record the document is attached
      report.setEDMSEntityIdModel(ed1);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);

       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function editLookup(stdChoice,stdValue,stdDesc) {
	//check if stdChoice and stdValue already exist; if they do, update;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	if (bizDomScriptResult.getSuccess())
		{
		var bds = bizDomScriptResult.getOutput();
		}
	else
		{
		aa.print("Std Choice(" + stdChoice + "," + stdValue + ") does not exist to edit, adding...");
		addLookup(stdChoice,stdValue,stdDesc);
		return false;
		}
	var bd = bds.getBizDomain()
	bd.setAuditStatus("A")
	bd.setDescription(stdDesc);
	var editResult = aa.bizDomain.editBizDomain(bd)

	if (editResult.getSuccess())
		aa.print("Successfully edited Std Choice(" + stdChoice + "," + stdValue + ") = " + stdDesc);
	else
		aa.print("**ERROR editing Std Choice " + editResult.getErrorMessage());
}

function validateFromCSLBEng(licNum, itemCap, recordType) {


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
        var lpCSLBErrors = [];
        var emailErrors = [];

        if (typeof licNum == "object") {
            // is this one an object or string?
            licObj = licNum;
            licNum = licObj.getLicenseNbr();
            // explore(licObj);
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
            lpCSLBErrors.push("Status not clear for " + licUrl + " status: " + lpStatus);
            emailErrors.push("Status not clear for " + licNum + " status: " + lpStatus);
        }

        var ExpirationDate = XMLTagValue(result, "ExpirationDate");
        if (ExpirationDate) {
            var cslbExpDate = new Date(ExpirationDate);
            if(cslbExpDate <= checkDate) {
                lpCSLBErrors.push(licUrl + " License date has expired in CSLB: " + ExpirationDate);
                emailErrors.push(licNum + " License date has expired in CSLB: " + ExpirationDate);
            }
        }

        var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
        if (PolicyExpirationDate) {
            var workersCompExpDate = new Date(PolicyExpirationDate);
            if(workersCompExpDate <= checkDate) {
                lpCSLBErrors.push(licUrl + " Workers Comp date has expired in CSLB: " + PolicyExpirationDate);
                emailErrors.push(licNum + " Workers Comp date has expired in CSLB: " + PolicyExpirationDate);
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
        if(!recordType) {
            var recordCap = aa.cap.getCapID(itemCap).getOutput();
            if(recordCap) {
                recordType = String(recordCap.getCapType());
            }
        }
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
                var classification = String(ClassificationList[classificationIndex]).toUpperCase().trim();
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
            logDebug("Prior error list length: " + lpCSLBErrors.length);
            lpCSLBErrors = lpCSLBErrors.concat(classErrors);
            logDebug("New error list length: " + lpCSLBErrors.length);
        }
        if(lpCSLBErrors.length > 0) {
            //check for condition if not condition apply condition;
            //CASANLEAN-3004
            if(!checkLPHasCondition(licNum, "Contractor CSLB Information Expired")) {
                addLicenseCondition("Engineering", "Not Met", "Contractor CSLB Information Expired", emailErrors.join("\n"), "Notice", licNum);
                if(licObj && itemCap) {
                    var lpEmail = licObj.email;
                    var capDetail = aa.cap.getCapDetail(itemCap).getOutput();
                    var currentAssignedStaff = capDetail.getAsgnStaff();
                    logDebug("Assigned staff: " + currentAssignedStaff);
                    var staffUser = aa.person.getUser(currentAssignedStaff).getOutput();
                    var staffEmail = staffUser.email;
                    //CASANLEAN-3005
                    if(lpEmail && staffEmail) {
                        var emailParams = aa.util.newHashtable();
                        emailParams.put("$$licNum$$", String(licNum));
                        emailParams.put("$$expiredData$$", emailErrors.join("\n"));
                        emailParams.put("$$businessName$$", String(licObj.businessName));
                        emailParams.put("$$altId$$", String(itemCap.getCustomID()));
                        logDebug("Sending email to: " + lpEmail);
                        logDebug("Staff CC: " + staffEmail);
                        sendNotification("", String(lpEmail), String(staffEmail), "ENG_CSLB_EXPIRED_CONTRACTOR_INFO", emailParams, [], itemCap);
                    }
                }
            } else {
                logDebug(licNum + " already has condition");
            }
        }
        expiredLPs = expiredLPs.concat(lpCSLBErrors);
    } // for each license
    return expiredLPs;
}

function checkLPHasCondition(lpNumber, conditionName) {
    var refLp = getRefLicenseProf(lpNumber);
    if(!refLp) {
        logDebug("Unable to get ref lp from " + lpNumber);
        return true;
    }
    var licSeq = refLp.getLicSeqNbr();
    logDebug("Sequence number: " + licSeq);
    var conditions = aa.caeCondition.getCAEConditions(licSeq);
    if(conditions.getSuccess()) {
        conditions = conditions.getOutput();
        logDebug("Condition: " + conditions.length);
        for(var cond in conditions) {
            var condObj = conditions[cond];
            var condObjName = condObj.conditionDescription;
            // var condComment = condObj.conditionComment;
			// var condStatus = condObj.conditionStatus;
            var condStatusType = condObj.conditionStatusType;
            // logDebug(conditionName + " : " + condObjName);
            // logDebug(String(condObjName) == String(conditionName));
            // explore(condObj);
            if(String(conditionName).toLowerCase() == String(condObjName).toLowerCase() && condStatusType == "Applied") {
                return true;
            }
        }
    } else {
        logDebug("Unable to get conditions from " + lpNumber);
        return false;
    }
}

//GQ CSLB INTERFACE
function validateLPWithCSLB(licenseNumber, itemCap, checkExpDate, checkWCDate, checkBondDate, checkClassifications, appType) {
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
        var refLp = grabReferenceLicenseProfessional(licNum);
        var referenceSeqNumber = null;
        if(!refLp) {
            var createReference = lookup("GRAYQUARTER", "CREATE_REFERENCE_LP");
            if(createReference == "YES") {
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
            value = String(value).replace(/&amp;/g, "&");
        }
        if(tag == "PhoneNumber") {
            value = String(value).replace(/[^\d]/g, "");
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

function grabReferenceLicenseProfessional(licenseNumber) {
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
    for (var refLpIndex in referenceLpArray) {
        var refLPObject = referenceLpArray[refLpIndex];
        var auditStatus = refLPObject.auditStatus;
        if(auditStatus == "A") {
            return refLPObject;
        }
    }
    return false;
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
    var refLp = grabReferenceLicenseProfessional(licNum);
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
    var refLp = grabReferenceLicenseProfessional(licenseNumber);
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

function getRefrenceLPRecords(licenseNum, refLpObj) {
    var referenceLPModel = refLpObj;
    var records = [];
    if(!refLpObj && licenseNum) {
        referenceLPModel = grabReferenceLicenseProfessional(licenseNum);
    }
    if(!referenceLPModel) {
        logDebug("Did not have reference LP model so returned 0 records");
        return records;
    }
    var recordsResult = aa.licenseScript.getCapIDsByLicenseModel(referenceLPModel);
    if(!recordsResult.getSuccess()) {
        logDebug("Grabbing record ids failed for " + referenceLPModel.stateLicense);
        return records;
    }
    var records = recordsResult.getOutput();
    if(!records) {
        logDebug("Output for grabbing records returned null");
        return [];
    }
    logDebug("Returned " + records.length + " records for " + referenceLPModel.stateLicense) ;
    return records.map(function(capScript) {
        return aa.cap.getCapID(capScript.getID1(), capScript.getID2(), capScript.getID3()).getOutput();
    });
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

function syncReferenceLPToRecord(itemCap, licenseNum, refLpModel) {

    if(!itemCap) {
        logDebug("No record provided not sycing reference lp");
        return false;
    }
    var referenceLP = refLpModel;
    if(!refLpModel && licenseNum) {
        referenceLP = grabReferenceLicenseProfessional(licenseNum);
    }
    if(!referenceLP) {
        logDebug("Did not have reference LP model so could not update " + itemCap.getCustomID());
        return false;
    }
    var foundLicenseNumber = referenceLP.stateLicense;
    var transactionalLpModel = grabTransactionalLicenseProfessional(foundLicenseNumber, itemCap);
    if(!transactionalLpModel) {
        return false;
    }
    var foundPrimary = transactionalLpModel.printFlag == "Y" ? true : false;
    if(foundPrimary) {
        transactionalLpModel.setPrintFlag("N");
        var updateResult = aa.licenseProfessional.editLicensedProfessional(transactionalLpModel);
        if(updateResult.getSuccess()) {
            logDebug("Successfully made " + foundLicenseNumber + " not primary");
        } else {
            logDebug("Failed to update " + foundLicenseNumber + " " + removeResult.getErrorType() + " : " + removeResult.getErrorMessage());
        }
    }
    var removedLP = false;
    var removeResult = aa.licenseProfessional.removeLicensedProfessional(transactionalLpModel);
    if(removeResult.getSuccess()) {
        logDebug("Successfully removed transactional lp " + foundLicenseNumber);
        removedLP = true;
    } else {
        logDebug("Failed to remove " + foundLicenseNumber + " " + removeResult.getErrorType() + " : " + removeResult.getErrorMessage());
    }

    if(removedLP) {
        var addResult = aa.licenseScript.associateLpWithCap(itemCap, referenceLP);
        if(!addResult.getSuccess()) {
            logDebug("Unable to add reference lp adding back transactional " + addResult.getErrorType() + " " + addResult.getErrorMessage());
            return false;
        }
        logDebug("Added reference " + foundLicenseNumber + " to " + itemCap.getCustomID());
        if(foundPrimary) {
            //get new transactional
            var newTransactionalRefLP = grabTransactionalLicenseProfessional(foundLicenseNumber, itemCap);
            newTransactionalRefLP.setPrintFlag("Y");
            var updateResult = aa.licenseProfessional.editLicensedProfessional(newTransactionalRefLP);
            if(updateResult.getSuccess()) {
                logDebug("Successfully made " + foundLicenseNumber + " primary");
            } else {
                logDebug("Failed to update " + foundLicenseNumber + " " + removeResult.getErrorType() + " : " + removeResult.getErrorMessage());
            }
        }
    }
    return true;
}

function syncTransactionalLPToReferenceLP(transLicNum, transObj) {
    var refObj = grabReferenceLicenseProfessional(transLicNum);
    if(!refObj) {
        logDebug("Unable to sync transactional due to no reference found");
        //TODO: Additional functionality can create reference from transactional?
        return false;
    }
    if (transObj.getAddress1())
        refObj.setAddress1(transObj.getAddress1());
    if (transObj.getAddress2())
        refObj.setAddress2(transObj.getAddress2());
    if (transObj.getAddress3())
        refObj.setAddress3(transObj.getAddress3());
    if (transObj.getAgencyCode())
        refObj.setAgencyCode(transObj.getAgencyCode());
    if (transObj.getBusinessLicense())
        refObj.setBusinessLicense(transObj.getBusinessLicense());
    if (transObj.getBusinessName())
        refObj.setBusinessName(transObj.getBusinessName());
    if (transObj.getBusName2())
        refObj.setBusinessName2(transObj.getBusName2());
    if (transObj.getCity())
        refObj.setCity(transObj.getCity());
    if (transObj.getCityCode())
        refObj.setCityCode(transObj.getCityCode());
    if (transObj.getComment())
        refObj.setComment(transObj.getComment());
    if (transObj.getContactFirstName())
        refObj.setContactFirstName(transObj.getContactFirstName());
    if (transObj.getContactLastName())
        refObj.setContactLastName(transObj.getContactLastName());
    if (transObj.getContactMiddleName())
        refObj.setContactMiddleName(transObj.getContactMiddleName());
    if (transObj.getCountryCode())
        refObj.setContryCode(transObj.getCountryCode());
    if (transObj.getEmail())
        refObj.setEMailAddress(transObj.getEmail());
    if (transObj.getCountry())
        refObj.setCountry(transObj.getCountry());
    if (transObj.getEinSs())
        refObj.setEinSs(transObj.getEinSs());
    if (transObj.getFax())
        refObj.setFax(transObj.getFax());
    if (transObj.getFaxCountryCode())
        refObj.setFaxCountryCode(transObj.getFaxCountryCode());
    if (transObj.getHoldCode())
        refObj.setHoldCode(transObj.getHoldCode());
    if (transObj.getHoldDesc())
        refObj.setHoldDesc(transObj.getHoldDesc());
    if (transObj.getLicenseExpirDate())
        refObj.setLicenseExpirationDate(transObj.getLicenseExpirDate());
    if (transObj.getLastRenewalDate())
        refObj.setLicenseLastRenewalDate(transObj.getLastRenewalDate());
    if (transObj.getLicesnseOrigIssueDate())
        refObj.setLicOrigIssDate(transObj.getLicesnseOrigIssueDate());
    if (transObj.getPhone1())
        refObj.setPhone1(transObj.getPhone1());
    if (transObj.getPhone1CountryCode())
        refObj.setPhone1CountryCode(transObj.getPhone1CountryCode());
    if (transObj.getPhone2())
        refObj.setPhone2(transObj.getPhone2());
    if (transObj.getPhone2CountryCode())
        refObj.setPhone2CountryCode(transObj.getPhone2CountryCode());
    if (transObj.getSelfIns())
        refObj.setSelfIns(transObj.getSelfIns());
    if (transObj.getState())
        refObj.setState(transObj.getState());
    if (transObj.getSuffixName())
        refObj.setSuffixName(transObj.getSuffixName());
    if (transObj.getZip())
        refObj.setZip(transObj.getZip());

    var myResult = aa.licenseScript.editRefLicenseProf(refObj);
    if(myResult.getSuccess()) {
        logDebug("Successfully updated reference LP " + transLicNum);
    }
    return refObj;
}