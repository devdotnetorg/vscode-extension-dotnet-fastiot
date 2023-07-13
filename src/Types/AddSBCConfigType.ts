/**
 * Custom type for the first connection to the SBC.
 */
export type AddSBCConfigType = {
   /** Hostname or IP address of the server. */
   host: string;
   /** Port number of the server. */
   port?: number;
   /** Username for authentication. */
   username?: string;
   /** Password for password-based user authentication. */
   password?: string;
   /** ssh keytype for key generation. Ex: ed25519-256 */
   sshkeytype?: string;
   /** Filename for udev rule. Ex: 20-gpio-fastiot.rules */
   udevfilename?: string;
   // TODO: List of udev rules filenames
   /** List of udev rules filenames */
   //udevfilenamelist?: string[];
   /** Username for debug. Ex: debugvscode */
   debugusername?: string;
   /** Groups for debugusername. Ex: gpio, i2c, and etc. */
   debuggroups?: string;
   /** Username for management. Ex: managementvscode */
   managementusername?: string;
   /** Group for managementusername. Ex: sudo */
   managementgroup?: string;
};