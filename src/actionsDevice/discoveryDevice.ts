import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import find from 'local-devices'
import { IDevice } from 'local-devices'

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { connectionTestDevice } from './connectionTestDevice';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../BaseTreeItem';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoTHelper } from '../Helper/IoTHelper';
import { IoTApplication } from '../IoTApplication';
import { networkHelper } from '../Helper/networkHelper';
import { addDevice } from './addDevice';

export async function discoveryDevice(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem>,app:IoTApplication): Promise<void> {
    const labelTask="Device discovery";
    const checkPort=22;
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
            const devices:IDevice[] = await find({ skipNameResolution: false });
            if(token.isCancellationRequested) {
                resolve(undefined);
                return;
            }
            //TODO Filter mac 
            // mac: '20:16:d8:0f:26:60'

            //check 22 port and create ItemQuickPick
            const checkPortAsync = async (item:ItemQuickPick) => {
                let result = await networkHelper.CheckTcpPortUsed(item.value,checkPort);
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
                let result = await networkHelper.PingHost(devices[i].ip);
                if(result.Status==StatusResult.Ok) {
                    let label:string;
                    let description:string=``;
                    if (devices[i].name=='?')
                        label=devices[i].ip;
                        else label=`${devices[i].name} ${devices[i].ip}`;
                    //create item and push
                    let item = new ItemQuickPick(label,description, devices[i].ip);
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
    //show list
    const SELECTED_ITEM = await vscode.window.showQuickPick(
        itemDevices,{title: 'Discovered Devices',placeHolder:`Choose a device to add`});
    if(!SELECTED_ITEM) return;
    //add device
    addDevice(treeData,treeView,app,SELECTED_ITEM.value,SELECTED_ITEM.tag);
}
