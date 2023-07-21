import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchOptionNode } from '../LaunchOptionNode';
import { IoTHelper } from '../Helper/IoTHelper';
import { IContexUI } from '../ui/IContexUI';
import { IotDevice } from '../IotDevice';
import { IotTemplate } from '../Templates/IotTemplate';
import { ItemQuickPick } from '../Helper/actionHelper';

export async function changeOption(treeData: TreeDataLaunchsProvider,node:LaunchOptionNode): Promise<void> {                    
    //Options
    let itemOptions:Array<ItemQuickPick>=[];
    node.Values.forEach((value,key) => {
        let label=`${key}`;
        if(`${key}`==`${node.description}`)
            label=`(current) ${label}`;
        let description="";
        if(key==node.GetDefaultValue())
            description="(default)";
        const detail=value;
        const item = new ItemQuickPick(label,description,key,detail);
        itemOptions.push(item);
    });
    //Select
    const SELECTED_ITEM = await vscode.window.showQuickPick(itemOptions,{title: `${node.Headtooltip}`, placeHolder:`Select`});
    if(!SELECTED_ITEM) return;
    const newValue=SELECTED_ITEM.value;
    node.WriteValue(newValue);
    //Refresh
    treeData.Refresh();
}
