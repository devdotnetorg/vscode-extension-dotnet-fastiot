import { typeConnectDeviceConfig } from '../../../Types/typeConnectDeviceConfig';

/**
 * Custom type declaration representing a Notepad note.
 */
export type typeMessageAddDevice = {
  command: string;
  connectDeviceConfig?: typeConnectDeviceConfig;
  content?: any;
  tag?: string;
};
