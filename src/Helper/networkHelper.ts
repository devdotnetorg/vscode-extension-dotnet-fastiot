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

  static async PingHost(hostName:string, numberOfEchos = 3, timeout = 1,getHostname:boolean=false): Promise<IotResult>{
    let result:IotResult;
    result=await this.GetIpAddress(hostName);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    const ipAddress=<string>result.returnObject;
    const msg=`The host is unavailable. Host: ${hostName} IP-Address: ${ipAddress}.`;
    const option:pingOptions = {
      numberOfEchos: numberOfEchos,
      timeout: timeout,
      logToFile: false,
      IPV4: true,
      numeric: getHostname
    };
    try
    {
      const response = await ping(ipAddress,option);
      const packetLoss =+(response.packetLoss ?? "100");
      if(packetLoss>50) {
        result=new IotResult(StatusResult.Error, msg);
      }else {
        result=new IotResult(StatusResult.Ok,`Host ${ipAddress} is available.`);
        if (getHostname&&response.host&&response.host!=``) result.returnObject=response.host;
      }
    } catch (err:any) {
      result=new IotResult(StatusResult.Error, msg,err);  
    }
    return Promise.resolve(result);
  }

  static async CheckTcpPortUsed(hostName:string, port: number,retryTimeMs:number=200,timeOutMs:number=1000): Promise<IotResult>{
    //[retryTimeMs] the retry interval in milliseconds - defaultis is 200ms
    //[timeOutMs] the amount of time to wait until port is free default is 1000ms
    let result:IotResult;
    result=await this.GetIpAddress(hostName);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    const ipAddress=<string>result.returnObject;
    //next
    const msg=`${port} port unavailable. Host: ${hostName} IP-Address: ${ipAddress}.`;
    const tcpPortUsedOptions:tcpPortUsed.TcpPortUsedOptions = {
      port: port,
      host: ipAddress,
      retryTimeMs: retryTimeMs,
      timeOutMs: timeOutMs
    };
    try
    {
      const inUse = await tcpPortUsed.check(tcpPortUsedOptions);
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

  static GetLocalIPaddress(): Map<string,string> {
    //otput: 1. wireless => 192.168.10.24
    let results:Map<string,string> = new Map<string,string>(); 
    try {
      const { networkInterfaces } = require('os');
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
            results.set(name,net.address);
          }
        }
      }
    } catch (err: any){}
    return results;
  }

  static async ScanRangeIPaddresses(firstAddress:string, lastAddress:string, token:vscode.CancellationToken|undefined=undefined,stateCallback:((state:string) =>void)|undefined=undefined): Promise<string[]> {
    let rangeIP:string[]=[];
    try {
      const firstIP=ip.toLong(firstAddress);
      const lastIP=ip.toLong(lastAddress);
      let IpAddress:string;
      let result:IotResult;
      for (let i = firstIP; i <= lastIP; i++) {
        if(token&&token.isCancellationRequested) {
          break;
        }
        IpAddress=ip.fromLong(i);
        //console.log(IpAddress);
        if(stateCallback) stateCallback(`IP-Address check ${IpAddress}`);
        result = await networkHelper.PingHost(IpAddress, 1);
        if(result.Status==StatusResult.Ok) rangeIP.push(IpAddress);
      }
    } catch (err: any){}
    return Promise.resolve(rangeIP);
  }

}
