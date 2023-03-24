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
    
    var endpoint = "https://www.dl.dropboxusercontent.com/s/wt167p02lnh3s9z/lps_SL.js";//Permits URL
    var json = JSON.parse(aa.httpClient.get(endpoint).getOutput());  

    aa.print("JSON Length: " + json.length);
    var lpMap = {};
    var sample = 5;    
    var success = 0;
    var collection = [];
    for(var i = (json.length - 1); i >= 0; i--) {
        var sqlObj = json[i];
        var errorMessage = [];        
        var licSeqNbr = null;
        //Scrub data of all null values
        scrubData(sqlObj);    

        //Skip if we are already a ref lp
        var refLicSeq = sqlObj.LIC_SEQ_NBR;
        if(refLicSeq) {
            continue;
        }

        var licNum = sqlObj.B1_LICENSE_NBR;        
        if(licNum == "NO LIC" || licNum == "?" || licNum == "NOT LICENSED" || licNum == "temp") {
            continue;   
        }
        licNum = String(licNum).toUpperCase();

        //load capId and LP list
        var capId = aa.cap.getCapID(sqlObj.B1_PER_ID1, "00000", sqlObj.B1_PER_ID3).getOutput();
        var transLPList = aa.licenseScript.getLicenseProf(capId).getOutput();        
        if(!transLPList || transLPList.length == 0) {
            continue;
        }
        logDebug(capId.getCustomID() + " LPS: " + transLPList.length);        

        //Search LP List and parse out transactional LP
        var lastUpdateOnTrans = null;
        var transModel = null;        
        for(var transIndex in transLPList) {
            var transLP = transLPList[transIndex];//LicenseProfessionalScriptModel
            //logDebug(licNum + " =? " + transLP.licenseNbr);
            if(licNum != transLP.licenseNbr) {
                continue;
            }
            //var transLPModel = transLP.licenseProfessionalModel;//LicenseProfessionalModel
            var transAuditDate = transLP.auditDate;
            if(transAuditDate) {
                lastUpdateOnTrans = new Date(transAuditDate.getEpochMilliseconds());
                transModel = transLP;
                //props(transModel);
            }            
        }

        var licType = sqlObj.B1_LICENSE_TYPE;

        if(!transModel) {
            errorMessage.push("Data out of sync " + licNum + " does not exist on " + capId.getCustomID());
            collection.push({
                rec_id: String(capId.getCustomID()),            
                lic_num: String(licNum),
                lic_type: String(licType),
                ref_seq_num: String(licSeqNbr),
                error_message: String(errorMessage.join(", ")),
            });
            continue;
        }
        //if LP does not exist in ref map set it        
        var lpKey = licNum + "|" + licType; 
        if(!lpMap[lpKey]) {
            if(lastUpdateOnTrans) {
                lpMap[lpKey] = lastUpdateOnTrans;
            } else {
                lpMap[lpKey] = new Date();
            }
        }            
        //Check for exisitng ref and compare dates
        //licNum = "1005688";
        var existingRef = getRefLicenseProf(licNum);
        if(existingRef) {
            logDebug("Found existing ref");
            licSeqNbr = syncDataFromTransToRef(transModel, existingRef, licNum);
            populateFromRefLP(licSeqNbr, transLPList, capId, licNum, licType);
        } else {
            //create ref
            logDebug("No reference LP creating...");
            if(licType == "Contractor") {
                logDebug("Creating contractor...");
                var message = externalLP_SLCA(licNum, licType, true, true, capId);
                var skipped = false;
                if(String(message).indexOf("CLSB returns no data") >= 0) {
                    logDebug("Skipping as contractor does not exist in CSLB");                    
                    errorMessage.push("Skipping as " + licNum + " " + licType + " does not exist in CSLB");
                    skipped = true;
                }
                //logDebug(message);                
                if(!skipped) {
                    logDebug("Finished updating ref LP for " + capId.getCustomID());
                    var newRef = getRefLicenseProf(licNum);
                    //logDebug(newRef);
                    licSeqNbr = newRef.getLicSeqNbr()
                    if(newRef) {
                        logDebug("Created Ref for " + licNum);
                        syncDataFromTransToRef(transModel, newRef, licNum);
                    } else {
                        errorMessage.push("Still could not find ref for row " + i);
                    }
                }
            } else {
                logDebug("Creating ref " + licType + " for " + licNum)
                licSeqNbr = createReferenceLicenseProf(transModel, licNum, licType);
                populateFromRefLP(licSeqNbr, transLPList, capId, licNum, licType);
            }            
        }        
        //props(sqlObj);
        collection.push({
            rec_id: String(capId.getCustomID()),            
            lic_num: String(licNum),
            lic_type: String(licType),
            ref_seq_num: String(licSeqNbr),
            error_message: String(errorMessage.join(", ")),
        });

        //testing
        // if(!errorMessage.length) {
        //     success += 1;
        // }        
        // if(success >= sample) {
        //     break;
        // }
    }
    aa.print(JSON.stringify(collection));
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
                logDebug("Removing license: " + thisLP.getLicenseNbr() + " from CAP.  We will link the new reference LP");
                if (thisLP.getPrintFlag() == "Y") {
                    logDebug("...remove primary status...");
                    isPrimary = true;
                    thisLP.setPrintFlag("N");
                    aa.licenseProfessional.editLicensedProfessional(thisLP);
                }
                var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
                if (remCapResult.getSuccess()) {
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
            var thisCapLp = capLps[thisCapLpNum];
            if (thisCapLp.getLicenseNbr().equals(licNum)) {
                thisCapLp.setPrintFlag("Y");
                aa.licenseProfessional.editLicensedProfessional(thisCapLp);
                logDebug("Updated primary flag on Cap LP : " + licNum);
            }
        }
    }
}

function scrubData(sqlRow) {
    for(var sqlIndex in sqlRow) {
        var value = sqlRow[sqlIndex];
        if(!value || value == "NULL" || String(value).length == 0) {
            sqlRow[sqlIndex] = "";
        } else {
            sqlRow[sqlIndex] = String(value).trim();
        }
    }    
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