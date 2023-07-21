import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { BasePanelDialog } from '../Shared/BasePanelDialog';
import { webviewHelper } from '../Helper/webviewHelper';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { MessagePanelType } from '../Types/MessagePanelType';

export class AddSBCPanelSingleton extends BasePanelDialog<AddSBCConfigType>{
  private static instance: AddSBCPanelSingleton;

  private constructor() {
    super("add-sbc");
    this.Init(this.getWebviewContentBody,this.onReceiveMessage);
  }

  public static getInstance(): AddSBCPanelSingleton {
    if (!AddSBCPanelSingleton.instance) {
      AddSBCPanelSingleton.instance = new AddSBCPanelSingleton();
    }
    return AddSBCPanelSingleton.instance;
  }

  /**
   * Handling incoming messages from the page
   */
  protected onReceiveMessage (message:MessagePanelType) {
    //console.log(message);
  }

  /**
   * Page body render
   */
  protected getWebviewContentBody ():string {
    if(!this._currentPanel) {
      return "non";
    }
    //
    return /*html*/ `
      <body id="webview-body">
        <header>
          <h1 id ="title">${this._currentPanel.title}</h1>
        </header>
        <section class="component-row">
          <section class="component-container">
            <h2>SSH Credentials</h2>
            <p>Required to create a single-board computer management account and debugging.</p>
            <p>The OpenSSH server must first be configured. How to do this in the <vscode-link href="https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Getting-started.md#getting-started">Preparing the device</vscode-link>.</p>
            <vscode-divider role="separator"></vscode-divider>
            <vscode-text-field id="host" placeholder="192.168.50.75">Hostname or IP address of the single-board computer:</vscode-text-field>
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
              description="created to manage and debug the single-board computer"
              class="collapsible">
              <div slot="body">
                <h3>Debug</h3>
                <p>Account to debugging applications:</p>
                <p>Select ROOT if you have problems accessing /dev/* and /sys/* devices".</p>
                <vscode-dropdown id="debugusername" position="below">
                  <vscode-option>option-1</vscode-option>
                </vscode-dropdown>
                <p id="debuggroupstext">The ABC account will be added to the group(s):</p>
                <div id="container-tags-debuggroups" class="tags-container">tags</div>
                <h3>Management</h3>
                <p>Single-board computer management account.</p>
                <vscode-dropdown class="collapsible-element" id="managementusername" position="below">
                  <vscode-option>root</vscode-option>
                </vscode-dropdown>
                <p id="managementgroupstext">The ABC account will be added to the group(s):</p>
                <div id="container-tags-managementgroups" class="tags-container">tags</div>
              </div>
            </vscode-collapsible>
            <vscode-collapsible
              title="Devices"
              description="work with devices such as GPIO, I2C, SPI, PWM, LED etc."
              class="collapsible">
                <div slot="body">
                  <h3>Device permissions</h3>
                  <p>Files:</p>
                  <vscode-dropdown class="collapsible-element" id="filenameudevrules" position="below">
                  </vscode-dropdown>
                  <p>Select udev rules file for devices such as GPIO (recommended).</vscode-checkbox>
                  <p class="collapsible-element-end">More details in <vscode-link href="https://wiki.loliot.net/docs/linux/linux-tools/linux-udev/">Linux udev</vscode-link> post.</p>
                </div>
            </vscode-collapsible>
          </section>
        </section>

        <section class="component-row-button">
          <div class="buttons-container">
            <vscode-button id="button-submit">
              Create a single-board computer profile
              <span slot="start" class="codicon codicon-add"></span>
            </vscode-button> 
            <vscode-button id="button-close" appearance="secondary">
              Close
              <span slot="start" class="codicon codicon-close"></span>
            </vscode-button>
          </div>
        </section>
      </body>
    `;
  }
 
}
