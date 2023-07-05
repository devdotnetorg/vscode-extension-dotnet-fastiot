import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { IYamlValidator } from './IYamlValidator';
import { IoTHelper } from '../Helper/IoTHelper';
import YAML from 'yaml';

export class YamlRedHatServiceSingleton {
  private static instance: YamlRedHatServiceSingleton;
  //
  private readonly _identifierExtension="redhat.vscode-yaml";
  private readonly _timeout = 60; // 30 sec
  private readonly _SCHEMA = "myschema";
  private _yamlExtension:vscode.Extension<any> | undefined;
  private _yamlExtensionAPI:any;
  private _schemas:Map<string,string>= new Map<string,string>();
  private _currentYamlFile:vscode.Uri=vscode.Uri.file("c://non");
  private _validationErrors:Array<string>=[];
  private _responseReceivedFlag=false;

  private constructor() { }

  public static getInstance(): YamlRedHatServiceSingleton {
    if (!YamlRedHatServiceSingleton.instance) {
      YamlRedHatServiceSingleton.instance = new YamlRedHatServiceSingleton();
    }
    return YamlRedHatServiceSingleton.instance;
  }

  private async InstallExtensionAsync(): Promise<IotResult> {
    let result:IotResult;
    let msg:string;
    try {
      msg=`You need to install the Red Hat's YAML ("${this._identifierExtension}") extension ` +
      `for .NET FastIoT to work. The installation will now complete. Please wait 2-3 minutes.`;
      vscode.window.showWarningMessage(msg);
      //StatusBar
      let statusBarBackground= vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right, 1000);
      msg=`Install Red Hat's YAML extension`;
      vscode.window.showWarningMessage(msg);
      statusBarBackground.text=`$(loading~spin) ${msg}`;
      statusBarBackground.tooltip=msg;
      statusBarBackground.show();
      //Install
      await vscode.commands.executeCommand(
        `workbench.extensions.installExtension`,
        `${this._identifierExtension}`
      );
      await vscode.commands.executeCommand("workbench.action.reloadWindow");
      //
      statusBarBackground.hide();
      statusBarBackground.dispose();
      //repeat
      this._yamlExtension = vscode.extensions.getExtension(this._identifierExtension);
      if(this._yamlExtension) {
        msg=`Red Hat's extension successfully installed`;
        vscode.window.showInformationMessage(msg);
        result= new IotResult(StatusResult.Ok, msg);
      }else {
        msg=`Red Hat's YAML extension failed to install`;
        vscode.window.showErrorMessage(msg);
        result= new IotResult(StatusResult.Error, msg);
      }
    } catch (err: any){
      //result
      msg=`Red Hat's YAML extension failed to install`;
      vscode.window.showErrorMessage(msg);
      result= new IotResult(StatusResult.Error, msg,err);
    }
    return Promise.resolve(result);
  }

  /**
   * redhat.vscode-yaml extension activation
   */
  public async ActivateAsync(): Promise<IotResult> {
    let result:IotResult;
    //check
    if(this._yamlExtension && this._yamlExtension.isActive && this._yamlExtensionAPI) {
      //ok
      result=new IotResult(StatusResult.Ok, "Red Hat's YAML extension is active");
      return Promise.resolve(result);
    }
    try {
      this._yamlExtension = vscode.extensions.getExtension(this._identifierExtension);
      if(!this._yamlExtension) {
        //need install
        result=await this.InstallExtensionAsync();
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
      }
      //activate
      this._yamlExtensionAPI = await this._yamlExtension?.activate();
      //func
      const onRequestSchemaURI = (resource: string): string | undefined => {
        if (resource.endsWith('.fastiot.yaml')) {
          const filename = path.parse(resource).base;
          //ex: "myschema://schema/template.fastiot"
          const schema=`${this._SCHEMA}://schema/${filename}`;
          return schema;
        }
        return undefined;
      };

      const onRequestSchemaContent = (schemaUri: string): string | undefined => {
        //ex: template.fastiot.yaml
        const parsedUri = vscode.Uri.parse(schemaUri);
        if (parsedUri.scheme !== this._SCHEMA) {
          return undefined;
        }
        if (!parsedUri.path || !parsedUri.path.startsWith('/')) {
          return undefined;
        }
        if (parsedUri.path.length<5) {
          return undefined;
        }
        //get schema
        schemaUri=parsedUri.path.substring(1,parsedUri.path.length-5);
        const file = this._schemas.get(schemaUri) ?? "c:\\file.yaml";
        //ex: "file:///d:/Anton/GitHub/vscode-extension-dotnet-fastiot/schemas/template.fastiot.schema.yaml"
        const fileData = fs.readFileSync(file, 'utf8');
        return fileData;
      };
      //register
      this._yamlExtensionAPI.registerContributor(this._SCHEMA, onRequestSchemaURI, onRequestSchemaContent);
      //Diagnostics
      vscode.languages.onDidChangeDiagnostics(e => {
        e.uris.forEach(fileUri => {
          if(this._currentYamlFile.fsPath==fileUri.fsPath) {
            let diagnostics = vscode.languages.getDiagnostics(fileUri);  // returns an array
            this._validationErrors=[];
            diagnostics.forEach(item => {
              this._validationErrors.push(item.message);
            });
            //
            this._responseReceivedFlag=true;
				    //close file
				    this.closeFileIfOpenAsync(fileUri);
          }
        });
			});
      //next
      result= new IotResult(StatusResult.Ok, "Red Hat's YAML extension is active");
    } catch (err: any){
      //result
      const errorMsg="Red Hat's YAML extension is not active";
      result = new IotResult(StatusResult.Error,errorMsg,err);
    }
    return Promise.resolve(result);
  }

  private AddSchema(schemaFilePath:string) {
    //template.fastiot.schema.yaml
    const filename = path.parse(schemaFilePath).base;
    //ex: "template.fastiot"
    const key = filename.substring(0,filename.length-31);
    //exist
    if(this._schemas.has(key)) return;
    //add
    this._schemas.set(key,schemaFilePath);
  }

  public async ValidateSchemaAsync(yamlFilePath:string, schemaFilePath:string):Promise<IotResult> {
    let result:IotResult;
    try {
      //Add schema
      this.AddSchema(schemaFilePath);
      //for response handler
      this._currentYamlFile=vscode.Uri.file(yamlFilePath);
      //adding a file to processing
      this._responseReceivedFlag=false;
      await vscode.workspace.openTextDocument(vscode.Uri.file(yamlFilePath));
      //waiting response
      for (let i = 0; i < this._timeout; i++) {
        await IoTHelper.Sleep(500);
        if(this._responseReceivedFlag) i=this._timeout;
      }
      //response
      if(this._responseReceivedFlag) {
        //ok
        const msg=`Response received from Red Hat's YAML extension`;
        result = new IotResult(StatusResult.Ok,msg);
        if(this._validationErrors.length>0) {
          result.returnObject=this._validationErrors;
        }
      }else {
        //no response received
        const errorMsg=`No response received from Red Hat's YAML extension. ValidateSchema pathFileYml = ${yamlFilePath}, schemaFileName = ${schemaFilePath}`;
        result = new IotResult(StatusResult.Error,errorMsg);
      }
    } catch (err: any){
      //result
      const errorMsg=`Red Hat's YAML extension error ValidateSchema pathFileYml = ${yamlFilePath}, schemaFileName = ${schemaFilePath}`;
      result = new IotResult(StatusResult.Error,errorMsg,err);
    }
    return Promise.resolve(result);
  }

  private async closeFileIfOpenAsync(file:vscode.Uri) : Promise<void> {
    const tabs: vscode.Tab[] = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
    const index = tabs.findIndex(tab => tab.input instanceof vscode.TabInputText && tab.input.uri.path === file.path);
    if (index !== -1) {
        await vscode.window.tabGroups.close(tabs[index]);
    }
  }
}
