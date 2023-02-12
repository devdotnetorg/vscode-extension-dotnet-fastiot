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
    const options: vscode.OpenDialogOptions = {
        defaultUri: vscode.Uri.file(`overlay.dts`),
        canSelectMany: false,        
        openLabel: 'Open',
        filters: {
           'DTS files': ['dts'],
           'DTBO files': ['dtbo']        
       }
    }; 
    //
    const file = await vscode.window.showOpenDialog(options);    
    if(file)
    {
        treeData.OutputChannel.appendLine(`Action: Adding a DTO file ${file[0].fsPath}`);
        //dts or dtbo
        const dtoExt = path.extname(file[0].fsPath); // returns '.dts' or '.dtbo'
        let fileData:string;
        let fileType:string;
        if(dtoExt=='.dts') {
            fileData = fs.readFileSync(file[0].fsPath, 'utf-8');
            fileType="utf8";
        }else
        {
            //'.dtbo'
            fileData = fs.readFileSync(file[0].fsPath, 'binary'); //binary base64
            fileType="ascii"; //ascii base64
        }
        //
        const fileName = path.parse(file[0].fsPath).base;        
        const result = await treeData.AddDTO(<string>item.IdDevice,fileName,fileData,fileType);
        //Output 
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
        treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
        treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
        treeData.OutputChannel.appendLine("----------------------------------");
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
