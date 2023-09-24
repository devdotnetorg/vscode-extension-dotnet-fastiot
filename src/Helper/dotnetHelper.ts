import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IoTHelper} from './IoTHelper';
import * as child_process from 'child_process';
import { satisfies } from 'compare-versions';
import { string } from 'yaml/dist/schema/common/string';
import { IotResult,StatusResult } from '../Shared/IotResult';

export class dotnetHelper {

  static GetDotNetRID(osName:string,architecture:string): string {
    // TODO: check rid
    //Platform
    //NET RID Catalog
    //https://docs.microsoft.com/en-us/dotnet/core/rid-catalog	
    let result:string;
    //	
      if(osName=="Alpine")
      {
      result="linux-musl-x64";
      }else
      {      
        switch(architecture) { 
          case "x86_64": { 
        result="linux-x64";
               break; 
          } 
          case "armv7l": { 
        result="linux-arm";
        break; 
          }
          case "aarch64": {
        result="linux-arm64";
        break; 
          } 
          default: {
        //statements;
        result="linux-arm";
        break; 
          } 
       }      
      }
    //
    return result;
  }

  /**
   * appname is used also as namespaces and rules for namespaces in C# are more restrictive
   * than those for folder names, so we have a custom check function
   * @param value appname
   */
  static CheckDotNetAppName(value:string) {
  //V1=^[a-zA-Z][a-zA-Z0-9_.]*[a-zA-Z0-9_]$
  //V2=^[A-Za-z]+[\s][A-Za-z]+[.][A-Za-z]+$
  var r = new RegExp("^[A-Za-z]+[\s][A-Za-z]+[.][A-Za-z]+$");
  return r.test(value);
  }

  static GetDotNetTargets(): Map<string,string[]> {
    //from https://learn.microsoft.com/en-us/dotnet/standard/frameworks
    let dictionary = new Map<string,string[]>();
    dictionary.set("8.0",["net8.0",".NET 8 (preview)"]);
    dictionary.set("7.0",["net7.0",".NET 7"]);
    dictionary.set("6.0",["net6.0",".NET 6 (LTS)"]);
    dictionary.set("5.0",["net5.0",".NET 5 (support ended)"]);
    dictionary.set("3.1",["netcoreapp3.1",".NET Core 3.1 (support ended)"]);
    return dictionary;
  }

  static GetDotNetValidNamespace(value:string): string {
    value=IoTHelper.StringTrim(value);
    value=IoTHelper.ConvertToValidFilename(value,"_");
    const re = new RegExp('-', 'g');
    value=value.replace(re,'_'); 
    return value;
  }

  static GetTargetFrameworkFromCsprojFile(filePath:string): string|undefined {
    try {
      //read *.csproj for get TargetFramework
      if (!fs.existsSync(filePath)) return undefined;
      const xmlFile:string= fs.readFileSync(filePath, 'utf8');
      let xpath = require('xpath');
      let dom = require('xmldom').DOMParser;
      let doc = new dom().parseFromString(xmlFile);
      let nodes = xpath.select("//TargetFramework", doc);
      const targetFramework=nodes[0].firstChild.data;
      return targetFramework;
    } catch (err: any){}
    return undefined;
  }

  static async GetDotNetListRuntimes(isGlobal?:boolean):Promise<Array<string[]>> {
    //location
    //local - C:\Users\Anton\AppData\Local\Microsoft\dotnet\dotnet.exe
    //global - dotnet
    let location:string;
    if(isGlobal) {
      location = "dotnet";
    }else {
      const userHomeDir = os.homedir();
      location=path.join(userHomeDir,"AppData","Local","Microsoft","dotnet","dotnet.exe");
    }
    let dictionary = new Array<string[]>
    try {
      if (process.platform === "win32") {
        let ps = child_process.execSync(`${location} --list-runtimes`).toString();
        const arrayRuntimes=ps.split(new RegExp("\r\n"));
        arrayRuntimes.forEach(element => {
          const line = element.split(' ');
          if(line.length>1) {
            const name = line[0];
            const ver = line[1];
            //add
            if(name&&ver&&name!=''&&ver!='')
              dictionary.push([IoTHelper.StringTrim(name),IoTHelper.StringTrim(ver)]);
          }
          
        });
      } else {
        //TODO: GetDotNetVer for Linux
        throw new Error("GetDotNetVer for Linux.");
      }
    } catch (err: any){}
    return Promise.resolve(dictionary);
  }

  static async CheckDotNet(needVersion:string):Promise<boolean> {
    const labelRuntime = "Microsoft.NETCore.App";
    let result = false;
    try {
      let listRuntimes = await dotnetHelper.GetDotNetListRuntimes();
      listRuntimes = listRuntimes.filter(item => item[0]== labelRuntime);
      if(listRuntimes.length==0) {
        listRuntimes = await dotnetHelper.GetDotNetListRuntimes(true);
        listRuntimes = listRuntimes.filter(item => item[0]== labelRuntime);
        if(listRuntimes.length==0) return Promise.resolve(result);
      } 
      //check ver
      for (let i = 0; i < listRuntimes.length; i++) {
        const ver = listRuntimes[i][1];
        //check
        result=satisfies(`${ver}`,`~${needVersion}`);
        if(result) break;
      }
    } catch (err: any){}
    return Promise.resolve(result);
  }

  static async CheckDotnetScript():Promise<boolean> {
    let result = false;
    //location
    //local - C:\Users\Anton\AppData\Local\Microsoft\dotnet\dotnet.exe
    //global - dotnet
    const command1="dotnet tool list";
    const userHomeDir = os.homedir();
    const location = path.join(userHomeDir,"AppData","Local","Microsoft","dotnet","dotnet.exe");
    const command2=`${location} tool list -g`;
    if (process.platform === "win32") {
      let ps:string="";
      try {
        ps = child_process.execSync(command1).toString();
      } catch (err: any){}
      if(!ps.includes("dotnet-script")) {
        try {
          ps = child_process.execSync(command2).toString();
          } catch (err: any){}
      }
      result=ps.includes("dotnet-script");
    }else {
      //TODO: GetDotNetVer for Linux
       throw new Error("GetDotNetVer for Linux.");
    }
    return Promise.resolve(result);
  }

  /*
  static async InstallDotNet(channelDotNet:string):Promise<IotResult> {
    const runtimeDotnet = "dotnet";
    let result = new IotResult(StatusResult.Ok,`Installing dotnet version: '${channelDotNet}'`);
    try {
      // --runtime ${runtimeDotnet} --channel${channelDotNet}
      const ps = child_process.spawnSync("powershell.exe", [
        "-NoProfile", "-ExecutionPolicy", "unrestricted", "-Command",
        `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing 'https://dot.net/v1/dotnet-install.ps1')))`
      ]);
      if(ps.error) {
        result= new IotResult(StatusResult.Error,`Error installing dotnet version: '${channelDotNet}'.`,ps.error.message);
      }
      if(ps.output) {
        result.AddSystemMessage(ps.output.toString())
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Error installing dotnet version: '${channelDotNet}'.`,err);
    }
    return Promise.resolve(result);
  }
  */

}
