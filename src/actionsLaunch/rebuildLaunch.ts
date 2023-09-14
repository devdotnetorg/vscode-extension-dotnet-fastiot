import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchView/LaunchNode';
import { IoTApplication } from '../IoTApplication';
import { ISbc } from '../Sbc/ISbc';
import { loadTemplates } from '../actionsTemplate/loadTemplates';
import { AppDomain } from '../AppDomain';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode): Promise<void> {
   let result:IotResult;
   const app = AppDomain.getInstance().CurrentApp;
   //Load template
   if(app.Templates.Count==0)
      await loadTemplates();
   //repeat
   if(app.Templates.Count==0) {
      result=new IotResult(StatusResult.No,`No templates available`);
      app.UI.ShowNotification(result);
      return;
   }
   //Main process
   app.UI.Output(`Action: rebuild Launch. Launch: ${item.label}`);
   //app.UI.ShowBackgroundNotification(`Rebuild Launch. Launch: ${item.label}`);
   result = item.Launch.RebuildLaunch(app.Config,app.Templates,app.SBCs.ToArray());
   //app.UI.HideBackgroundNotification();
   //Output
   app.UI.Output(result.toStringWithHead());
   //Message
   app.UI.ShowNotification(result);
   //Refresh
   treeData.LoadLaunches();
}
