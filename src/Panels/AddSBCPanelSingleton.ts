import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { webviewHelper } from '../Helper/webviewHelper';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { MessagePanelType } from '../Types/MessagePanelType';

export class AddSBCPanelSingleton {
  private static instance: AddSBCPanelSingleton;
  // Track currently webview panel
  private _currentPanel?: vscode.WebviewPanel;
  private _contextVscode?: vscode.ExtensionContext;
  private _answerData?:AddSBCConfigType;
  private _isAnswerReceived:boolean=true;

  private constructor() { }

  public static getInstance(): AddSBCPanelSingleton {
    if (!AddSBCPanelSingleton.instance) {
      AddSBCPanelSingleton.instance = new AddSBCPanelSingleton();
    }
    return AddSBCPanelSingleton.instance;
  }

  /**
   * Activate webview
   */
  public async Activate (viewType?: string, title?: string, context?: vscode.ExtensionContext,sendData?:AddSBCConfigType): Promise<IotResult> {
    let result:IotResult;
    try {
      if (this._currentPanel) {
        //If we already have a panel, show it in the target column
        this._currentPanel.reveal(vscode.ViewColumn.One);
        //result
        result= new IotResult(StatusResult.Ok);
        return Promise.resolve(result);
      }
      //parameter check
      if(!viewType||!title||!context||!sendData) {
        //result
        result= new IotResult(StatusResult.Error,"Panel needs to be initialized");
        return Promise.resolve(result);
      }
      this._contextVscode=context;
      // If no panel is open, create a new one and update the HTML
      this._currentPanel = vscode.window.createWebviewPanel(viewType, title,
        {viewColumn: vscode.ViewColumn.One, preserveFocus:true},
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out/webview` directory
          localResourceRoots: [vscode.Uri.joinPath(this._contextVscode.extensionUri, "out","webview")],
      });
      //events
      this._currentPanel.webview.onDidReceiveMessage((message:MessagePanelType) => {
        const command = message.command;
        const content = message.content;
        switch (command) {
          case "requestData":
            if(this._currentPanel) {
              //message
              this.UpdateData(sendData);
            }
          break;
          case "answerData":
            //ok
            if(this._isAnswerReceived ==false ) {
              if (content) {
                this._answerData = JSON.parse(content);
              }
            }
            this._isAnswerReceived = true;
          break;
          case "answerClose":
            //cancel
            this._isAnswerReceived = true;
          break;
        }
      });
      //Dispose
      this._currentPanel.onDidDispose(
        () => {
          // When the panel is closed, cancel any future updates to the webview content
          this.Dispose();
        },
        null,
        this._contextVscode.subscriptions
      );
      // If a panel is open, update the HTML with the selected item's content
      this.UpdateTitle(title);
      this._currentPanel.webview.html = this.getWebviewContent();
      result= new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result= new IotResult(StatusResult.Error, `Error initializing ${viewType} panel`,err);
    }
    return Promise.resolve(result);
  }

  /**
   * Get an answer
   */
  public async GetAnswer (token?:vscode.CancellationToken): Promise<AddSBCConfigType|undefined> {
    this._isAnswerReceived=false;
    if(token) {
      token.onCancellationRequested(() => {
        console.log("User canceled the long running operation");
        this._isAnswerReceived=true;
        return;
      });
    }
    //circle          
    do{await IoTHelper.Sleep(300);}while(!this._isAnswerReceived);
    //Answer
    const result=this._answerData;
    //Dispose
    this.Dispose();
    //result
    return Promise.resolve(result);
  }

  /**
   * Dispose
   */
  public Dispose () {
    this._isAnswerReceived=true;
    this._answerData = undefined;
    this._contextVscode = undefined;
    this._currentPanel?.dispose();
    this._currentPanel = undefined;
  }

  /**
   * Update title
   */
  public UpdateTitle(title:string) {
    if(!this._currentPanel) return;
    //panel
    this._currentPanel.title =  title;
    //message to html
    //send message
    const message:MessagePanelType = {
      command: "updateTitle",
      content: title
    };
    this._currentPanel.webview.postMessage(message);
  }

  /**
   * Update data
   */
  public UpdateData(sendData:AddSBCConfigType) {
    if (this._currentPanel) {
      //send message
      const message:MessagePanelType = {
          command: "receiveDataInWebview",
          content:JSON.stringify(sendData)
        };
      this._currentPanel.webview.postMessage(message);
    }
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
  private getWebviewContent():string {
    if(!this._currentPanel || !this._contextVscode) {
      return "non";
    }
    const webview=this._currentPanel.webview;
    const extensionUri=this._contextVscode.extensionUri;
    //
    const webviewUri = webviewHelper.getUri(webview, extensionUri, ["out","webview", "main-add-sbc.js"]);
    const styleUri = webviewHelper.getUri(webview, extensionUri, ["out","webview", "style-add-sbc.css"]);
    const codiconUri = webviewHelper.getUri(webview, extensionUri, ["out", "webview","codicon.css"]);
    const nonce = webviewHelper.getNonce();
    //
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
            -->
            <meta
              http-equiv="Content-Security-Policy"
              content="
                default-src 'none';
                img-src ${webview.cspSource} https:;
                script-src ${webview.cspSource} nonce-${nonce};
                style-src ${webview.cspSource};
                font-src ${webview.cspSource};

                style-src 'unsafe-inline' ${webview.cspSource};
                style-src-elem 'unsafe-inline' ${webview.cspSource}; 
              "
            />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="${styleUri}">
            <link rel="stylesheet" href="${codiconUri}">
            <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            <title>${this._currentPanel.title}</title>
        </head>
        <body id="webview-body">
          <header>
            <h1 id ="title">${this._currentPanel.title}</h1>
            <div id="tags-container"></div>
          </header>
          <section class="component-row">
            <section class="component-container">
              <h2>SSH Credentials</h2>
              <p>Required to create a development board management account and debugging.</p>
              <p>The OpenSSH server must first be configured. How to do this in the <vscode-link href="https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Getting-started.md#getting-started">Preparing the device</vscode-link>.</p>
              <vscode-divider role="separator"></vscode-divider>
              <vscode-text-field id="host" placeholder="192.168.50.75">Hostname or IP address of the developer board:</vscode-text-field>
              <vscode-text-field id="port" value="22" placeholder="22">Port number:</vscode-text-field>
              <vscode-text-field id="username" value="root" placeholder="root">Username with sudo rights (usually root):</vscode-text-field>
              <vscode-text-field id="password" type="password" size="20">Password:</vscode-text-field>
            </section>
          </section>
          <section class="component-row">
            <section class="component-container">
              <h2>Options</h2>
              <p>Change only if necessary.</p>
              <vscode-divider role="separator"></vscode-divider>
              <vscode-collapsible
                title="Accounts"
                description="created to manage and debug the development board"
                class="collapsible">
                <div slot="body">
                  <h3>Debug</h3>
                  <p>Account to debugging applications:</p>
                  <p>Select ROOT if you have problems accessing /dev/* and /sys/* devices".</p>
                  <vscode-dropdown id="debugusername" position="below">
                    <vscode-option>option-1</vscode-option>
                  </vscode-dropdown>
                  <p>The ABC account will be added to the group(s): ABC</p>
                  <h3>Management</h3>
                  <p>Development board management account.</p>
                  <vscode-dropdown class="collapsible-element-end" id="managementusername" position="below">
                    <vscode-option>root</vscode-option>
                  </vscode-dropdown>
                  <p>The ABC account will be added to the group(s): ABC</p>
                </div>
              </vscode-collapsible>
              <vscode-collapsible
                title="Devices"
                description="work with devices such as GPIO, I2C, SPI, PWM, LED etc."
                class="collapsible">
                  <div slot="body">
                    <h3>Devices</h3>
                    <vscode-checkbox id="checkboxudev" checked>Add <vscode-link href="https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/linux/config/20-gpio-fastiot.rules">udev rules</vscode-link> for devices such as GPIO (recommended).</vscode-checkbox>
                    <p>More details in <vscode-link href="https://wiki.loliot.net/docs/linux/linux-tools/linux-udev/">Linux udev</vscode-link> post.</p>
                  </div>
              </vscode-collapsible>
            </section>
          </section>
          <section class="component-row-button">
            <section class="component-container-button"">
              <vscode-button id="button-submit">
                Create a development board profile
                <span slot="start" class="codicon codicon-add"></span>
              </vscode-button> 
            </section>
            <section class="component-container-button"">
              <vscode-button id="button-close" appearance="secondary">
                Close
                <span slot="start" class="codicon codicon-close"></span>
              </vscode-button>
            </section>
          </section>
        </body>
      </html>
      `;
  }
 
}
