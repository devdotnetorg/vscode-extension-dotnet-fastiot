import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import {IoTHelper} from '../Helper/IoTHelper';
import { IotDevice } from '../IotDevice';
import { ItemQuickPick } from '../Helper/actionHelper';
import {IotTemplate} from '../Templates/IotTemplate';
import {IotTemplateAttribute} from '../Templates/IotTemplateAttribute';

export async function addLaunch(treeData:TreeDataLaunchsProvider,devices:Array<IotDevice>): Promise<void> {
    let values:Map<string,string>= new Map<string,string>();
    //Workspace		
    const workspaceDirectory = IoTHelper.GetWorkspaceFolder();
    if(!workspaceDirectory) {
        vscode.window.showErrorMessage(`Error. No Workspace. Open the menu: File -> Open Folder ...`);
        return;
    }
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
    let SELECTED_ITEM = await vscode.window.showQuickPick(itemDevices,{title: 'Choose a device (1/4):',});
    if(!SELECTED_ITEM) return;
    const selectDevice= <IotDevice>SELECTED_ITEM.value;
    //Select template
    //get id template
    let idTemplate=new IotTemplateAttribute().ForceGetID(workspaceDirectory+"\\template.fastiot.yaml");
    let selectTemplate:IotTemplate|undefined;
    if(idTemplate) 
        selectTemplate=treeData.Config.Templates.FindbyId(idTemplate);
    //
    if(selectTemplate)
    {
        //check platform
        const isCompatible=selectTemplate.IsCompatible1(selectDevice.Information.Architecture);
        if(!isCompatible) selectTemplate=undefined;
    }
    //
    if(selectTemplate)
    {
        //Choice of two options
        let items:Array<ItemQuickPick>=[];
        let item = new ItemQuickPick("1. Select template (recommended): "+<string>selectTemplate.Attributes.Label,
            `${selectTemplate.Attributes.Detail}. Language: ${selectTemplate.Attributes.Language}`,selectTemplate);
        items.push(item);
        item = new ItemQuickPick("2. Choose another template from the collection","",undefined);
        items.push(item);
        SELECTED_ITEM = await vscode.window.showQuickPick(items,{title: 'Select an action (2/4):',});
        if(!SELECTED_ITEM) return;
        selectTemplate=SELECTED_ITEM.value;
    }
    if(!selectTemplate)
    {
        //select template
        const listTemplates= treeData.Config.Templates.Select(selectDevice.Information.Architecture);
        if(listTemplates.length==0) {
            vscode.window.showErrorMessage(`No templates compatible with ${selectDevice.label} ${selectDevice.Information.Architecture} device`);
            return;
        }
        let itemTemplates:Array<ItemQuickPick>=[];
        listTemplates.forEach((template) => {
            const item = new ItemQuickPick(<string>template.Attributes.Label,
                `${template.Attributes.Detail}. Language: ${template.Attributes.Language}`,template);            
            itemTemplates.push(item);
        });
        SELECTED_ITEM = await vscode.window.showQuickPick(itemTemplates,{title: 'Choose a template (3/4):',});
        if(!SELECTED_ITEM) return;
        selectTemplate= <IotTemplate>SELECTED_ITEM.value;
    }
    //Find projects
    const projects=selectTemplate.FindProjects(workspaceDirectory);
    if (projects.length==0)
    {
        vscode.window.showErrorMessage(`Error. There are no projects in the folder: ${workspaceDirectory}`);
        return;
    }
    //Select Project
    let selectProject:string;       
    //Shows a selection list allowing multiple selections.
    let itemProjects:Array<ItemQuickPick>=[];
    projects.forEach((fileName) => {
        const label=fileName.substring(workspaceDirectory.length);
        const description=selectTemplate?.Attributes.MainFileProjLabel ?? "Non";
        const item = new ItemQuickPick(label,description,fileName);
        itemProjects.push(item);
    });
    SELECTED_ITEM = await vscode.window.showQuickPick(itemProjects,{title: 'Choose a project (4/4):'});
    if(!SELECTED_ITEM) return;
    selectProject=SELECTED_ITEM.value;
    //Preparing values
    const baseName=path.basename(selectProject);
    const projectName=baseName.substring(0,baseName.length-selectTemplate.Attributes.ExtMainFileProj.length);
    values.set("%{project.mainfile.path.full.aswindows}",selectProject);
    values.set("%{project.name}",projectName);
    //Main process
    treeData.OutputChannel.appendLine(`Action: adding Launch to the ${selectProject} project`);
    const result = await treeData.AddLaunch(selectDevice,selectTemplate,values);
    //Output
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    //Message
    if(result.Status==StatusResult.Ok)
    {
        vscode.window.showInformationMessage('Launch and tasks added successfully');
    }else {
        vscode.window.showErrorMessage(`Error. Launch and tasks not added! \n${result.Message}. ${result.SystemMessage}`);            
    }
    //Refresh
    treeData.RefreshsFull();
}

