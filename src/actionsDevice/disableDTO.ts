import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotDeviceDTO } from '../IotDeviceDTO';
import { rebootDevice } from './rebootDevice';

export async function disableDTO(treeData: TreeDataDevicesProvider,item:IotDeviceDTO): Promise<void> {
    treeData.OutputChannel.appendLine("----------------------------------");
    treeData.OutputChannel.appendLine("Action: disabling DTO");                
    const result=await treeData.DisableDTO(item);
    //Output 
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    //Message
    if(result.Status==StatusResult.Ok)
    {        
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`DTO disabled successfully.`);
        //reboot
        rebootDevice(treeData,item.Device,"You need to reboot the device to accept the changes");
    }else    
    {        
        vscode.window.showErrorMessage(`Error. Error disabling DTO.`);            
    }         
        
}
