import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import find from 'local-devices'
import ip from 'ip';
import { IDevice } from 'local-devices'

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { connectionTestDevice } from './connectionTestDevice';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../shared/BaseTreeItem';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoTHelper } from '../Helper/IoTHelper';
import { IoTApplication } from '../IoTApplication';
import { networkHelper } from '../Helper/networkHelper';
import { addDevice } from './addDevice';

export async function discoveryDevice(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem>,app:IoTApplication): Promise<void> {
    
    const labelTask="Device discovery";
    const checkPort=22;
    try {
        //device discovery or subnet scan
        //Choice of two options
        let items:Array<ItemQuickPick>=[];
        let item = new ItemQuickPick("1. Fast device discovery (recommended)","Fast","discovery","Some devices may not be found");
        items.push(item);
        item = new ItemQuickPick("2. Subnet scan","Takes 3-5 minutes","scan","Checking every IP-Address in a subnet");
        items.push(item);
        let SELECTED_ITEM = await vscode.window.showQuickPick(items,{title: 'Choose a device discovery method'});
        if(!SELECTED_ITEM) return;
        let answerAction=SELECTED_ITEM.value as string;
        if (answerAction=="scan") {
            //get all local IP
            const ipLocal=networkHelper.GetLocalIPaddress();
            if(ipLocal.size==0) {
                vscode.window.showInformationMessage(`⚠️ No network adapters found.`);
                return;
            }
            //Subnet selection
            items=[];
            ipLocal.forEach((ipA,label) => {
                const subnetInfo=ip.subnet(ipA, '255.255.255.0');
                const detail=`Scan range: ${subnetInfo.firstAddress}-${subnetInfo.lastAddress}`;
                let item = new ItemQuickPick(label,`local IP: ${ipA}`,ipA,detail);
                items.push(item);
            });
            SELECTED_ITEM = await vscode.window.showQuickPick(items,{title: 'Select network adapter and subnet to scan'});
            if(!SELECTED_ITEM) return;
            answerAction=SELECTED_ITEM.value as string;
        }
        //main
        const guidBadge=app.UI.BadgeAddItem(labelTask);
        //progress
        const itemDevices:ItemQuickPick[]|undefined = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: labelTask,
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                console.log("User canceled the long running operation");
                return;
            });
            return new Promise(async (resolve, reject) => {

                let itemDevices:Array<ItemQuickPick>=[];
                //get list devices
                let devices:IDevice[]=[];
                if (answerAction=="discovery") {
                    devices = await find({ skipNameResolution: false });
                    //Filter mac
                    devices=FilterMac(devices);
                }else {
                    //ip - answerAction
                    const subnetInfo=ip.subnet(answerAction, '255.255.255.0');
                    const stateCallback = (state:string):void => {
                        progress.report({ message: state });
                    };
                    const rangeIP=await networkHelper.ScanRangeIPaddresses(subnetInfo.firstAddress,subnetInfo.lastAddress,token,stateCallback);
                    if(token.isCancellationRequested) {
                        resolve(undefined);
                        return;
                    }
                    rangeIP.forEach((ipA) => {
                        const device:IDevice = {
                            name:'',
                            ip: ipA,
                            mac: ''
                        }
                        devices.push(device);
                    });
                }
                if(devices.length==0) {
                    vscode.window.showInformationMessage(`⚠️ No network devices found.`);
                    resolve(undefined);
                    return;
                }
                if(token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                //check 22 port and create ItemQuickPick
                const checkPortAsync = async (item:ItemQuickPick) => {
                    let result = await networkHelper.CheckTcpPortUsed(item.value,checkPort,150,700);
                    if(result.Status==StatusResult.Ok) {
                        item.description=`port ${checkPort} available`;
                        item.tag=`${checkPort}`;
                    }
                };
                for (let i = 0; i < devices.length; i++) {
                    if(token.isCancellationRequested) {
                        resolve(undefined);
                        return;
                    }
                    //ip availability check
                    const msg=`${i+1} of ${devices.length+1}. Checking host ${devices[i].ip}.`;
                    progress.report({ message: msg });
                    let result = await networkHelper.PingHost(devices[i].ip,3,1,true);
                    if(result.Status==StatusResult.Ok) {
                        //label
                        let labelHostname:string=devices[i].ip;
                        if (devices[i].name!='?') labelHostname=devices[i].name;
                        if (result.returnObject) labelHostname=result.returnObject;
                        let label:string;
                        if(labelHostname!=devices[i].ip) {
                            label=`Hostname: ${labelHostname} IP: ${devices[i].ip}`;
                        }else {
                            label=`IP: ${devices[i].ip}`;
                        }
                        //create item and push
                        let item = new ItemQuickPick(label,"", devices[i].ip);
                        itemDevices.push(item);
                        //check 22 port
                        const msg=`${i+1} of ${devices.length+1}. Checking port ${checkPort} for host ${devices[i].ip}.`;
                        progress.report({ message: msg });  
                        await checkPortAsync(item);
                    }
                }
                //result
                resolve(itemDevices);
                //end
            });
        });
        if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
        //check canceled
        if(!itemDevices) {
            vscode.window.showInformationMessage(`⚠️ ${labelTask} canceled.`);
            return;
        }
        if(itemDevices.length==0) {
            vscode.window.showInformationMessage(`⚠️ No network devices found.`);
            return;
        }
        //show list
        SELECTED_ITEM = await vscode.window.showQuickPick(
            itemDevices,{title: 'Discovered Devices',placeHolder:`Choose a device to add`});
        if(!SELECTED_ITEM) return;
        //add device
        addDevice(treeData,treeView,app,SELECTED_ITEM.value,SELECTED_ITEM.tag);
    } catch (err: any){
        vscode.window.showErrorMessage(`⚠️ Error: ${err}.`);
    }
}

function FilterMac (devices:IDevice[]):IDevice[]
{
    let regex: RegExp = /^[0-9a-f]{1,2}([\.:-])(?:[0-9a-f]{1,2}\1){4}[0-9a-f]{1,2}$/;
    let resultDevices:IDevice[]=[];
    for (let i = 0; i < devices.length; i++) {
        //check
        if(regex.test(devices[i].mac))
            resultDevices.push(devices[i]);     
    }
    //result
    return resultDevices;
}
