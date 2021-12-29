import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotDeviceDTO } from '../IotDeviceDTO';
import { rebootDevice } from './rebootDevice';

export async function deleteDTO(treeData: TreeDataDevicesProvider,item:IotDeviceDTO): Promise<void> { 
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the DTO: 
    ${item.label}?`, ...["Yes", "No"]);
    if(answer=="Yes")
    {  
        treeData.OutputChannel.appendLine("----------------------------------");
        treeData.OutputChannel.appendLine("Action: DTO removal");                
        const result=await treeData.DeleteDTO(item);
        //Output 
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
        treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
        treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
        //Message
        if(result.Status==StatusResult.Ok)
        {        
            treeData.Refresh(); 
            vscode.window.showInformationMessage(`DTO deleted successfully.`);
            //reboot
            //rebootDevice(treeData,item.Device,"You need to reboot the device to accept the changes");
        }else    
        {        
            vscode.window.showErrorMessage(`Error. Error enabling DTO.`);            
        }        
    } 
}
