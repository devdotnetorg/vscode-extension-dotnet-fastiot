import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';         
import {IContexUI} from '../ui/IContexUI';

export async function testPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage,contextUI:IContexUI): Promise<void> {      
    //main process
    contextUI.Output(`Action: ${item.NamePackage} package test`);
    contextUI.ShowBackgroundNotification(`${item.NamePackage} package test`);
    const result = await treeData.TestPackage(<string>item.Device.IdDevice,item.NamePackage);
    contextUI.HideBackgroundNotification();
    //Output       
    contextUI.Output(result.toStringWithHead());
    //Message
    if(result.Status==StatusResult.Ok) {
        vscode.window.showInformationMessage(`${item.NamePackage} package tested successfully.`);
    } else {            
        vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to test! \n${result.Message}. ${result.SystemMessage}`);            
    } 
}
