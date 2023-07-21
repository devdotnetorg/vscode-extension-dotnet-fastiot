import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';

export class EntityRecovery {
  constructor(
    ){}

  public RestoryDirStructure(sourceDir:string,destDir:string):IotResult
  {
    let result:IotResult;
    try {
      this.GetListNameBuiltInEntity(sourceDir).forEach(name => {
        //directory
        const dir=path.join(destDir, name);
        //MkDir
        IoTHelper.MakeDirSync(dir);
      });
      result = new IotResult(StatusResult.Ok,`Created structure in ${destDir} folder`);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to create struct in ${destDir} path`,err);
    }
    return result;
  }

  protected GetListNameBuiltInEntity(sourceDir:string):string[]
  {
    let listNames:Array<string>=[];
    //getting a list of entity files
    if (!fs.existsSync(sourceDir)) return listNames;
    const files = fs.readdirSync(sourceDir);
    files.forEach(name => {
      //file
      if(fs.lstatSync(path.join(sourceDir, name)).isFile())
      {
        const extFile=IoTHelper.GetFileExtensions(name);
        if(extFile==".zip") {
            const nameTemplate=name.substring(0,name.length-4)
            listNames.push(nameTemplate);
          }
      }
    });
    return listNames;
  }
}
