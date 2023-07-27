#!/bin/bash
# Run: 
# chmod +x 4_getinfoarmbian.sh
# ./4_getinfoarmbian.sh

set -e #Exit immediately if a comman returns a non-zero status

#read info
#Armbian
if [ -f /etc/armbian-release ]; then
	declare boardfamily="$(cat /etc/armbian-release | grep '^BOARDFAMILY=' | sed 's/.*=\s*//')"
	declare version="$(cat /etc/armbian-release | grep '^VERSION=' | sed 's/.*=\s*//')"
	declare linuxfamily="$(cat /etc/armbian-release | grep '^LINUXFAMILY=' | sed 's/.*=\s*//')"
	
	#json
	declare JSON_STRING=$( jq -n \
                  --arg boardfamily "$boardfamily" \
                  --arg version "$version" \
                  --arg linuxfamily "$linuxfamily" \
                  '{boardfamily: $boardfamily, version: $version, linuxfamily: $linuxfamily}' )
else
	#json
	declare JSON_STRING="{}"
fi

#json

echo $JSON_STRING
