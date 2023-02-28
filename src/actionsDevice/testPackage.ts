import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';         
import {IoTUI} from '../ui/IoTUI';

export async function testPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage,contextUI:IoTUI): Promise<void> {      
    //main process
    contextUI.Output(`Action: ${item.NamePackage} package test`);
    contextUI.StatusBarBackground.showAnimation(`${item.NamePackage} package test`);
    const result = await treeData.TestPackage(<string>item.Device.IdDevice,item.NamePackage);
    contextUI.StatusBarBackground.hide();
    //Output       
    contextUI.Output(result.toMultiLineString("head"));
    //Message
    if(result.Status==StatusResult.Ok) {
        vscode.window.showInformationMessage(`${item.NamePackage} package tested successfully.`);
    } else {            
        vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to test! \n${result.Message}. ${result.SystemMessage}`);            
    } 
}
