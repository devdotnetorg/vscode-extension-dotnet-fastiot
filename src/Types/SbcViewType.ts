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
 * Custom view type to the SBC.
 */
export type SbcViewType = {
   id: string;
   indexsort?: number;
};
