(function () {
    try {

        var ignoreRecordTypes = {
            // "Engineering/Encroachment/Containers/NA": true,
            "Engineering/Encroachment/Annual/NA": true,
            "Engineering/Encroachment/Tree/NA": true,
            "Engineering/Utility/Access Only/NA": true,
        }

        if(ignoreRecordTypes[String(appTypeString)]) {
            logDebug("Ignoring PCI condition");
            return;
        }

        var parcels = aa.parcel.getParcelByCapId(capId, null).getOutput();
        parcels = parcels.toArray();
        var pciValue = 0;
        var fcnValue = "";
        var pciField = "PCI_EXTRAPOLATED";
		var fcnField = "FUNCTIONAL_CLASS_NAME";
        for(var i in parcels) {
            var parcelObj = parcels[i];
            var parcelNum = parcelObj.parcelNumber;
            logDebug(parcelNum);

            var endpoint = "https://services.arcgis.com/nFaSPZoTjS78xXjw/ArcGIS/rest/services/Parcels/FeatureServer/1/query?where=APNGIS='{parcelNum}'&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token="
            var encodedURL = encodeURI(endpoint.replace("{parcelNum}", String(parcelNum)));
            logDebug(encodedURL);
            var response = aa.httpClient.get(encodedURL);
            if(!response.getOutput()) {
                logDebug("No data returned from GIS call");
                continue;
            }
            var data = JSON.parse(response.getOutput());
            if(!data) {
                logDebug("No data parsed");
                continue;
            }
            var features = data.features[0];
            if(!features) {
                logDebug("No features returned!");
                continue;
            }
            var geometry = features.geometry;
            if(!geometry) {
                logDebug("No geometry returned!");
                continue;
            }

            //%7B%22rings%22%3A%5B%5B%5B6086056.86800948%2C2090093.32997257%5D%2C%5B6086001.17094238%2C2090075.20107181%5D%2C%5B6085951.53783955%2C2090227.53705323%5D%2C%5B6086007.24901421%2C2090245.61510105%5D%2C%5B6086056.86800948%2C2090093.32997257%5D%5D%5D%7D
            // endpoint = "https://services.arcgis.com/nFaSPZoTjS78xXjw/ArcGIS/rest/services/PavementConditionIndex/FeatureServer/0/query?geometry={geometry}&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelIntersects&resultType=none&distance=10.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson"
            // encodedURL = encodeURI(endpoint.replace("{geometry}", JSON.stringify(geometry)));
            // logDebug(encodedURL);
            // var response = aa.httpClient.get(encodedURL);

            endpoint = "https://services.arcgis.com/nFaSPZoTjS78xXjw/ArcGIS/rest/services/PavementConditionIndex/FeatureServer/0/query";
            var headers = aa.util.newHashMap();
            headers.put("Content-Type", "application/x-www-form-urlencoded");

            var formData = aa.util.newHashMap();
            formData.put("geometry", JSON.stringify(geometry));
            formData.put("geometryType", "esriGeometryPolygon");
            formData.put("spatialRel", "esriSpatialRelIntersects");
            formData.put("distance", "5.0");
            formData.put("units", "esriSRUnit_Meter");
            formData.put("outFields", "*");
            formData.put("f", "pjson");
            formData.put("returnGeometry", "false");
            response = aa.httpClient.post(endpoint, headers, formData);

            if(!response.getOutput()) {
                logDebug("No data returned from GIS call");
                continue;
            }
            var data = JSON.parse(response.getOutput());
            if(!data) {
                logDebug("No data parsed");
                continue;
            }
            var features = data.features[0];
            if(!features) {
                logDebug("No features returned!");
                continue;
            }
            var attributes = features.attributes;
            if(!attributes) {
                logDebug("No attributes returned!");
                continue;
            }
            logDebug(pciField + " : " + attributes[pciField]);
			logDebug(fcnField + " : " + attributes[fcnField]);
            if(attributes[pciField]) {
                pciValue = attributes[pciField];
            }
            if(attributes[fcnField]) {
                fcnValue = attributes[fcnField];
            }
        }

        editAppSpecific("Pavement Condition Index", pciValue, capId);
        logDebug("fcnValue: " + fcnValue);
        var pciGrades = [];
        var flagForRestoration = false;

        if(pciValue > 85) {
            var restorationText = "PCI is greater than 85 and will require a larger area of restoration";
            var workDescResult = aa.cap.getCapWorkDesByPK(capId);
            if (workDescResult.getSuccess()) {
                var workDesScriptObj = workDescResult.getOutput();
                if (workDesScriptObj) {
                    workDesObj = workDesScriptObj.getCapWorkDesModel();
                    var currentWorkDescription = workDesObj.getDescription();
                    var newWorkDes = (currentWorkDescription ? currentWorkDescription : "") + "\n\n" + restorationText;
                    workDesObj.setDescription(newWorkDes);
                    var result = aa.cap.editCapWorkDes(workDesObj);
                    if(result.getSuccess()) {
                        logDebug("Successfully updated work description to " + newWorkDes);
                    } else {
                        logDebug("Failed to update work description: " + result.getErrorType() + " " + result.getErrorMessage());
                    }
                    addStdCondition("Engineering", "High PCI Grade", capId);
                }
            }
        }
        if (fcnValue == "A") {
			editAppSpecific("Road Type", "Arterial", capId);
			editAppSpecific("Pavement Section 1", "9", capId);
			editAppSpecific("Depth of Cover 1", "42", capId);
		}
		if (fcnValue == "C") {
			editAppSpecific("Road Type", "Collector", capId);
			editAppSpecific("Pavement Section 1", "9", capId);
			editAppSpecific("Depth of Cover 1", "36", capId);
		}
		if (fcnValue == "R") {
			editAppSpecific("Road Type", "Residential", capId);
			editAppSpecific("Pavement Section 1", "6", capId);
			editAppSpecific("Depth of Cover 1", "36", capId);
		}
		if (fcnValue == "S") {
			editAppSpecific("Road Type", "School", capId);
		}
    } catch (err) {
        logDebug("Error with PCI call for GIS " + err + " " + err.lineNumber);
        logDebug(debug);
    }
})();

