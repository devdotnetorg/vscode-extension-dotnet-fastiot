/**
 * Custom type for the first connection to the SBC.
 */
export type AddSBCConfigType = {
   /** Hostname or IP address of the server. */
   host: string;
   /** Port number of the server. */
   port: number;
   /** Username for authentication. */
   username: string;
   /** Password for password-based user authentication. */
   password?: string;
   /** ssh keytype for key generation. Ex: ed25519-256 */
   sshkeytype?: string;
   /** Filename for udev rule. Ex: 20-gpio-fastiot.rules */
   filenameudevrules: string;
   /** List of udev rules filenames */
   listUdevRulesFiles?: string[];
   /** Username for debug. Ex: debugvscode */
   debugusername: string;
   /** Groups for debugusername. Ex: gpio, i2c, and etc. */
   debuggroups?: string[];
   /** Username for management. Ex: managementvscode */
   managementusername: string;
   /** Groups for managementusername. Ex: sudo */
   managementgroups?: string[];
};
