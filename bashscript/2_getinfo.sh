#!/bin/bash
# Run: 
# chmod +x 2_getinfo.sh
# ./2_getinfo.sh

set -e #Exit immediately if a comman returns a non-zero status

#read info
# definition of variables
declare hostname="$(uname -n)"
declare architecture="$(uname -m)"
declare oskernel="$(uname -r)"
declare osname="$(lsb_release -i | sed 's/.*:\s*//')"
declare osdescription="$(lsb_release -d | sed 's/.*:\s*//')"
declare osrelease="$(lsb_release -r | sed 's/.*:\s*//')"
declare oscodename="$(lsb_release -c | sed 's/.*:\s*//')"
#

#json
declare JSON_STRING=$( jq -n \
                  --arg hostname "$hostname" \
                  --arg architecture "$architecture" \
                  --arg oskernel "$oskernel" \
				  --arg osname "$osname" \
				  --arg osdescription "$osdescription" \
				  --arg osrelease "$osrelease" \
				  --arg oscodename "$oscodename" \
                  '{hostname: $hostname, architecture: $architecture, oskernel: $oskernel, osname: $osname, osdescription: $osdescription, osrelease: $osrelease, oscodename: $oscodename}' )

echo $JSON_STRING
				  