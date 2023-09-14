import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { ISbc } from '../Sbc/ISbc';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IotTemplate } from '../Template/IotTemplate';
import { IotTemplateAttribute } from '../Template/IotTemplateAttribute';
import { IoTApplication } from '../IoTApplication';
import { loadTemplates } from '../actionsTemplate/loadTemplates';
import { AppDomain } from '../AppDomain';

export async function addLaunch(treeData:TreeDataLaunchsProvider): Promise<void> {
    let result:IotResult;
    const app = AppDomain.getInstance().CurrentApp;
    const workspaceDirectory=app.Config.Folder.WorkspaceVSCode;
    if(!workspaceDirectory) {
        result=new IotResult(StatusResult.No,`No Workspace. Open the menu: File -> Open Folder ... or create a project`);
        app.UI.ShowNotification(result);
        return;
    }
    //Load template
    if(app.Templates.Count==0)
        await loadTemplates();
    //repeat
    if(app.Templates.Count==0) {
        result=new IotResult(StatusResult.No,`No templates available`);
        app.UI.ShowNotification(result);
        return;
    }
    //SBCs
    if(app.SBCs.Count==0) {
        result=new IotResult(StatusResult.No,`No SBCs. Add SBC`);
        app.UI.ShowNotification(result);
        return;
    }
    //Select SBC
    const selectSbc = await app.UI.ShowSbcDialog(app.SBCs.ToArray(),'Choose a single-board computer (1/4)');
    if(!selectSbc) return;
    //Select template
    //get id template
    let idTemplate=new IotTemplateAttribute("","").ForceGetID(path.join(workspaceDirectory, "template.fastiot.yaml"));
    let selectTemplate:IotTemplate|undefined;
    if(idTemplate)
        selectTemplate=app.Templates.FindById(idTemplate);
    if(selectTemplate) {
        //check platform
        const isCompatible=selectTemplate.IsCompatibleByEndSbcArchitecture(`${selectSbc.Architecture}`);
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
        const listTemplates= app.Templates.SelectByEndSbcArchitecture(selectSbc.Architecture);
        if(listTemplates.length==0) {
            result=new IotResult(StatusResult.No,`No templates compatible with ${selectSbc.Label} ${selectSbc.Architecture} SBC`);
            app.UI.ShowNotification(result);
            return;
        }
        selectTemplate = await app.UI.ShowTemplateDialog(listTemplates,'Choose a template (3/4)');
        if(!selectTemplate) return;
    }
    //Find projects
    const projects=selectTemplate.FindProjects(workspaceDirectory);
    if (projects.length==0) {
        result=new IotResult(StatusResult.No,`There are no projects in the folder ${workspaceDirectory} compatible with ${selectTemplate.Attributes.Id}`);
        app.UI.ShowNotification(result);
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
    selectProject=IoTHelper.ReverseSeparatorReplacement(selectProject);
    values.set("%{project.mainfile.path.full.aswindows}",selectProject);
    values.set("%{project.name}",projectName);
    //Main process
    app.UI.Output(`Action: adding Launch to the ${selectProject} project, template ${selectTemplate.Attributes.Id}, SBC ${selectSbc.BoardName} ${selectSbc.Architecture}`);
    //app.UI.ShowBackgroundNotification(`Adding Launch to the ${selectProject} project`);
    result = 
        selectTemplate.AddConfigurationVscode(selectSbc,app.Config,
            workspaceDirectory,values);
            //app.UI.HideBackgroundNotification();
    //Output
    app.UI.Output(result.toStringWithHead());
    //Message
    app.UI.ShowNotification(result);
    //Refresh
    treeData.LoadLaunches();
}
