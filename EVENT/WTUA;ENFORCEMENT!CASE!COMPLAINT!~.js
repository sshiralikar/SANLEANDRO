//When workflow task Complaint Intake is updated to Assigned, create Enforcement Incident record based on complaint type.
doCreate = false;
if(wfTask == "Complaint Intake" && wfStatus == "Assigned")
    doCreate = true;
else
    doCreate = false;
if(doCreate && AInfo["Complaint Type"] == "Noise - Excessive Noise")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Abatement";
    newAppL4 = "Noise Nuisance";
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Graffiti - Graffiti")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Abatement";
    newAppL4 = "Graffiti" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Garbage - Trash Removal")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Health and Safety";
    newAppL4 = "Garbage Service" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Trees and Weeds - Tree Maintenance")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Abatement";
    newAppL4 = "Tree Maintenance" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Trees and Weeds - Tall Grass-Weeds")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Abatement";
    newAppL4 = "Weeds" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Signage - Illegal Sign")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Zoning";
    newAppL4 = "Illegal Sign" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Junk on Property")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Health and Safety";
    newAppL4 = "Junk" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Vacant Building")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Health and Safety";
    newAppL4 = "Vacant Building" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Sub-Standard Property")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Building";
    newAppL4 = "Sub-Standard Property" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Grading")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Building";
    newAppL4 = "Grading" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Illegal Occupancy")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Building";
    newAppL4 = "Illegal Occupancy" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Working Without Permit")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Building";
    newAppL4 = "Working Without Permit" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Fence Dispute")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Zoning";
    newAppL4 = "Fence Dispute" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Buildings and Property - Home Occupation")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Zoning";
    newAppL4 = "Home Occupation" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Vehicles - Abandoned Vehicle")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Abatement";
    newAppL4 = "Abandoned Vehicle" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}
if(doCreate && AInfo["Complaint Type"] == "Animals - Animal Nuisance")
{
    newAppL1 = "Enforcement";
    newAppL2 = "Incident";
    newAppL3 = "Abatement";
    newAppL4 = "Animal Nuisance" ;
    newAppDesc = "Created by " + capId.getCustomID();
    include("ENF CREATE CHILD CASES");
}