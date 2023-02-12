import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { pingDevice } from './pingDevice';
import { IotDevice } from '../IotDevice';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';         

export async function testPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage): Promise<void> {      
    treeData.OutputChannel.appendLine(`Action: ${item.NamePackage} package test`);
    //main process
    const result = await treeData.TestPackage(<string>item.Device.IdDevice,item.NamePackage);
    //Output       
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    treeData.OutputChannel.appendLine("----------------------------------");
    //Message
    if(result.Status==StatusResult.Ok) {
        vscode.window.showInformationMessage(`${item.NamePackage} package tested successfully.`);
    } else {            
        vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to test! \n${result.Message}. ${result.SystemMessage}`);            
    } 
}
