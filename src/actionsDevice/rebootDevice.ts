import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import {IContexUI} from '../ui/IContexUI';

export async function rebootDevice(treeData: TreeDataDevicesProvider,item:IotDevice, firstText:string|undefined,contextUI:IContexUI): Promise<void> { 
    let textMessage:string;
    if(firstText) {
        textMessage=`${firstText}. Reboot your device: 
        ${item.label} ${item.description}?`;
    } else {
        textMessage=`Do you really want to reboot the device: 
        ${item.label} ${item.description}?`;
    }
    //    
    const answer = await vscode.window.showInformationMessage(textMessage, ...["Yes", "No"]);
    if(answer=="Yes") {
        const device = treeData.FindbyIdDevice(<string>item.IdDevice);    
        if(device) {
            contextUI.Output("Action: reboot device");
            const labelTask="Reboot device";
            contextUI.ShowBackgroundNotification(labelTask);
            const guidBadge=contextUI.BadgeAddItem(labelTask);
            const result = await device.Reboot();
            if(guidBadge) contextUI.BadgeDeleteItem(guidBadge);
            contextUI.HideBackgroundNotification();
            //Output       
            contextUI.Output(result.toStringWithHead());
            //Message                 
            if(result.Status==StatusResult.Ok) {
                vscode.window.showInformationMessage(`Reboot completed successfully. 
                    Device: ${item.label} ${item.description}`);
            } else {            
                vscode.window.showErrorMessage(`Error. Failed to reboot device! ${result.Message}`);
                if(result.SystemMessage) 
                    contextUI.Output(result.SystemMessage);
            }       
        }
    }
}
