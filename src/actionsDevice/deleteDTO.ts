import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDeviceDTO } from '../IotDeviceDTO';
import {IContexUI} from '../ui/IContexUI';

export async function deleteDTO(treeData: TreeDataDevicesProvider,item:IotDeviceDTO,contextUI:IContexUI): Promise<void> { 
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the DTO: 
        ${item.label}?`, ...["Yes", "No"]);
    if(answer=="Yes") {
        contextUI.Output("Action: DTO removal");
        contextUI.ShowBackgroundNotification("DTO removal");                
        const result=await treeData.DeleteDTO(item);
        contextUI.HideBackgroundNotification();
        //Output 
        contextUI.Output(result.toMultiLineString("head"));
        //Message
        if(result.Status==StatusResult.Ok) {        
            treeData.Refresh(); 
            vscode.window.showInformationMessage(`DTO deleted successfully.`);
            //reboot
            //rebootDevice(treeData,item.Device,"You need to reboot the device to accept the changes");
        } else {
            vscode.window.showErrorMessage(`Error. Error enabling DTO.`);            
        }        
    } 
}
