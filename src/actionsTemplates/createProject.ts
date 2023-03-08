import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoTHelper } from '../Helper/IoTHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IotTemplate } from '../Templates/IotTemplate';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotConfiguration } from '../Configuration/IotConfiguration';
import { IContexUI } from '../ui/IContexUI';

export async function createProject(config:IotConfiguration,devices:Array<IotDevice>,contextUI:IContexUI): Promise<void> {
    let result:IotResult;
    //Load template
    if(config.Templates.Count==0)
        await config.LoadTemplatesAsync();
    //repeat
    if(config.Templates.Count==0) {
        result=new IotResult(StatusResult.No,`No templates available`);
        contextUI.ShowNotification(result);
        return;
    }
    //Devices
    if(devices.length==0) {
        result=new IotResult(StatusResult.No,`No devices. Add device`);
        contextUI.ShowNotification(result);
        return;
    }
    //Select Device
    let itemDevices:Array<ItemQuickPick>=[];
    devices.forEach((device) => {
        const label=`${device.label}`;
        const description=`${device.Information.Architecture}`;
        const detail=`$(circuit-board) ${device.Information.BoardName} $(terminal-linux) ${device.Information.OsDescription} ${device.Information.OsKernel} $(account) ${device.Account.UserName}`;
        const item = new ItemQuickPick(label,description,device,detail);
        itemDevices.push(item);
    });
    let SELECTED_ITEM = await vscode.window.showQuickPick(itemDevices,{title: 'Choose a device (1/4)',placeHolder:`Developer board`});
    if(!SELECTED_ITEM) return;
    const selectDevice= <IotDevice>SELECTED_ITEM.value;
    //Select template
    const listTemplates= config.Templates.Select(selectDevice.Information.Architecture);
    if(listTemplates.length==0) {
        result=new IotResult(StatusResult.No,`No templates for device ${selectDevice.label} ${selectDevice.Information.Architecture}`);
        contextUI.ShowNotification(result);
        return;
    }
    let itemTemplates:Array<ItemQuickPick>=[];
    listTemplates.forEach((template) => {
        const item = new ItemQuickPick(<string>template.Attributes.Label,
            `Language: ${template.Attributes.Language}`,template,`${template.Attributes.Detail}`);
        itemTemplates.push(item);
    });
    SELECTED_ITEM = await vscode.window.showQuickPick(itemTemplates,{title: 'Choose a template (2/5)',placeHolder:`Template`});
    if(!SELECTED_ITEM) return;
    const selectTemplate= <IotTemplate>SELECTED_ITEM.value;
    //Select name project
    let nameProject = await vscode.window.showInputBox({				
        prompt: 'Enter the name of your application',
        title: 'Application name (3/5)',
        value: selectTemplate.Attributes.ProjName
    });
    if(!nameProject) return;
    nameProject=IoTHelper.StringTrim(nameProject);
    nameProject=IoTHelper.ConvertToValidFilename(nameProject,'_');
    if(dotnetHelper.CheckDotNetAppName(nameProject)){
        result=new IotResult(StatusResult.Error,`${nameProject}: The project name contains prohibited characters`);
        contextUI.ShowNotification(result);
        return;
    }
    //Select folder
    //TODO defaultUri?: Uri;
    const options: vscode.OpenDialogOptions = {
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: "Select a folder for the project (4/5)",
        openLabel: 'Select folder',
    };
    let folder:string;
    if(config.ExtMode==vscode.ExtensionMode.Production){
        const folders = await vscode.window.showOpenDialog(options);
        if(!folders||folders.length==0) return;
        folder=folders[0].fsPath;
    }else{
        //test
        folder ="D:\\Anton\\Projects\\Tests";
    }
    //Project path confirmation
    folder=`${folder}\\${nameProject}`;
    let selectFolder = await vscode.window.showInputBox({				
        prompt: 'Confirm project location',
        title: 'Project path (5/5)',
        value: folder
    });
    if(!selectFolder) return;
    selectFolder=IoTHelper.StringTrim(selectFolder);
    if (fs.existsSync(selectFolder)) {
        const files = fs.readdirSync(selectFolder);
        if(files.length>0) {
            result=new IotResult(StatusResult.Error,`Folder ${selectFolder} must be empty`);
            contextUI.ShowNotification(result);
            return;
        }
    }
    //values
    let values:Map<string,string>= new Map<string,string>();
    //depending on project type
    if(selectTemplate.Attributes.TypeProj=="dotnet"){
        //Shows a selection list allowing multiple selections.
        let itemTarget:Array<ItemQuickPick>=[];
        //select target
        dotnetHelper.GetDotNetTargets().forEach((value, key) => {
            const item = new ItemQuickPick(value[1],"",value[0]);
            itemTarget.push(item);
        });
        SELECTED_ITEM = await vscode.window.showQuickPick(itemTarget,{title: 'Choose a .NET framework',placeHolder:`.NET framework`});
        if(!SELECTED_ITEM) return;
        //
        values.set("%{project.dotnet.targetframework}",<string>SELECTED_ITEM.value);
    }
    //values
    values.set("%{project.name}",nameProject);
    //Main process
    contextUI.Output(`Action: create an ${nameProject} project, ${selectTemplate.Attributes.Id} template, path ${selectFolder}, device ${selectDevice.Information.BoardName} ${selectDevice.Information.Architecture}`);
    contextUI.ShowBackgroundNotification(`Create an ${nameProject} project`);
    //Create project from a template
    result=selectTemplate.CreateProject(selectDevice,config,selectFolder,values);
    contextUI.HideBackgroundNotification();
    //Output       
    contextUI.Output(result.toStringWithHead());
    //Message
    contextUI.ShowNotification(result);
    if(result.Status==StatusResult.Ok) {
        //Open Workspace
        const folderPathParsed = "/"+selectFolder.split(`\\`).join(`/`);
        const folderUri = vscode.Uri.parse(folderPathParsed);
        vscode.commands.executeCommand(`vscode.openFolder`, folderUri);  
    }
}
