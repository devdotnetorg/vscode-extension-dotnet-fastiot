import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoTHelper } from '../Helper/IoTHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import {IotTemplate} from '../Templates/IotTemplate';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';

export async function createProject(treeData: TreeDataLaunchsProvider,devices:Array<IotDevice>,context: vscode.ExtensionContext): Promise<void> {
    let values:Map<string,string>= new Map<string,string>()
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
    let folder="";
    if(context.extensionMode==vscode.ExtensionMode.Production){
        const folders = await vscode.window.showOpenDialog(options);
        if ((folders === undefined) || (folders[0] === undefined)) return;
        folder=folders[0].fsPath;
    }else{
        //test
        folder ="D:\\Anton\\Projects\\Tests";
    }
    //Select name project
    let nameProject = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Application name (4/5). Enter the name of your application',
        value: selectTemplate.Attributes.ProjName
    });
    if(nameProject==undefined) return;
    nameProject=IoTHelper.StringTrim(nameProject);
    nameProject=IoTHelper.ConvertToValidFilename(nameProject,'_');
    if(dotnetHelper.CheckDotNetAppName(nameProject)){
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
    selectFolder=IoTHelper.StringTrim(selectFolder);
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
        dotnetHelper.GetDotNetTargets().forEach((value, key) => {
            const item = new ItemQuickPick(value[1],"",value[0]);
            itemTarget.push(item);
        });
        SELECTED_ITEM = await vscode.window.showQuickPick(itemTarget,{title: 'Choose a .NET framework:',});
        if(!SELECTED_ITEM) return;
        //
        values.set("%{project.dotnet.targetframework}",<string>SELECTED_ITEM.value);
    }
    //values
    values.set("%{project.name}",nameProject);
    //Main process
    treeData.OutputChannel.appendLine(`Action: create an ${nameProject} project, ${selectTemplate.ParentDir} template`);
    const result=await treeData.CreateProject(selectDevice,selectTemplate,selectFolder,values);
    //Output       
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    treeData.OutputChannel.appendLine("----------------------------------");
    //Message       
    if(result.Status==StatusResult.Ok)
    {
        //Open Workspace
        const folderPathParsed = "/"+selectFolder.split(`\\`).join(`/`);
        const folderUri = vscode.Uri.parse(folderPathParsed);
        vscode.window.showInformationMessage(`${nameProject} project successfully created`);
        vscode.commands.executeCommand(`vscode.openFolder`, folderUri);  
    }else
    {            
        vscode.window.showErrorMessage(`Error. Project not created! \n${result.Message}`);            
    }
}
