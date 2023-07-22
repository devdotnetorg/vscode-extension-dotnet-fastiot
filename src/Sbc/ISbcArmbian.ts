import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ISbcArmbian {
  BoardFamily?: string; //BOARDFAMILY=sun50iw1 from cat /etc/armbian-release
  Version?: string; //VERSION=21.05.1 from cat /etc/armbian-release
  LinuxFamily?: string; //LINUXFAMILY=sunxi64 from cat /etc/armbian-release
  
  ToJSON():any;
  FromJSON(obj:any):any;
}
