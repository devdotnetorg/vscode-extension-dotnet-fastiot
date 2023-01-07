import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotResult,StatusResult } from '../IotResult';
import {MakeDirSync} from '../Helper/IoTHelper';

export abstract class EntityRecovery {
  constructor(
    ){}

  protected RestoryDirStructure(sourceDir:string,destDir:string):IotResult
  {
    let result:IotResult;
    try {
      this.GetListNameBuiltInEntity(sourceDir).forEach(name => {
        //directory
        const dir=`${destDir}\\${name}`;
        //MkDir
        MakeDirSync(dir);
      });
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to create struct in ${destDir} path`,err);
    }
    return result;
  }

  protected GetListNameBuiltInEntity(sourceDir:string):string[]
  {
    let listNames:Array<string>=[];
    //getting a list of entity files
    const files = fs.readdirSync(sourceDir);
    files.forEach(name => {
      //file
      if(fs.lstatSync(name).isFile())
      {
        const re = /(?:\.([^.]+))?$/;
        const ext = re.exec(name);
        if(ext?.length==2)
        {
          if(ext[1]=="zip")
          {
            const nameTemplate=name.substring(0,name.length-4)
            listNames.push(nameTemplate);
          }
        }
      }
    });
    return listNames;
  }
}
