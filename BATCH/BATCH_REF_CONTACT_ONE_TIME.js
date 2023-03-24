var myCapId = "";
var myUserId = "ADMIN";
var eventName = "";

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.
/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1());  aa.env.setValue("PermitId2",tmpID.getID2());    aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {     useSA = true;       SA = bzr.getOutput().getDescription();  bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");     if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }  }if (SA) {  eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));   eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript)); /* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript)); }else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));   }   eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {   doStandardChoiceActions2(controlString,false,0);    aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");  aa.abortScript();   }var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";  }   function getScriptText(vScriptName, servProvCode, useProductScripts) {  if (!servProvCode)  servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase();    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();  try {       if (useProductScripts) {            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);     } else {            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");      }       return emseScript.getScriptText() + ""; } catch (err) {     return "";  }}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z);

// aa.env.setValue("Param1", "Value");//test params

// var param = String(aa.env.getValue("Param1"))//always come back as an object so use conversion

try {
    showDebug = false;
    
    //aa.sendMail("tnabc@no-reply.com", "sal@grayquarter.com","","title","content");

    var count = 0;
    var start = new Date();
    
    //Code
    mainProccess();

    var end = new Date();
    var seconds = (end.getTime() - start.getTime())/1000;
    logDebug("Script time = " + seconds + " seconds");
    aa.print("Script time = " + seconds + " seconds");
    
    
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
    aa.print("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
}
// end user code
if(showDebug) {
    aa.env.setValue("ScriptReturnCode", "0");   
    aa.env.setValue("ScriptReturnMessage", debug);
}

function mainProccess() {
        
    var endpoint = "https://www.dl.dropboxusercontent.com/s/cqwl9l14qohrtkq/contacts_SL.js";//Permits URL
    var data = aa.httpClient.get(endpoint).getOutput();
    //props(data);
    //logDebug(aa.httpClient.get(endpoint).getOutput())
    var json = JSON.parse(data);
    logDebug(json.length);
    //props(json[0]);

    var contactMap = {};
    var test = 10;
    var collection = [];
    for(var contactIndex in json) {        
        var sqlObj = json[contactIndex];
        var rowId = (parseInt(contactIndex, 10) + 1);                
        scrubData(sqlObj);
        if(sqlObj.G1_CONTACT_NBR) {
            continue;
        }

        var fullName = sqlObj.B1_FULL_NAME;
        var phone = sqlObj.B1_PHONE1;
        var email = sqlObj.B1_EMAIL;

        if(!fullName && !phone && !email) {
            logDebug(rowId + " row doesn't have good contact data");
            continue;
        }

        var fullNameKey = "";
        var phoneKey = "";
        var emailKey = "";
        var refId = null;
        var foundACAUser = false;
        if(fullName) {
            fullNameKey = String(fullName).trim().toLowerCase();
        }
        if(phone) {
            phoneKey = String(phone).trim().toLowerCase();
        }
        if(email) {            
            emailKey = String(email).trim().toLowerCase();
        }        
        if(!fullName || (!phone && !email)) {
            logDebug("Need to have phone or email to create ref");
            continue;
        }
        var contactKey = fullNameKey + "|" + phoneKey + "|" + emailKey;
        logDebug(contactKey);
        if(!contactMap[contactKey]) {
            
            //email = "sal@grayquarter.com";
            if(email) {
                var publicUser = aa.publicUser.getPublicUserByEmail(email)                
                if(publicUser.getSuccess()) {
                    publicUser = publicUser.getOutput();
                    if(publicUser) {
                        var userSeq = parseInt(String(publicUser.getUserSeqNum()), 10);                        
                        var contactListResult = aa.people.getUserAssociatedContact(userSeq);
                        if (contactListResult.getSuccess()) {
                            var contactList = contactListResult.getOutput().toArray();
                            for (var puContactIndex in contactList){
                                //logDebug("Found associated contact " + contactList[i].firstName);
                                var contactModel = contactList[puContactIndex];
                                refId = contactModel.getContactSeqNumber()
                                if (refId){
                                    logDebug("Found refId by PU using " + email + " : " +refId)
                                    foundACAUser = true;
                                    break;
                                }
                            }
                            //Sometimes there is no account owner, just take the first
                        } else {
                            logDebug("Failed to find contacts for public user. Error was: " + contactListResult.getErrorMessage());
                        }
                    }
                }
            }

            if(!foundACAUser && !refId) {
                //create contact and add key
                refId = createRefContact(sqlObj);
                if(!refId) {
                    logDebug("Error creating ref contact: " + rowId);
                    continue;
                }
            }
            contactMap[contactKey] = refId;

        } else {
            refId = contactMap[contactKey];
            syncMissingRefData(refId, sqlObj);
        }       

        if(!refId) {
            logDebug("Failed to do anything with ref id " + rowId);
            continue;
        }
        
        var dbId = sqlObj.B1_PER_ID1 +  "-00000-" + (zeroPad(sqlObj.B1_PER_ID3, 5));
        var capId = aa.cap.getCapID(sqlObj.B1_PER_ID1, "00000", (zeroPad(sqlObj.B1_PER_ID3, 5))).getOutput();
        if(!capId) {
            logDebug("Failed to fetch capId " + dbId + " " + rowId);
            continue;
        }
        var altId = capId.getCustomID();
        // //remove contact
        var removeResult = aa.people.removeCapContact(capId, sqlObj.B1_CONTACT_NBR);
        if(removeResult.getSuccess()) {
            logDebug("Removed transaction " + contactKey + " " + altId);
        }

        // //add new ref
        var refPeople = aa.people.getPeople(refId).getOutput();
        refPeople.setContactType(sqlObj.B1_CONTACT_TYPE);
        refPeople.setFlag(sqlObj.B1_FLAG);
        var result = aa.people.createCapContactWithRefPeopleModel(capId, refPeople);
        if (result.getSuccess()) {
            logDebug("Successfully added " + contactKey + " contact to record " + altId);
        } else {
            logDebug("Error creating the contact " + result.getErrorMessage());
        }

        collection.push({
            id: String(altId),
            contact_key: String(contactKey),
            ref_id: String(refId),
            existing_pubilc_user: foundACAUser,
        })

        // if(rowId >= test) {
            // break;
        // }        
    }
    aa.print("Size: " + collection.length);
    aa.print(JSON.stringify(collection));

}

function zeroPad(text, expected) {
    if(text.length == expected) {
        return text;
    } else if(text.length > expected) {
        return String(text).substring(0, (expected + 1));
    } else {    
        var amountToPad = expected - text.length;
        var paddedString = "";
        for(var padIndex = 0; padIndex < amountToPad; padIndex++) {
            paddedString += "0";
        }
        return paddedString + text;
    }
}

function syncMissingRefData(refId, dataRow) {
    var refPeople = aa.people.getPeople(refId).getOutput();
    if (!refPeople.getPhone1CountryCode() && dataRow.B1_PHONE1_COUNTRY_CODE) {
        refPeople.setPhone1CountryCode(dataRow.B1_PHONE1_COUNTRY_CODE);
    }
    if (!refPeople.getHoldCode() && dataRow.B1_HOLD_CODE) {
        refPeople.setHoldCode(dataRow.B1_HOLD_CODE);
    }
    if (!refPeople.getGender() && dataRow.B1_GENDER) {
        refPeople.setGender(dataRow.B1_GENDER);
    }
    if (!refPeople.getPassportNumber() && dataRow.B1_PASSPORT_NBR) {
        refPeople.setPassportNumber(dataRow.B1_PASSPORT_NBR);
    }
    if (!refPeople.getRace() && dataRow.B1_RACE) {
        refPeople.setRace(dataRow.B1_RACE);
    }
    if (!refPeople.getDriverLicenseState() && dataRow.B1_DRIVER_LICENSE_STATE) {
        refPeople.setDriverLicenseState(dataRow.B1_DRIVER_LICENSE_STATE);
    }
    if (!refPeople.getHoldDescription() && dataRow.B1_HOLD_DES) {
        refPeople.setHoldDescription(dataRow.B1_HOLD_DES);
    }
    if (!refPeople.getBusName2() && dataRow.B1_BUSINESS_NAME2) {
        refPeople.setBusName2(dataRow.B1_BUSINESS_NAME2);
    }
    if (!refPeople.getMiddleName() && dataRow.B1_MNAME) {
        refPeople.setMiddleName(dataRow.B1_MNAME);
    }
    if (!refPeople.getBirthState() && dataRow.B1_BIRTH_STATE) {
        refPeople.setBirthState(dataRow.B1_BIRTH_STATE);
    }
    if (!refPeople.getComment() && dataRow.B1_COMMENT) {
        refPeople.setComment(dataRow.B1_COMMENT);
    }
    if (!refPeople.getCountry() && dataRow.B1_COUNTRY) {
        refPeople.setCountry(dataRow.B1_COUNTRY);
    }
    if (!refPeople.getTitle() && dataRow.B1_TITLE) {
        refPeople.setTitle(dataRow.B1_TITLE);
    }
    if (!refPeople.getPhone2CountryCode() && dataRow.B1_PHONE2_COUNTRY_CODE) {
        refPeople.setPhone2CountryCode(dataRow.B1_PHONE2_COUNTRY_CODE);
    }
    if (!refPeople.getEmail() && dataRow.B1_EMAIL) {
        refPeople.setEmail(dataRow.B1_EMAIL);
    }
    if (!refPeople.getFirstName() && dataRow.B1_FNAME) {
        refPeople.setFirstName(dataRow.B1_FNAME);
    }
    if (!refPeople.getCountryCode() && dataRow.B1_COUNTRY_CODE) {
        refPeople.setCountryCode(dataRow.B1_COUNTRY_CODE);
    }
    if (!refPeople.getDriverLicenseNbr() && dataRow.B1_DRIVER_LICENSE_NBR) {
        refPeople.setDriverLicenseNbr(dataRow.B1_DRIVER_LICENSE_NBR);
    }
    if (!refPeople.getPhone1() && dataRow.B1_PHONE1) {
        refPeople.setPhone1(dataRow.B1_PHONE1);
    }
    if (!refPeople.getPhone2() && dataRow.B1_PHONE2) {
        refPeople.setPhone2(dataRow.B1_PHONE2);
    }
    if (!refPeople.getPhone3() && dataRow.B1_PHONE3) {
        refPeople.setPhone3(dataRow.B1_PHONE3);
    }
    if (!refPeople.getBusinessName() && dataRow.B1_BUSINESS_NAME) {
        refPeople.setBusinessName(dataRow.B1_BUSINESS_NAME);
    }
    if (!refPeople.getSalutation() && dataRow.B1_SALUTATION) {
        refPeople.setSalutation(dataRow.B1_SALUTATION);
    }
    if (!refPeople.getBirthCity() && dataRow.B1_BIRTH_CITY) {
        refPeople.setBirthCity(dataRow.B1_BIRTH_CITY);
    }
    if (!refPeople.getBusinessName2() && dataRow.B1_BUSINESS_NAME2) {
        refPeople.setBusinessName2(dataRow.B1_BUSINESS_NAME2);
    }
    if (!refPeople.getLastName() && dataRow.B1_LNAME) {
        refPeople.setLastName(dataRow.B1_LNAME);
    }
    if (!refPeople.getTradeName() && dataRow.B1_TRADE_NAME) {
        refPeople.setTradeName(dataRow.B1_TRADE_NAME);
    }
    if (!refPeople.getFax() && dataRow.B1_FAX) {
        refPeople.setFax(dataRow.B1_FAX);
    }
    if (!refPeople.getFaxCountryCode() && dataRow.B1_FAX_COUNTRY_CODE) {
        refPeople.setFaxCountryCode(dataRow.B1_FAX_COUNTRY_CODE);
    }
    if (!refPeople.getPostOfficeBox() && dataRow.B1_POST_OFFICE_BOX) {
        refPeople.setPostOfficeBox(dataRow.B1_POST_OFFICE_BOX);
    }
    if (!refPeople.getPhone3CountryCode() && dataRow.B1_PHONE3_COUNTRY_CODE) {
        refPeople.setPhone3CountryCode(dataRow.B1_PHONE3_COUNTRY_CODE);
    }
    if (!refPeople.getRelation() && dataRow.B1_RELATION) {
        refPeople.setRelation(dataRow.B1_RELATION);
    }
     
    var result = aa.people.editPeople(refPeople).getOutput();
    logDebug(result);
    return refId;
}

function scrubData(sqlRow) {
    for(var sqlIndex in sqlRow) {
        var value = sqlRow[sqlIndex];
        if(!value || value == "NULL" || String(value).length == 0) {
            sqlRow[sqlIndex] = "";
        }
    }    
}

function createRefContact(sqlData) {
    var peopleModel = aa.people.createPeopleModel().getOutput().peopleModel;

    // SERV_PROV_CODE: SANLEANDRO
    // sqlData.B1_PER_ID1: 00HIS
    // sqlData.B1_PER_ID2: 0
    // sqlData.B1_PER_ID3: 009W7
    // sqlData.B1_CONTACT_NBR: 412
    // sqlData.B1_CONTACT_TYPE: Applicant
    // sqlData.B1_TITLE: NULL
    // sqlData.B1_FNAME: BRUCE
    // sqlData.B1_MNAME: NULL
    // sqlData.B1_LNAME: BARNES
    // sqlData.B1_FULL_NAME: BRUCE BARNES
    // sqlData.B1_RELATION: NULL
    // sqlData.B1_BUSINESS_NAME: NULL
    // sqlData.B1_ADDRESS1: 590 DUTTON AV
    // sqlData.B1_ADDRESS2: NULL
    // sqlData.B1_ADDRESS3: NULL
    // sqlData.B1_CITY: SAN LEANDRO
    // sqlData.B1_STATE: CA
    // sqlData.B1_ZIP: 94577
    // sqlData.B1_COUNTRY: NULL
    // sqlData.B1_PHONE1: 510-638-1622
    // sqlData.B1_PHONE2: NULL
    // sqlData.B1_FAX: NULL
    // sqlData.B1_EMAIL: NULL
    // sqlData.B1_ID: NULL
    // sqlData.B1_HOLD_CODE: NULL
    // sqlData.B1_HOLD_DES: NULL
    // sqlData.B1_UDF1: NULL
    // sqlData.B1_UDF2: NULL
    // sqlData.B1_UDF3: NULL
    // sqlData.B1_UDF4: NULL
    // sqlData.B1_FLAG: Y
    // sqlData.B1_COMMENT: NULL
    // sqlData.REC_DATE: 15:27.0
    // sqlData.REC_FUL_NAM: AA CONV
    // sqlData.REC_STATUS: A
    // sqlData.G1_NAME_SUFFIX: NULL
    // sqlData.G1_CONTACT_NBR: NULL
    // sqlData.B1_PREFERRED_CHANNEL: NULL
    // sqlData.B1_NOTIFY_FLAG: NULL
    // sqlData.B1_COUNTRY_CODE: NULL
    // sqlData.B1_PHONE3: NULL
    // sqlData.B1_SALUTATION: NULL
    // sqlData.B1_GENDER: NULL
    // sqlData.B1_POST_OFFICE_BOX: NULL
    // sqlData.B1_BIRTH_DATE: NULL
    // sqlData.B1_PHONE1_COUNTRY_CODE: NULL
    // sqlData.B1_PHONE2_COUNTRY_CODE: NULL
    // sqlData.B1_PHONE3_COUNTRY_CODE: NULL
    // sqlData.B1_FAX_COUNTRY_CODE: NULL
    // sqlData.B1_SOCIAL_SECURITY_NUMBER: NULL
    // sqlData.B1_FEDERAL_EMPLOYER_ID_NUM: NULL
    // sqlData.B1_TRADE_NAME: NULL
    // sqlData.B1_CONTACT_TYPE_FLAG: NULL
    // sqlData.B1_COMPONENT_NAME: NULL
    // sqlData.B1_ACCESS_LEVEL: NULL
    // sqlData.B1_START_DATE: NULL
    // sqlData.B1_END_DATE: NULL
    // sqlData.B1_BUSINESS_NAME2: NULL
    // sqlData.B1_BIRTH_CITY: NULL
    // sqlData.B1_BIRTH_STATE: NULL
    // sqlData.B1_BIRTH_REGION: NULL
    // sqlData.B1_RACE: NULL
    // sqlData.B1_DECEASED_DATE: NULL
    // sqlData.B1_PASSPORT_NBR: NULL
    // sqlData.B1_DRIVER_LICENSE_NBR: NULL
    // sqlData.B1_DRIVER_LICENSE_STATE: NULL
    // sqlData.B1_STATE_ID_NBR: NULL
    // sqlData.B1_INTERNAL_USER_FLAG: NULL
    // sqlData.B1_INTERNAL_USER_ID: NULL
    // sqlData.AUDIT_INIT_DATE: NULL
    // sqlData.AUDIT_INIT_BY: NULL
    // sqlData.AUDIT_MOD_DATE: NULL
    // sqlData.AUDIT_MOD_BY: NULL
    // field75:
    // field76: 

    var contactTypeFlag = sqlData.B1_CONTACT_TYPE_FLAG ? sqlData.B1_CONTACT_TYPE_FLAG : "individual";
    peopleModel.setContactTypeFlag(contactTypeFlag);
    if (contactTypeFlag == "individual") {
        peopleModel.setFirstName(sqlData.B1_FNAME);
        peopleModel.setMiddleName(sqlData.B1_MNAME);
        peopleModel.setLastName(sqlData.B1_LNAME);
    }
    if (contactTypeFlag == "organization") {
        peopleModel.setBusinessName(sqlData.B1_BUSINESS_NAME);
        peopleModel.setTradeName(sqlData.B1_TRADE_NAME);
    }

    peopleModel.setPhone1CountryCode(sqlData.B1_PHONE1_COUNTRY_CODE);
    peopleModel.setPhone1(sqlData.B1_PHONE1);

    peopleModel.setPhone2CountryCode(sqlData.B1_PHONE2_COUNTRY_CODE);
    peopleModel.setPhone2(sqlData.B1_PHONE2);

    peopleModel.setPhone3CountryCode(sqlData.B1_PHONE3_COUNTRY_CODE);
    peopleModel.setPhone3(sqlData.B1_PHONE3);

    peopleModel.setComment(sqlData.B1_COMMENT);

    peopleModel.setContactType(contactTypeFlag);
    peopleModel.setEmail(sqlData.B1_EMAIL);
    peopleModel.setCountryCode(sqlData.B1_COUNTRY_CODE);
    peopleModel.setServiceProviderCode(aa.getServiceProviderCode());
    peopleModel.setAuditID("sguerrero");
    peopleModel.setAuditStatus("A");

    var addr = peopleModel.compactAddress;
    addr.setCity(sqlData.B1_CITY);
    addr.setZip(sqlData.B1_ZIP);
    addr.setCountry(sqlData.B1_COUNTRY);
    addr.setCountryCode(sqlData.B1_COUNTRY_CODE);
    addr.setState(sqlData.B1_STATE);
    addr.setAddressLine1(sqlData.B1_ADDRESS1);
    addr.setAddressLine2(sqlData.B1_ADDRESS2);
    addr.setAddressLine3(sqlData.B1_ADDRESS3);

    peopleModel.compactAddress = addr;    

    var result = aa.people.createPeople(peopleModel);
    if (result.getSuccess() != true) {
        logDebug("Failed to create ref contact. " + result.errorType + ': ' + result.errorMessage);
        return false;
    } else {
        logDebug("Successfully created ref contact");
    }

    result = aa.people.getPeopleByPeopleModel(peopleModel);
    if (result.getSuccess() != true) {
        logDebug("Failed to get ref contact. " + result.errorType + ': ' + result.errorMessage);
        return false;
    }

    var peopleScriptModel = result.getOutput();    
    if(peopleScriptModel.length) {
        peopleScriptModel = peopleScriptModel[0];
        var refContactId = peopleScriptModel.contactSeqNumber;    
        return refContactId;
    }
    return false;
}

function orgExplore(objExplore) {
    logDebug("Methods:")    
    var methodMatch = {};
    for (var test1 in objExplore) {
        if (typeof(objExplore[test1]) == "function") {
            if(String(test1).indexOf("set") >= 0) {
                logDebug("<font color=blue><u><b>" + test1 + "</b></u></font> ");
                var key1 = String(test1).substring(3, String(test1.length));
                //aa.print(key);
                methodMatch[key1] = true;
            }
        }
    }
    for (var test2 in objExplore) {
        if (typeof(objExplore[test2]) == "function") {
            if(String(test2).indexOf("get") >= 0) {
                logDebug("<font color=blue><u><b>" + test2 + "</b></u></font> "); 
                var key2 = String(test2).substring(3, String(test2.length));
                //aa.print(methodMatch[key2] + " : " + key2); 
                if(methodMatch[key2]) {
                    methodMatch[key2] = '"get' + key2 + '"';
                }
            }
        }
    }
    logDebug("");
    // logDebug("Properties:")
    // for (x in objExplore) {
    //     if (typeof(objExplore[x]) != "function") logDebug("  <b> " + x + ": </b> " + objExplore[x]);
    // }
    props(methodMatch);
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

function slack(msg) {
    
    var headers=aa.util.newHashMap();

    headers.put("Content-Type","application/json");
    
    var body = {};	
    body.text = aa.getServiceProviderCode() + ":" + "TEST" + ": " + msg;

    //GQ Slack
    /*var SLACKURL = "https://hooks.slack.com/services/";
    SLACKURL = SLACKURL + "T5BS1375F/";
    SLACKURL = SLACKURL + "BG09GQ3RS/NUs694ouyawHoAFK4jJXwn1p";*/

    //Your slack
    var SLACKURL = "https://hooks.slack.com/services/";
    SLACKURL = SLACKURL + "T02GGPNQ6DN/";
    SLACKURL = SLACKURL + "B02G5QX2649/jcb5fbduFzmtCvjLg1cfKEaQ";

    var apiURL = SLACKURL;  // from globals
    var result = aa.httpClient.post(apiURL, headers, JSON.stringify(body));
    
    if (!result.getSuccess()) {
        logDebug("Slack get anonymous token error: " + result.getErrorMessage());
    } else {	
        aa.print("Slack Results: " + result.getOutput());
    }
}

function slackExplore(objExplore) {
    slack("Methods:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) == "function") {
            slack("" + x + "");
            slack("   " + objExplore[x] + "\n");
        }
    }
    slack("");
    slack("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") slack( x + ": " + objExplore[x] + "\n");
    }
}