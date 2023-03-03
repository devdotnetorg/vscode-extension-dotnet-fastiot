import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import {IContexUI} from '../ui/IContexUI';

export async function exportDevices(treeData: TreeDataDevicesProvider): Promise<void> {        
    const options: vscode.SaveDialogOptions = {
        defaultUri: vscode.Uri.file(`FastIoT-devices.json`),
        saveLabel: 'Save Content To ...',
        filters: {
           'JSON files': ['json'],
           'All files': ['*']
       }
    };
    const file = await vscode.window.showSaveDialog(options);    
    if(file)    
    {        
        const jsonObj = treeData.ToJSON();
        //save in file
        const strJSON=JSON.stringify(jsonObj);        
        fs.writeFileSync(file.fsPath, strJSON,undefined);
        //
        vscode.window.showInformationMessage('Device list exported successfully.');
    }
}

export async function importDevices(treeData: TreeDataDevicesProvider,contextUI:IContexUI): Promise<void> {
    //canSelectFiles: true,
    //canSelectFolders: false,
    const options: vscode.OpenDialogOptions = {
        defaultUri: vscode.Uri.file(`FastIoT-devices.json`),
        canSelectMany: false,        
        openLabel: 'Open',
        filters: {
           'JSON files': ['json'],
           'All files': ['*']
       }
    };    
    const file = await vscode.window.showOpenDialog(options);
    let result = new IotResult(StatusResult.None,undefined,undefined);
    if(file)
    {        
        contextUI.Output(`Action: Import devices from file ${file[0].fsPath}`);        
        try
        {
            const jsonObj = JSON.parse(fs.readFileSync(file[0].fsPath, 'utf-8'));
            result = await treeData.FromJSON(jsonObj);
        } catch (err:any) {
            result = new IotResult(StatusResult.Error,err,undefined);
        }     
        //Output       
        contextUI.Output(result.toMultiLineString("head"));
        //Message       
        if(result.Status==StatusResult.Ok) {
            vscode.window.showInformationMessage(`Devices imported successfully. ${result.Message}`);
            treeData.RefreshsFull();
            treeData.SaveDevices();
        } else {
            vscode.window.showErrorMessage(`Error. Device import failed! \n${result.Message}`);            
        }
    }
}
