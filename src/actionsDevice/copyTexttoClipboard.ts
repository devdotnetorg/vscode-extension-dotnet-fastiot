import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotItemTree_d } from '../shared/IotItemTree_d';

export async function copyTexttoClipboard(item:IotItemTree_d): Promise<void> {                    
        let text="";
        if (item.description==item.tooltip){
            text=`${item.label}: ${item.description}`;
        } else
        {
            text=`${item.label}: ${item.tooltip}`;
        }
        vscode.env.clipboard.writeText(text);
}
