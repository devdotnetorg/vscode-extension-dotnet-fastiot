import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbcAccount } from '../Sbc/ISbcAccount';
import { IoT } from '../Types/Enums';
import Existence = IoT.Enums.Existence;
import AccountAssignment = IoT.Enums.AccountAssignment;
import { AddSBCConfigType } from './AddSBCConfigType';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { SbcAccountType } from './SbcAccountType';
import { SbcArmbianType } from './SbcArmbianType';
import { SbcDtoType } from '../Types/SbcDtoType';

/**
 * Custom type to the Device V1.
 */
export type FormatV1DeviceType = {
   formatVersion: number;
   existence: string;
   idDevice: string;
   label: string;
   description: string;
   tooltip: string;
   collapsibleState: number;
   IotDeviceAccount:{
      collapsibleState:number;
      host: string;
      port: string;
      userName: string;
      identity: string;
      groups: string [];
   };
   IotDeviceInformation:{
      collapsibleState: number,
      hostname: string;
      architecture: string;
      osKernel: string;
      osName: string;
      osDescription: string;
      osRelease: string;
      osCodename: string;
      boardName?: string;
      boardFamily?: string;
      armbianVersion?: string;
      linuxFamily?: string;
   };
   IotPackages: [{
      name:string;
      version:string;
   }];
   IotDTO: {
      config: {
         overlay_prefix: string;
         overlaydir: string;
      };
      items:[{
         name:string;
         enabled:boolean;
         fspath:string;
      }];
   };
   IotGpiochips: [{
      id:number;
      name:string;
      description:string;
      numberlines:number;
   }];
};
