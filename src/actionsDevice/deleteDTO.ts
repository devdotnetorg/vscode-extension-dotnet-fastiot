import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDeviceDTO } from '../IotDeviceDTO';
import {IoTUI} from '../ui/IoTUI';

export async function deleteDTO(treeData: TreeDataDevicesProvider,item:IotDeviceDTO,contextUI:IoTUI): Promise<void> { 
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the DTO: 
        ${item.label}?`, ...["Yes", "No"]);
    if(answer=="Yes") {
        contextUI.Output("Action: DTO removal");
        contextUI.StatusBarBackground.showAnimation("DTO removal");                
        const result=await treeData.DeleteDTO(item);
        contextUI.StatusBarBackground.hide();
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
