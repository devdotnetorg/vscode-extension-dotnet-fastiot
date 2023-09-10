import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchView/LaunchNode';
import { IoTApplication } from '../IoTApplication';
import { IotDevice } from '../Deprecated/IotDevice';
import { loadTemplates } from '../actionsTemplate/loadTemplates';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,devices: Array<IotDevice>,item:LaunchNode,app:IoTApplication): Promise<void> {
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
   //Main process
   app.UI.Output(`Action: rebuild Launch. Launch: ${item.label}`);
   //app.UI.ShowBackgroundNotification(`Rebuild Launch. Launch: ${item.label}`);
   result = item.Launch.RebuildLaunch(app.Config,app.Templates,devices);
   //app.UI.HideBackgroundNotification();
   //Output
   app.UI.Output(result.toStringWithHead());
   //Message
   app.UI.ShowNotification(result);
   //Refresh
   treeData.LoadLaunches();
}
