import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../../../IotResult';
import { IoTHelper } from '../../../Helper/IoTHelper';
import { webviewHelper } from '../../../Helper/webviewHelper';
import { typeConnectDeviceConfig } from '../../../Types/typeConnectDeviceConfig';
import { typeMessageAddDevice } from './typeMessageAddDevice';

export class WebViewAddDeviceSingleton {
  private static instance: WebViewAddDeviceSingleton;
  //
  private _panel?: vscode.WebviewPanel;
  private _connectDeviceConfig ?:typeConnectDeviceConfig;

  private constructor() { }

  public static getInstance(): WebViewAddDeviceSingleton {
    if (!WebViewAddDeviceSingleton.instance) {
      WebViewAddDeviceSingleton.instance = new WebViewAddDeviceSingleton();
    }
    return WebViewAddDeviceSingleton.instance;
  }

  /**
   * Init webview
   */
  public async Init(viewType: string, title: string, context: vscode.ExtensionContext,connectDeviceConfig?:typeConnectDeviceConfig): Promise<IotResult> {
    let result:IotResult;
    this._connectDeviceConfig=connectDeviceConfig;
    //
    try {
      // If no panel is open, create a new one and update the HTML
      if (!this._panel) {
        this._panel = vscode.window.createWebviewPanel(viewType, title,
            {viewColumn: vscode.ViewColumn.One, preserveFocus:true},
            {
                // Enable JavaScript in the webview
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory
                localResourceRoots: [context.extensionUri],
        });
        //events
        // If a panel is open and receives an update message, update the notes array and the panel title/html
        // vscode.window.showInformationMessage('nowAddDevice!');
        ///   console.log(deviceMsg);
        this._panel.webview.onDidReceiveMessage((message:typeMessageAddDevice) => {
          const command = message.command;
          switch (command) {
            case "requestData":
              if(this._panel) {
                const message:typeMessageAddDevice={
                  command: "receiveDataInWebview",
                  connectDeviceConfig:this._connectDeviceConfig
                };
                this._panel.webview.postMessage(message);
              }
              break;
          }
        });
        //Dispose
        this._panel.onDidDispose(
          () => {
            // When the panel is closed, cancel any future updates to the webview content
            this._panel = undefined;
            this._connectDeviceConfig = undefined;
          },
          null,
          context.subscriptions
        );
      }
      // If a panel is open, update the HTML with the selected item's content
      this._panel.title =  title;
      this._panel.webview.html = this.getWebviewContent(this._panel.webview, context.extensionUri);
      result= new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result= new IotResult(StatusResult.Error, `Error initializing add device webview`,err);
    }
    return Promise.resolve(result);
  }

  /**
 * Defines and returns the HTML that should be rendered within a notepad note view (aka webview panel).
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param note An object representing a notepad note
 * @returns A template string literal containing the HTML that should be
 * rendered within the webview panel
 */
private getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const webviewUri = webviewHelper.getUri(webview, extensionUri, ["out", "Ui", "webview", "WebViewAddDevice", "webview.js"]);
  const styleUri = webviewHelper.getUri(webview, extensionUri, ["assets", "webview", "style_adddevice.css"]);
  const bannerUri = webviewHelper.getUri(webview, extensionUri, ["assets", "webview", "embedded-linux_aw.png"]);
  const nonce = webviewHelper.getNonce();
  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${styleUri}">
          <title>qwe</title>
      </head>
      <body id="webview-body">
        <header>
          <h1>qwe</h1>
          <div id="tags-container"></div>
        </header>
        <p>JOPA<p/>
        <p>src=${bannerUri}<p/>
        <p>src=${webviewUri}<p/>
        <img src="${bannerUri}" alt="Girl in a jacket"> 
        <section id="notes-form">
          <vscode-text-field id="title" value="qwe" placeholder="Enter a name">Title</vscode-text-field>
          <vscode-text-area id="content"value="qwe" placeholder="Write your heart out, Shakespeare!" resize="vertical" rows=15>Note</vscode-text-area>
          <vscode-text-field id="tags-input" value="qwe" placeholder="Add tags separated by commas">Tags</vscode-text-field>
          <vscode-button id="submit-button">Save</vscode-button>
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
    `;
  }


   

   

   
}
