import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbcAccount } from '../Sbc/ISbcAccount';
import { IoT } from '../Types/Enums';
import Existences = IoT.Enums.Existences;
import AccountAssignment = IoT.Enums.AccountAssignment;
import { AddSBCConfigType } from './AddSBCConfigType';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { SbcAccountType } from './SbcAccountType';

/**
 * Custom type to the SBC.
 */
export type SbcType = {
   id: string;
   label: string;
   host: string;
   port: number;
   existence: string;
   //Info
   hostname: string;
   boardname: string;
   architecture: string;
   oskernel: string;
   osname:string;
   osdescription: string;
   osrelease: string;
   oscodename: string;
   // Parts
   accounts: SbcAccountType[];
};
