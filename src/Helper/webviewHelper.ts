import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as xss from 'xss';
import { Constants } from "../Constants"
import { IoTHelper } from './IoTHelper';

export class webviewHelper {
  /**
   * A helper function that returns a unique alphanumeric identifier called a nonce.
   *
   * @remarks This function is primarily used to help enforce content security
   * policies for resources/scripts being executed in a webview context.
   *
   * @returns A nonce
   */
  static getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * A helper function which will get the webview URI of a given file or resource.
   *
   * @remarks This URI can be used within a webview's HTML as a link to the
   * given file/resource.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @param pathList An array of strings representing the path to a file/resource
   * @returns A URI pointing to the file/resource
   */
  static getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) {
    return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
  }

  static FilterXSSForWebView(html:string):string {
    const options:xss.IFilterXSSOptions = {
      whiteList: Constants.WhiteListForWebView,
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"],
      css: false
    }; // Custom rules
    let myxss = new xss.FilterXSS(options);
    html = myxss.process(html);
    return html;
  }

}
