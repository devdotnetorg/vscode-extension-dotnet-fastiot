import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotDeviceDTO } from '../IotDeviceDTO';
import { refreshDTO } from './refreshDTO';

export async function addDTO(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {       
    if(item.DtoLinux.Items.length==0)
        await refreshDTO(treeData,item);        
    if(item.DtoLinux.Items.length==0) return;
    //
    //TODO: dtbo files are corrupted. Adding dtbo files is currently locked
    /*
    filters: {
           'DTS files': ['dts'],
           'DTBO files': ['dtbo']
       }
    */
    const options: vscode.OpenDialogOptions = {
        defaultUri: vscode.Uri.file(`overlay.dts`),
        canSelectMany: false,        
        openLabel: 'Open',
        filters: {
           'DTS files': ['dts']           
       }
    }; 
    //
    const file = await vscode.window.showOpenDialog(options);    
    if(file)
    {
        treeData.OutputChannel.appendLine("----------------------------------");
        treeData.OutputChannel.appendLine(`Action: Adding a DTO file ${file[0].fsPath}`);
        const fileData = fs.readFileSync(file[0].fsPath, 'utf-8');
        const fileName = path.parse(file[0].fsPath).base;        
        const result = await treeData.AddDTO(<string>item.IdDevice,fileName,fileData);
        //Output 
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
        treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
        treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
        //Message
        if(result.Status==StatusResult.Ok)
        {
            item.DtoLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
            treeData.Refresh(); 
            vscode.window.showInformationMessage(`DTO file added successfully.`);     
        }else    
        {        
            vscode.window.showErrorMessage(`Error. Error adding DTO file. ${result.Message}.`);            
        }         
    }       
}
