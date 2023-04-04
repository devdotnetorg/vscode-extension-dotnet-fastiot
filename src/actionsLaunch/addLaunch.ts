import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotDevice } from '../IotDevice';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IotTemplate } from '../Templates/IotTemplate';
import { IotTemplateAttribute } from '../Templates/IotTemplateAttribute';
import { IContexUI } from '../ui/IContexUI';

export async function addLaunch(treeData:TreeDataLaunchsProvider,devices:Array<IotDevice>,contextUI:IContexUI): Promise<void> {
    let result:IotResult;
    const workspaceDirectory=treeData.Config.Folder.WorkspaceDirectory;
    if(!workspaceDirectory) {
        result=new IotResult(StatusResult.No,`No Workspace. Open the menu: File -> Open Folder ... or create a project`);
        contextUI.ShowNotification(result);
        return;
    }
    //Load template
    if(treeData.Config.Templates.Count==0)
        await treeData.Config.Templates.LoadTemplatesAsync();
    //repeat
    if(treeData.Config.Templates.Count==0) {
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
    const selectDevice = await contextUI.ShowDeviceDialog(devices,'Choose a device (1/4)');
    if(!selectDevice) return;
    //Select template
    //get id template
    let idTemplate=new IotTemplateAttribute().ForceGetID(workspaceDirectory+"\\template.fastiot.yaml");
    let selectTemplate:IotTemplate|undefined;
    if(idTemplate)
        selectTemplate=treeData.Config.Templates.FindbyId(idTemplate);
    if(selectTemplate) {
        //check platform
        const isCompatible=selectTemplate.IsCompatible1(selectDevice.Information.Architecture);
        if(!isCompatible) selectTemplate=undefined;
    }
    if(selectTemplate) {
        //Choice of two options
        let items:Array<ItemQuickPick>=[];
        let item = new ItemQuickPick("1. Select template (recommended): "+<string>selectTemplate.Attributes.Label,
            `Language: ${selectTemplate.Attributes.Language}`,selectTemplate,`Detail: ${selectTemplate.Attributes.Detail}`);
        items.push(item);
        item = new ItemQuickPick("2. Choose another template from the collection","",undefined);
        items.push(item);
        let SELECTED_ITEM = await vscode.window.showQuickPick(items,{title: 'Select an action (2/4)'});
        if(!SELECTED_ITEM) return;
        selectTemplate=SELECTED_ITEM.value;
    }
    if(!selectTemplate) {
        //select template
        const listTemplates= treeData.Config.Templates.Select(selectDevice.Information.Architecture);
        if(listTemplates.length==0) {
            result=new IotResult(StatusResult.No,`No templates compatible with ${selectDevice.label} ${selectDevice.Information.Architecture} device`);
            contextUI.ShowNotification(result);
            return;
        }
        selectTemplate = await contextUI.ShowTemplateDialog(listTemplates,'Choose a template (3/4)');
        if(!selectTemplate) return;
    }
    //Find projects
    const projects=selectTemplate.FindProjects(workspaceDirectory);
    if (projects.length==0) {
        result=new IotResult(StatusResult.No,`There are no projects in the folder ${workspaceDirectory} compatible with ${selectTemplate.Attributes.Id}`);
        contextUI.ShowNotification(result);
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
    let SELECTED_ITEM = await vscode.window.showQuickPick(itemProjects,{title: 'Choose a project (4/4)',placeHolder:`Project`});
    if(!SELECTED_ITEM) return;
    selectProject=SELECTED_ITEM.value;
    //Preparing values
    const baseName=path.basename(selectProject);
    const projectName=baseName.substring(0,baseName.length-selectTemplate.Attributes.ExtMainFileProj.length);
    //values
    let values:Map<string,string>= new Map<string,string>();
    values.set("%{project.mainfile.path.full.aswindows}",selectProject);
    values.set("%{project.name}",projectName);
    //Main process
    contextUI.Output(`Action: adding Launch to the ${selectProject} project, template ${selectTemplate.Attributes.Id}, device ${selectDevice.Information.BoardName} ${selectDevice.Information.Architecture}`);
    contextUI.ShowBackgroundNotification(`Adding Launch to the ${selectProject} project`);
    result = 
        selectTemplate.AddConfigurationVscode(selectDevice,treeData.Config,
            workspaceDirectory,values);
    contextUI.HideBackgroundNotification();
    //Output
    contextUI.Output(result.toStringWithHead());
    //Message
    contextUI.ShowNotification(result);
    //Refresh
    treeData.LoadLaunches();
}
