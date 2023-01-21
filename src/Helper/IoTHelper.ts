import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IotDevice} from '../IotDevice';

export class IoTHelper {

  static Sleep (time:number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static MakeDirSync(dir: string) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
      IoTHelper.MakeDirSync(path.dirname(dir));
    }
    fs.mkdirSync(dir);
  }

  static GetWorkspaceFolder(): string| undefined {
    let folder = vscode.workspace.workspaceFolders;
    if (folder != undefined) return folder[0].uri.fsPath;
    return undefined;  	
  }

  static ReverseSeparatorReplacement(data:string): string {
    let regex = /\\/g;
    const result = data.replace(regex, "\\\\");  	
    return result;	
  }

  static ReverseSeparatorWinToLinux(data:string): string {
    let regex = /\\/g;
    const result = data.replace(regex, "/");  	
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
      checklabel=IoTHelper.GetUniqueLabel(newLabel,suffix,increment,arrayName);
    }
    return checklabel;   
  }

  static StringTrim(data:string): string {
    let regex = /\r?\n|\r/g;
    let result = data.replace(regex, " ");
    result=result.trimLeft();
    result=result.trimRight();
    return result;	
  }

  // TODO: Move to template class
  static MergeWithDictionary(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  static DeleteComments(data:string):string{
    //removes comments like '//'
    const matchHashComment = new RegExp(/(\/\/.*)/, 'gi');
    const resultJson = data.replace(matchHashComment, '').trim();
    return resultJson;
  }

  static ConvertToValidFilename(value:string,replacement:string) {
    return (value.replace(/[\/|\\:*?"<>]/g, replacement));
  }

}
 

 

 
 
 