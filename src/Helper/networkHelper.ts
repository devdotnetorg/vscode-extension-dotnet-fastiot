import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as stream from 'stream';
import * as util from 'util';
import axios from 'axios';
import ip from 'ip';
import * as dns from 'dns';
import tcpPortUsed from 'tcp-port-used';
import ping from 'pingman';
import {extendedPingOptions, pingOptions, pingResponse} from '@lolpants/pingman';

import {IoTHelper} from './IoTHelper';
import {IotResult,StatusResult } from '../IotResult';

export class networkHelper {
  static async GetIpAddress(hostName:string): Promise<IotResult>{
    let result:IotResult;
    let ipAddress:string;
    try {
      if(ip.isV4Format(hostName)){
        //IpAddress
        ipAddress=hostName;
      }else{
        //host
        const lookup = util.promisify(dns.lookup);
        let hostIp = await lookup(hostName);
        ipAddress = hostIp.address;
      }
      result = new IotResult(StatusResult.Ok,"IP-Address defined.");
      result.returnObject=ipAddress;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Unable to get IP-Address or invalid IP-Address. Host: ${hostName}.`,err);
    }
    return Promise.resolve(result);
  }

  static async PingHost(hostName:string, numberOfEchos = 3, timeout = 1): Promise<IotResult>{
    let result:IotResult;
    result=await this.GetIpAddress(hostName);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    const ipAddress=<string>result.returnObject;
    const msg=`The host is unavailable. Host: ${hostName} IP-Address: ${ipAddress}.`;
    try
    {
      const response = await ping(ipAddress,{logToFile:false, numberOfEchos: numberOfEchos, timeout: timeout, IPV4: true});
      const packetLoss =+(response.packetLoss ?? "100");
      if(packetLoss>50)
        result=new IotResult(StatusResult.Error, msg); else result=new IotResult(StatusResult.Ok,`Host ${ipAddress} is available.`); 
    } catch (err:any) {
      result=new IotResult(StatusResult.Error, msg,err);  
    }
    return Promise.resolve(result);
  }

  static async CheckTcpPortUsed(hostName:string, port: number): Promise<IotResult>{
    let result:IotResult;
    result=await this.GetIpAddress(hostName);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    const ipAddress=<string>result.returnObject;
    //next
    const msg=`${port} port unavailable. Host: ${hostName} IP-Address: ${ipAddress}.`;
    try
    {
      const inUse = await tcpPortUsed.check(port,ipAddress);
      if(inUse)
        result=new IotResult(StatusResult.Ok,`Network port ${port} host ${ipAddress} available.`); else result=new IotResult(StatusResult.Error,msg); 
    } catch (err:any) {
      result=new IotResult(StatusResult.Error, msg,err);  
    }
    return Promise.resolve(result);
  }

  static  finished = util.promisify(stream.finished);

  static async DownloadFileHttp(fileUrl: string, outputLocationPath: string): Promise<any> {
    const writer = fs.createWriteStream(outputLocationPath);
    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
      response.data.pipe(writer);
      return this.finished(writer); //this is a Promise
    });
  }

}
