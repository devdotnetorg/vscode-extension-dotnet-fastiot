import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { compare } from 'compare-versions';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Contain = IoT.Enums.Contain;
import EntityEnum = IoT.Enums.Entity;
import { IoTHelper } from '../Helper/IoTHelper';
import { IConfiguration } from '../Configuration/IConfiguration';
import { ClassWithEvent } from '../Shared/ClassWithEvent';
import { ISbc } from './ISbc';
import { SbcType } from '../Types/SbcType';
import { IoTSbc } from './IoTSbc';
import { IConfigSbcCollection } from './IConfigSbcCollection';

export class IoTSbcCollection <T extends ISbc> {
  private _items:Array<T>;
  private _config:IConfigSbcCollection;
  private _TCreator: new() => T;

  public get Count(): number {
      return this._items.length;}

  constructor(
    TCreator: new() => T,
    config: IConfigSbcCollection 
  ){
    this._items = new Array<T>();
    this._TCreator=TCreator;
    this. _config=config;
  }

  public FindById(id:string): T|undefined {
    let sbc = this._items.find(x=>x.Id==id);
    return sbc;
  }

  private GetUniqueLabel(newlabel:string,suffix:string, increment?:number): string{
    let checklabel=newlabel;
    if(increment) checklabel=`${newlabel} ${suffix}${increment}`;    
    const item = this._items.find(x=>x.Label==checklabel);
    if(item) {
      if(!increment) increment=0; 
      increment++;      
      checklabel= this.GetUniqueLabel(newlabel,suffix,increment);
    }
    return checklabel;   
  }

  public Add(value:T):IotResult {
    let result :IotResult;
    try {
      //unique SBC Check
      const sbc = this.FindById(value.Id);
      if(!sbc) {
        //unique label
        let label = value.Label;
        label = this.GetUniqueLabel(label,'#');
        value.Label=label;
        //add
        this._items.push(value);
        result = new IotResult(StatusResult.Ok);
      }else {
        result = new IotResult(StatusResult.Error,"SBC is already in the collection");
      }
    } catch (err: any){
      result = new IotResult(StatusResult.Error,"Error adding SBC to collection",err);
    }
    return result; 
  }

  public Remove(id:string):IotResult {
    let result :IotResult;
    result = new IotResult(StatusResult.Error,"No SBC found in collection");
    const sbc = this.FindById(id);
    if(sbc) {
      const index = this._items.indexOf(sbc, 0);
      if (index > -1) {
        this._items.splice(index, 1);
        result = new IotResult(StatusResult.Ok);
      } 
    }
    return result;
  }

  public Update(newValue:T):IotResult {
    let result :IotResult;
    result = this.Remove(newValue.Id);
    if(result.Status==StatusResult.Ok) {
      result = this.Add(newValue);
    }
    return result;
  }

  public Clear() {
    this._items=[];
  }

  public Load():IotResult {
    let result:IotResult;
    try {
      const jsonObj = JSON.parse(this._config.getProfilesSBCJson());
      //obj.sbcs
      if(jsonObj.sbcs) {
        this.FromJSON(jsonObj.sbcs);
      }
      result = new IotResult(StatusResult.Ok);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Error loading SBCs`,err);
    }
    return result;
  }

  public Save():IotResult {
    let result:IotResult;
    try {
      const strJSON=JSON.stringify(this.ToJSON());    
      this._config.setProfilesSBCJson(strJSON);
      result = new IotResult(StatusResult.Ok);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Error save SBCs`,err);
    }
    return result;
  }

  public ToJSON():any{
    //save JSON
    //obj.sbcs: SbcType[]
    try {
      let jsonObj = {
        sbcs:[]      
      }
      //foreach
      this._items.forEach(sbc => {
        const value=sbc.ToJSON();
        jsonObj.sbcs.push(<never>value);
      });
      //
      return jsonObj;
    } catch (err: any){}
    return {};
  }

  public FromJSON(jsonObj:SbcType[]):IotResult{
    let result:IotResult;
    try {
      //Load Sbcs from JSON format        
      let index=0;    
      let importedSbcs=0;
      do {
        let jsonSbc=jsonObj[index];
        if(jsonSbc) {
          //parse
          let sbc:T = new this._TCreator();
          sbc.FromJSON(jsonSbc);
          result = this.Add(sbc);
          if(StatusResult.Ok==result.Status) {
            //Ok
            importedSbcs++;
          }
          //next position
          index=index+1;
        }else break;
      } while(true)
      //result
      result = new IotResult(StatusResult.Ok,`Imported ${importedSbcs} of ${index} SBCs.`);
    }
    catch (err:any) {
      result = new IotResult(StatusResult.Error,`Error parsing JSON file `,err);
    }
    //result
    return result
  }

}
