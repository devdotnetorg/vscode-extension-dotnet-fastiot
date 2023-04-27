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
import { stringify } from 'querystring';
import { IoTApplication } from '../IoTApplication';
import { loadTemplates } from '../actionsTemplates/loadTemplates';

export async function createProject(app:IoTApplication,devices:Array<IotDevice>): Promise<void> {
    let result:IotResult;
    //Load template
    if(app.Templates.Count==0)
        await loadTemplates(app);
    //repeat
    if(app.Templates.Count==0) {
        result=new IotResult(StatusResult.No,`No templates available`);
        app.UI.ShowNotification(result);
        return;
    }
    //Devices
    if(devices.length==0) {
        result=new IotResult(StatusResult.No,`No devices. Add device`);
        app.UI.ShowNotification(result);
        return;
    }
    //Select Device
    const selectDevice = await app.UI.ShowDeviceDialog(devices,'Choose a device (1/6)');
    if(!selectDevice) return;
    //Select template
    const listTemplates= app.Templates.SelectByEndDeviceArchitecture(selectDevice.Information.Architecture);
    if(listTemplates.length==0) {
        result=new IotResult(StatusResult.No,`No templates for device ${selectDevice.label} ${selectDevice.Information.Architecture}`);
        app.UI.ShowNotification(result);
        return;
    }
    const selectTemplate = await app.UI.ShowTemplateDialog(listTemplates,'Choose a template (2/6)');
        if(!selectTemplate) return;
    //Select name project
    let nameProject = await vscode.window.showInputBox({				
        prompt: 'Enter the name of your application',
        title: 'Application name (3/6)',
        value: selectTemplate.Attributes.ProjName
    });
    if(!nameProject) return;
    nameProject=IoTHelper.StringTrim(nameProject);
    nameProject=IoTHelper.ConvertToValidFilename(nameProject,'_');
    if(dotnetHelper.CheckDotNetAppName(nameProject)){
        result=new IotResult(StatusResult.Error,`${nameProject}: The project name contains prohibited characters`);
        app.UI.ShowNotification(result);
        return;
    }
    //Select folder
    let selectFolder:string|undefined;
    selectFolder=path.join(app.Config.DefaultProjectFolder, nameProject);
    //Debug
    if(app.Config.ExtMode==vscode.ExtensionMode.Development)
        selectFolder=`${selectFolder}-${IoTHelper.CreateGuid()}`;
    let itemFolders:Array<ItemQuickPick>=[];
    let item = new ItemQuickPick(selectFolder,"(default)",selectFolder);
    itemFolders.push(item);
    item = new ItemQuickPick("$(folder) Browse ...","",undefined);
    itemFolders.push(item);
    const SELECTED_ITEM = await vscode.window.showQuickPick(
        itemFolders,{title: 'Create project (4/6)',placeHolder:`Select a folder for the project`});
    if(!SELECTED_ITEM) return;
    selectFolder=SELECTED_ITEM.value;
    if(!selectFolder) {
        const options: vscode.OpenDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: "Select a folder for the project (5/6)",
            openLabel: 'Select folder',
            defaultUri:vscode.Uri.file(app.Config.DefaultProjectFolder)
        };
        let folder:string;
        const folders = await vscode.window.showOpenDialog(options);
        if(!folders||folders.length==0) return;
        folder=folders[0].fsPath;
        //Project path confirmation
        folder=`${folder}\\${nameProject}`;
        selectFolder = await vscode.window.showInputBox({				
            prompt: 'Confirm project location',
            title: 'Project path (6/6)',
            value: folder
        });
        if(!selectFolder) return;
    }
    //
    selectFolder=IoTHelper.StringTrim(selectFolder);
    if (fs.existsSync(selectFolder)) {
        const files = fs.readdirSync(selectFolder);
        if(files.length>0) {
            result=new IotResult(StatusResult.Error,`Folder ${selectFolder} must be empty`);
            app.UI.ShowNotification(result);
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
        let SELECTED_ITEM = await vscode.window.showQuickPick(itemTarget,{title: 'Choose a .NET framework',placeHolder:`.NET framework`});
        if(!SELECTED_ITEM) return;
        //
        values.set("%{project.dotnet.targetframework}",<string>SELECTED_ITEM.value);
    }
    //values
    values.set("%{project.name}",nameProject);
    //Main process
    app.UI.Output(`Action: create an ${nameProject} project, ${selectTemplate.Attributes.Id} template, path ${selectFolder}, device ${selectDevice.Information.BoardName} ${selectDevice.Information.Architecture}`);
    app.UI.ShowBackgroundNotification(`Create an ${nameProject} project`);
    //Create project from a template
    result=selectTemplate.CreateProject(selectDevice,app.Config,selectFolder,values);
    app.UI.HideBackgroundNotification();
    //Output       
    app.UI.Output(result.toStringWithHead());
    //Message
    app.UI.ShowNotification(result);
    if(result.Status==StatusResult.Ok) {
        //Open Workspace
        const folderPathParsed = "/"+selectFolder.split(`\\`).join(`/`);
        const folderUri = vscode.Uri.parse(folderPathParsed);
        vscode.commands.executeCommand(`vscode.openFolder`, folderUri);  
    }
}
