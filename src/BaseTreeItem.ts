import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotDevice} from './IotDevice';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
import {IotItemTree} from './IotItemTree';
import {IotDevicePackage} from './IotDevicePackage';
import {IotConfiguration} from './IotConfiguration';
import {StatusResult,IotResult} from './IotResult';
import {SshClient} from './SshClient';

import SSH2Promise from 'ssh2-promise';
import SFTP from 'ssh2-promise';
import { stringify } from 'querystring';

import {EventDispatcher,Handler} from './EventDispatcher';
import { spawn } from 'child_process';
import { lookup } from 'dns';

//

export abstract class BaseTreeItem extends vscode.TreeItem {  
  public abstract Parent: BaseTreeItem| any| undefined;
  public abstract Childs: Array<BaseTreeItem| any>;
  public Client:SshClient;
    
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string|  undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,    
  ){    
    super(label, collapsibleState);
    this.description = description;    
    this.tooltip = tooltip
    //
    this.Client = new SshClient();
  }  
}
