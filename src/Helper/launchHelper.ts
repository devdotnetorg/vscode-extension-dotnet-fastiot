import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IoTHelper} from './IoTHelper';
import {IotResult,StatusResult } from '../IotResult';

export class launchHelper {

  static FixUniqueLabel(fileLaunchPath:string): IotResult {
    let result:IotResult;
    try {
      let dataLaunch:string= fs.readFileSync(fileLaunchPath,'utf8');
      dataLaunch=IoTHelper.DeleteComments(dataLaunch);
      //toJSON
      let jsonDataLaunch = JSON.parse(dataLaunch);
      //Get current labels
      let arrayLabels: Array<string>=[];
      jsonDataLaunch.configurations.forEach((element:any) => {
        arrayLabels.push(element.name);
      });
      //main
      let index=1;
      do {
        let item=arrayLabels[index];
        if(item) {
          let remainderArrayLabels: Array<string>=[];
          remainderArrayLabels=arrayLabels.slice(0,index);
          if(remainderArrayLabels.length==0) break;
          const newItem=launchHelper.GetUniqueLabel(item,'#',undefined,remainderArrayLabels);
          if(item!=newItem) {
            arrayLabels[index]=newItem;
            //zero position
            //index=0;
          }else{
            //next position
            index=index+1;
          }
        }else break;      
      } 
      while(true)
      //replace in file
      let changed=false;
      index=0;
      do { 				
            let item=jsonDataLaunch.configurations[index];
            if(item) {
              const oldName = item.name;
              const newName = arrayLabels[index];
              if(oldName!=newName)
              {
                //replace
                jsonDataLaunch.configurations[index].name=newName;
                changed=true;
              }
              //next position
              index=index+1;
            }else break;      
      } 
      while(true)
      //save in file
      if(changed){
        //toTXT
        dataLaunch=JSON.stringify(jsonDataLaunch,null,2);
        fs.writeFileSync(fileLaunchPath, dataLaunch,undefined);
      }
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Unable to set unique names for Launch in ${fileLaunchPath} file`,err);
    }
    return result;
  }

  static GetUniqueLabel(newLabel:string,suffix:string, increment:number|undefined,arrayName: Array<string>):string{
    let checklabel=newLabel;
    if(increment) checklabel=`${newLabel} ${suffix}${increment}`;    
    const item = arrayName.find(x=>x==checklabel);
    if(item)
    {
      if(!increment) increment=0; 
      increment++;      
      checklabel=launchHelper.GetUniqueLabel(newLabel,suffix,increment,arrayName);
    }
    return checklabel;   
  }

}
