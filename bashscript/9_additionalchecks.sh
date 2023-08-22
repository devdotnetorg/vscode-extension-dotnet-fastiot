#!/bin/bash
# Run: 
# chmod +x 9_additionalchecks.sh
# ./9_additionalchecks.sh

set -e #Exit immediately if a comman returns a non-zero status

# delete key from 5_createaccount.sh
KEYFILEPATH=~/vscode_authorized_key

if [ -f $KEYFILEPATH ]; then
	rm $KEYFILEPATH
fi

# check Physical Or Virtual Machine
# https://ostechnix.com/check-linux-system-physical-virtual-machine/

sudo apt-get install dmidecode &>/dev/null

PLATFORMSBC="OK"

sudo dmidecode -s system-manufacturer &>/dev/null || (PLATFORMSBC="None")

if [ "$PLATFORMSBC" == "OK" ]; then
	PLATFORMSBC="$(sudo dmidecode -s system-manufacturer)"
fi

#json
declare JSON_STRING=$( jq -n \
			  --arg platformsbc "$PLATFORMSBC" \
			  '{platformsbc: $platformsbc}' )

#json

echo $JSON_STRING
