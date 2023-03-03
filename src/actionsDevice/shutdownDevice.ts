import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import {IContexUI} from '../ui/IContexUI';

export async function shutdownDevice(treeData: TreeDataDevicesProvider,item:IotDevice, firstText:string|undefined,contextUI:IContexUI): Promise<void> { 
    let textMessage:string;
    if(firstText){
        textMessage=`${firstText}. Shutdown your device: 
        ${item.label} ${item.description}?`;

    } else {
        textMessage=`Do you really want to shutdown the device: 
        ${item.label} ${item.description}?`;
    }
    //    
    const answer = await vscode.window.showInformationMessage(textMessage, ...["Yes", "No"]);
    if(answer=="Yes") {
        const device = treeData.FindbyIdDevice(<string>item.IdDevice);    
        if(device) {
            contextUI.Output("Action: shutdown device");
            contextUI.ShowBackgroundNotification("Shutdown device");
            const result = await device.Shutdown();
            contextUI.HideBackgroundNotification();
            //Output       
            contextUI.Output(result.toStringWithHead());
            //Message                 
            if(result.Status==StatusResult.Ok) {
                vscode.window.showInformationMessage(`Shutdown completed successfully. 
                    Device: ${item.label} ${item.description}`);
                //
                vscode.window.showInformationMessage(`Wait a while for the device to turn off completely`);                
            } else {            
                vscode.window.showErrorMessage(`Error. Failed to shutdown device! ${result.Message}`);
                if(result.SystemMessage) contextUI.Output(result.SystemMessage);
            }            
        }
    }     
}
