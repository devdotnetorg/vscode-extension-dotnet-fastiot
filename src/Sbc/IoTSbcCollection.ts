import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { compare } from 'compare-versions';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Contain = IoT.Enums.Contain;
import EntityEnum = IoT.Enums.Entity;
import ChangeCommand = IoT.Enums.ChangeCommand;
import { IoTHelper } from '../Helper/IoTHelper';
import { IConfiguration } from '../Configuration/IConfiguration';
import { ClassWithEvent, ITriggerEvent, Handler } from '../Shared/ClassWithEvent';
import { ISbc } from './ISbc';
import { SbcType } from '../Types/SbcType';
import { IoTSbc } from './IoTSbc';
import { IConfigSbcCollection } from './IConfigSbcCollection';

export class IoTSbcCollection <T extends ISbc> extends ClassWithEvent {
  private _items:Array<T>;
  private _config:IConfigSbcCollection;
  private _TCreator: new() => T;
  private _eventHandlerSbcDictionary:Map<string, Handler<ITriggerEvent>>;

  public get Count(): number {
      return this._items.length;}

  constructor(
    TCreator: new() => T,
    config: IConfigSbcCollection 
  ){
    super();
    this._items = new Array<T>();
    this._TCreator = TCreator;
    this. _config = config;
    this._eventHandlerSbcDictionary = new Map<string,Handler<ITriggerEvent>>();
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
        value.SetLabel(label);
        //UniqueLabelCallback
        const getUniqueLabelCallback = (newlabel:string,suffix:string):string=> {
          return this.GetUniqueLabel(newlabel,suffix);
        };
        value.SetUniqueLabelCallback(getUniqueLabelCallback);
        //event subscription
        this.EventHandler(value);
        //add
        this._items.push(value);
        result = new IotResult(StatusResult.Ok);
        this.Trigger(ChangeCommand.add,value.Id);
      }else {
        result = new IotResult(StatusResult.Error,"SBC is already in the collection");
      }
    } catch (err: any){
      result = new IotResult(StatusResult.Error,"Error adding SBC to collection",err);
    }
    return result; 
  }

  private EventHandler(value:T) {
    //event subscription
    const handler=value.OnTriggerSubscribe(event => {
      this.Trigger(event.command,event.argument,event.obj);
    });
    //add
    //IdSbc, Handler<ITriggerEvent>
    this._eventHandlerSbcDictionary.set(value.Id,handler);
  }

  public Remove(id:string):IotResult {
    let result :IotResult;
    result = new IotResult(StatusResult.Error,"No SBC found in collection");
    const sbc = this.FindById(id);
    if(sbc) {
      const index = this._items.indexOf(sbc, 0);
      if (index > -1) {
        //event unsubscription
        const handler=this._eventHandlerSbcDictionary.get(sbc.Id);
        if(handler) {
          sbc.OnTriggerUnsubscribe(handler);
          this._eventHandlerSbcDictionary.delete(sbc.Id);
        } 
        //remove
        this._items.splice(index, 1);
        result = new IotResult(StatusResult.Ok,`${sbc.Label} ${sbc.Architecture} SBC removed successfully.`);
        this.Trigger(ChangeCommand.remove,id);
      } 
    }
    return result;
  }

  public Update(newValue:T):IotResult {
    let result :IotResult;
    //Remove
    result = new IotResult(StatusResult.Error,"No SBC found in collection");
    const sbc = this.FindById(newValue.Id);
    if(sbc) {
      const index = this._items.indexOf(sbc, 0);
      if (index > -1) {
        this._items.splice(index, 1);
        result = new IotResult(StatusResult.Ok);
      } 
    }
    if(result.Status!=StatusResult.Ok) {
      return result;
    }
    //Add
    try {
      //unique SBC Check
      const sbc = this.FindById(newValue.Id);
      if(!sbc) {
        //unique label
        let label = newValue.Label;
        label = this.GetUniqueLabel(label,'#');
        newValue.Label=label;
        //add
        this._items.push(newValue);
        result = new IotResult(StatusResult.Ok);
        this.Trigger(ChangeCommand.update,newValue.Id);
      }else {
        result = new IotResult(StatusResult.Error,"SBC is already in the collection");
      }
    } catch (err: any){
      result = new IotResult(StatusResult.Error,"Error adding SBC to collection",err);
    }
    return result; 
  }

  public Clear() {
    //event unsubscription
    this._items.forEach(sbc => {
      const handler=this._eventHandlerSbcDictionary.get(sbc.Id);
      if(handler) {
        sbc.OnTriggerUnsubscribe(handler);
        this._eventHandlerSbcDictionary.delete(sbc.Id);
      }
    });
    //clear
    this._items=[];
    this.Trigger(ChangeCommand.clear);
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

  public *getValues() { // you can put the return type Generator<number>, but it is ot necessary as ts will infer 
    let index = 0;
    while(true) {
        yield this._items[index];
        index = index + 1;
        if (index >= this.Count) {
            break;
        }
    }
  }

  /*
  public Rename(id:string, newLabel:string):IotResult {
    let result :IotResult;
    result = new IotResult(StatusResult.Error,"No SBC found in collection");
    const sbc = this.FindById(id);
    if(sbc) {
      if(newLabel=="") {
        result = new IotResult(StatusResult.Error,`The new name cannot be empty`);
        return result;
      }
      const newLabel2=this.GetUniqueLabel(newLabel,'#');
      if(newLabel!=newLabel2||sbc.Label==newLabel) {
        result = new IotResult(StatusResult.Error,`SBC with the name '${newLabel}' already exists`);
        return result;
      }
      sbc.Label=newLabel;
      result = new IotResult(StatusResult.Ok);
      this.Trigger(ChangeCommand.update,id);
    }
    return result;
  }
  */




}
