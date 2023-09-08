import { IoT } from './Enums';
import EntityEnum = IoT.Enums.Entity;

/**
 * Custom type for DTO to the SBC.
 */
export type SbcDtoType = {
   name:string;
   path:string;
   active:boolean;
   type:EntityEnum.system|EntityEnum.user;
};