//PINS
if(appMatch("Engineering/Encroachment/Annual/NA") || appMatch("Engineering/Encroachment/Containers/NA")) {
    var capLps = getLicenseProfessional(capId);
    if(!capLps || capLps.length == 0) {
        var contactList = aa.people.getCapContactByCapID(capId).getOutput();
        for (var contactIndex in contactList){
            var contactScript = contactList[contactIndex];
            var capContactModel = contactScript.capContactModel;
            var contactPeopleModel = contactScript.getPeople();
            if(capContactModel.contactType == "Applicant") {
                var contactEmail = capContactModel.email;
                logDebug(contactEmail);

                var refData = searchPINSOnlyProfessionals(contactEmail);
                if(refData.length > 0) {
                    var refLPData = refData[0];//grab the first one
                    var refSeqNbr = refLPData["LIC_SEQ_NBR"];
                    var refLicNbr = refLPData["LIC_NBR"];
                    referenceLP = grabReferenceLicenseProfessional(refLicNbr, "PINSOnly");
                    var addResult = aa.licenseScript.associateLpWithCap(capId, referenceLP);
                    if(!addResult.getSuccess()) {
                        logDebug("Unable to add reference lp adding back transactional " + addResult.getErrorType() + " " + addResult.getErrorMessage());
                    } else {
                        logDebug("Added reference " + refLicNbr + " to " + capId.getCustomID());
                        //get new transactional
                        var newTransactionalRefLP = grabTransactionalLicenseProfessional(refLicNbr, capId);
                        newTransactionalRefLP.setPrintFlag("Y");
                        var updateResult = aa.licenseProfessional.editLicensedProfessional(newTransactionalRefLP);
                        if(updateResult.getSuccess()) {
                            logDebug("Successfully made " + refLicNbr + " primary");
                        } else {
                            logDebug("Failed to update " + refLicNbr + " " + removeResult.getErrorType() + " : " + removeResult.getErrorMessage());
                        }
                    }
                    break;
                }

                var newLic = aa.licenseScript.createLicenseScriptModel();
                if (capContactModel.businessName)
                    newLic.setBusinessName(capContactModel.businessName);
                if (contactPeopleModel.getFirstName())
                    newLic.setContactFirstName(contactPeopleModel.getFirstName());
                if (contactPeopleModel.getLastName())
                    newLic.setContactLastName(contactPeopleModel.getLastName());
                if (contactEmail)
                    newLic.setEMailAddress(contactEmail);

                newLic.setAgencyCode(aa.getServiceProviderCode());
                newLic.setAuditDate(sysDate);
                newLic.setAuditID(currentUserID);
                newLic.setAuditStatus("A");
                newLic.setLicenseType("PINSOnly");

                var agencySeqBiz = aa.proxyInvoker.newInstance("com.accela.sg.AgencySeqNextBusiness").getOutput();
                var params = aa.proxyInvoker.newInstance("com.accela.domain.AgencyMaskDefCriteria").getOutput();
                params.setAgencyID(aa.getServiceProviderCode());
                var maskName = "Default";
                var seqType = "Agency";
                var seqName = "People Number";
                params.setMaskName(maskName);
                params.setRecStatus("A");
                params.setSeqType(seqType);
                params.setSeqName(seqName);
                var seq = agencySeqBiz.getNextMaskedSeq("ADMIN", params, null, null);
                logDebug(seq);
                newLic.setLicState("CA"); // hardcode CA
                newLic.setStateLicense(seq);

                var myResult = aa.licenseScript.createRefLicenseProf(newLic);
                if (myResult.getSuccess()) {
                    logDebug("Created fresh reference LP for " + seq);
                } else {
                    logDebug(myResult.getErrorType() + " " + myResult.getErrorMessage());
                }

                var myResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                if (myResult.getSuccess()) {
                    logDebug("Added " + seq + " to " + capId.getCustomID());
                } else {
                    logDebug(myResult.getErrorType() + " " + myResult.getErrorMessage());
                }

                capLps = getLicenseProfessional(capId);
                for (var thisCapLpNum in capLps) {
                    var thisCapLp = capLps[thisCapLpNum];
                    if (thisCapLp.getLicenseNbr().equals(seq)) {
                        thisCapLp.setPrintFlag("Y");
                        aa.licenseProfessional.editLicensedProfessional(thisCapLp);
                        logDebug("Updated primary flag on Cap LP : " + seq);
                    }
                }

                var licSeqNbr = myResult.getOutput();
                break;
            }
        }
    }
}