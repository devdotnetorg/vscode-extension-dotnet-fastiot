import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { webviewHelper } from '../Helper/webviewHelper';
import { MessagePanelType } from '../Types/MessagePanelType';

export abstract class BasePanelDialog<T> {
  // Track currently webview panel
  protected _currentPanel?: vscode.WebviewPanel;
  protected _extensionUri?:vscode.Uri;
  protected _subscriptions?: { dispose(): any }[]; 
  private _answerData?:T;
  private _isAnswerReceived:boolean=true;
  private _fileNamePageResources:string;
  //
  private getWebviewContentBodyFromDerivative:() =>string;
  private onReceiveMessageFromDerivative:(message:MessagePanelType) => void;

  public constructor(fileNamePageResources:string) {
    this._fileNamePageResources=fileNamePageResources;
    //
    const getWebviewContentBodyFake = () => { return "";};
    const onReceiveMessageFake = (message:MessagePanelType) => {};
    this.getWebviewContentBodyFromDerivative=getWebviewContentBodyFake;
    this.onReceiveMessageFromDerivative=onReceiveMessageFake;
  }

  protected Init(
    getWebviewContentBody:() => string,
    onReceiveMessage:(message:MessagePanelType)=> void
  ) {
    this.getWebviewContentBodyFromDerivative=getWebviewContentBody;
    this.onReceiveMessageFromDerivative=onReceiveMessage;
  }

  /**
   * Activate webview
   */
  public async Activate (viewType?: string, title?: string, extensionUri?:vscode.Uri, subscriptions?: { dispose(): any }[], sendData?:T): Promise<IotResult> {
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
      if(!viewType||!title||!extensionUri||!subscriptions||!sendData) {
        //result
        result= new IotResult(StatusResult.Error,"Panel needs to be initialized");
        return Promise.resolve(result);
      }
      this._extensionUri=extensionUri;
      this._subscriptions=subscriptions;
      // If no panel is open, create a new one and update the HTML
      this._currentPanel = vscode.window.createWebviewPanel(viewType, title,
        {viewColumn: vscode.ViewColumn.One, preserveFocus:true},
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out/webview` directory
          localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "out","webview")],
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
        //derivative class
        this.onReceiveMessageFromDerivative(message);
      });
      //Dispose
      this._currentPanel.onDidDispose(
        () => {
          // When the panel is closed, cancel any future updates to the webview content
          this.Dispose();
        },
        null,
        this._subscriptions
      );
      // If a panel is open, update the HTML with the selected item's content
      this.UpdateContent();
      this.UpdateTitle(title);
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
  public async GetAnswer (token?:vscode.CancellationToken): Promise<T|undefined> {
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
    this._currentPanel?.dispose();
    this._extensionUri=undefined;
    this._subscriptions=undefined;
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
  public UpdateData(sendData:T) {
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
   * Update content
   */
  public UpdateContent() {
    if (this._currentPanel) {
      //get body
      let contentBody=this.getWebviewContentBodyFromDerivative();
      //replace

      //update
      this._currentPanel.webview.html = this.getWebviewContent(contentBody);
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within a notepad note view (aka webview panel).
   *
   * @param contentBody Html body content page
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private getWebviewContent(contentBody:string):string {
    if(!this._currentPanel || !this._extensionUri) {
      return "non";
    }
    const webview=this._currentPanel.webview;
    const extensionUri=this._extensionUri;
    const nonce = webviewHelper.getNonce();
    //base
    const codiconUri = webviewHelper.getUri(webview, extensionUri, ["out", "webview","codicon.css"]);
    const webviewUri = webviewHelper.getUri(webview, extensionUri, ["out","webview", `main-${this._fileNamePageResources}.js`]);
    const styleUri = webviewHelper.getUri(webview, extensionUri, ["out","webview", `style-${this._fileNamePageResources}.css`]);
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
            <link rel="stylesheet" id="vscode-codicon-stylesheet" href="${codiconUri}">
            <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            <title>${this._currentPanel.title}</title>
        </head>
        ${contentBody}
      </html>
    `;
  }
 
}
