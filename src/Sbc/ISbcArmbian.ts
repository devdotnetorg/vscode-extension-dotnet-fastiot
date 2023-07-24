import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcArmbianType } from '../Types/SbcArmbianType';

export interface ISbcArmbian {
  BoardFamily?: string; //BOARDFAMILY=sun50iw1 from cat /etc/armbian-release
  Version?: string; //VERSION=21.05.1 from cat /etc/armbian-release
  LinuxFamily?: string; //LINUXFAMILY=sunxi64 from cat /etc/armbian-release
  Parse(obj:any): IotResult;
  ToJSON():SbcArmbianType;
  FromJSON(obj:SbcArmbianType):void;
}
