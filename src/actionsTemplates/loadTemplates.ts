import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { IoTApplication } from '../IoTApplication';

export async function loadTemplates(app:IoTApplication,force:boolean=false): Promise<void> {
    return vscode.window.withProgress({
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
                if(event.increment&&typeof event.message === 'string'){
                    progress.report({ message: event.message,increment: event.increment });
                }else {
                    //output
                    if(event.message) {
                        if(event.logLevel) app.UI.Output(event.message,event.logLevel);
                            else app.UI.Output(event.message);
                    }
                }
            });
            //run
            await app.Templates.LoadEntitiesAll();
            //event unsubscription    
            app.Templates.OnChangedStateUnsubscribe(handler);
            resolve();
            //end
        });
      });
}
