import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTApplication } from '../IoTApplication';
import { AppDomain } from '../AppDomain';

export async function loadTemplates(force:boolean=false): Promise<void> {
    const app = AppDomain.getInstance().CurrentApp;
    const guidBadge=app.UI.BadgeAddItem("Loading templates");
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Loading ... ",
        cancellable: false
    }, (progress, token) => {
        //token.onCancellationRequested(() => {
        //console.log("User canceled the long running operation");
        //});
        return new Promise(async (resolve, reject) => {
            //event subscription
            let handler=app.Templates.OnChangedStateSubscribe(event => {
                //Progress
                if(event.status)
                    progress.report({ message: event.status,increment: event.increment });
                //output
                if(event.message) {
                    if(event.logLevel) app.UI.Output(event.message,event.logLevel);
                        else app.UI.Output(event.message);
                }
            });
            //run
            await app.Templates.LoadEntitiesAll(force);
            //event unsubscription    
            app.Templates.OnChangedStateUnsubscribe(handler);
            resolve(undefined);
            //end
        });
    });
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
}
