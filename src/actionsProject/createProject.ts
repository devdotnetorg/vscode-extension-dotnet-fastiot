import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {TreeDataProjectsProvider} from '../TreeDataProjectsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../BaseTreeItem';
import { ItemQuickPick } from '../Helper/actionHelper';
import { MakeDirSync,ConvertToValidFilename } from '../Helper/IoTHelper';
import { CheckDotNetAppName } from '../Helper/dotnetHelper';
import { config } from 'process';
import {IotTemplate} from '../Templates/IotTemplate';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { GetDotNetTargets } from '../Helper/dotnetHelper';

export async function createProject(treeData: TreeDataLaunchsProvider,devices:Array<IotDevice>): Promise<void> {
    //objJSON: preparation of input parameters    
    let jsonObj = {
        dotnetTarget:""//,
        //installpath:"",
        //username:"",
        //name:"",
        //version:""        
    };
    //Devices
    if(devices.length==0) {
        vscode.window.showErrorMessage(`Error. No available devices. Add device`);
        return;
    }
    //Select Device
    let itemDevices:Array<ItemQuickPick>=[];
    devices.forEach((device) => {                        
        const item = new ItemQuickPick(<string>device.label,
            `${device.Information.BoardName} ${device.Information.Architecture}`,device);            
        itemDevices.push(item);
    });
    let SELECTED_ITEM = await vscode.window.showQuickPick(itemDevices,{title: 'Choose a device (1/5):',});
    if(!SELECTED_ITEM) return;
    const selectDevice= <IotDevice>SELECTED_ITEM.value;
    //Select template
    const listTemplates= treeData.Config.Templates.Select(selectDevice.Information.Architecture);
    if(listTemplates.length==0) {
        vscode.window.showErrorMessage(`No projects available for device ${selectDevice.label} ${selectDevice.Information.Architecture}`);
        return;
    }
    let itemTemplates:Array<ItemQuickPick>=[];
    listTemplates.forEach((template) => {
        const item = new ItemQuickPick(<string>template.Attributes.Label,
            `${template.Attributes.Detail}. Language: ${template.Attributes.Language}`,template);            
        itemTemplates.push(item);
    });
    SELECTED_ITEM = await vscode.window.showQuickPick(itemTemplates,{title: 'Choose a template (2/5):',});
    if(!SELECTED_ITEM) return;
    const selectTemplate= <IotTemplate>SELECTED_ITEM.value;
    //Select folder
    const options: vscode.OpenDialogOptions = {
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select a folder for the project (3/5)',
    };
    /* TEST
    const folders = await vscode.window.showOpenDialog(options);
    if ((folders === undefined) || (folders[0] === undefined)) return;
    let folder=folders[0].fsPath;
    */
    let folder ="D:\\Anton\\Projects\\Tests";
    //
    //Select name project
    let nameProject = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Application name (4/5). Enter the name of your application',
        value: selectTemplate.Attributes.ProjName
    });
    if(nameProject==undefined) return;
    nameProject=ConvertToValidFilename(nameProject,'_');
    if(CheckDotNetAppName(nameProject)){
        vscode.window.showErrorMessage(`${nameProject}: The project name contains prohibited characters`);
        return;
    }
    folder=`${folder}\\${nameProject}`;
    //Project path confirmation
    let selectFolder = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Project path (5/5). Confirm project location',
        value: folder
    });
    if(selectFolder==undefined) return;
    if (fs.existsSync(selectFolder)){
        const files = fs.readdirSync(selectFolder);
        if(files.length>0)
        {
            vscode.window.showErrorMessage(`Folder ${selectFolder} must be empty`);
            return;
        }
    }
    //depending on project type
    if(selectTemplate.Attributes.TypeProj=="dotnet"){
        //Shows a selection list allowing multiple selections.
        let itemTarget:Array<ItemQuickPick>=[];
        //select target
        GetDotNetTargets().forEach((value, key) => {
            const item = new ItemQuickPick(value,"",key);
            itemTarget.push(item);
        });
        SELECTED_ITEM = await vscode.window.showQuickPick(itemTarget,{title: 'Choose a .NET Target framework:',});
        if(!SELECTED_ITEM) return;
        //formation jsonObj
        jsonObj.dotnetTarget=SELECTED_ITEM.value;
    }
    //Main process
    treeData.OutputChannel.appendLine(`Action: create an ${nameProject} project, ${selectTemplate.ParentDir} template`);
    const result=await treeData.CreateProject(selectDevice,selectTemplate,selectFolder,nameProject,jsonObj);
    //Output       
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    //Message       
    if(result.Status==StatusResult.Ok)
    {
        vscode.window.showInformationMessage(`${nameProject} project successfully created`);
    }else
    {            
        vscode.window.showErrorMessage(`Error. Project not created! \n${result.Message}`);            
    }
}
