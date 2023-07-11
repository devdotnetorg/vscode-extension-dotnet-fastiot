/**
 * Custom type for the first connection to the device.
 */
export type typeConnectDeviceConfig = {
   /** Hostname or IP address of the server. */
   host: string;
   /** Port number of the server. */
   port?: number;
   /** Username for authentication. */
   username?: string;
   /** Password for password-based user authentication. */
   password?: string;
   /** Username for debug. Ex: debugvscode */
   debugusername?: string;
   /** Group for debugusername. Ex: sudo */
   debuggroup?: string;
   /** ssh keytype for key generation. Ex: ed25519-256 */
   sshkeytype?: string;
};
