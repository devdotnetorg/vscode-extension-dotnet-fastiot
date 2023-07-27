#!/bin/bash
# Run: 
# chmod +x 1_pregetinfo.sh
# ./1_pregetinfo.sh

# Run as root 

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: 1_pregetinfo.sh"

# definition of variables
declare ID_OS=("$(cat /etc/*release | grep '^ID=' | sed 's/.*=\s*//')") # ubuntu, debian, alpine
declare PACKAGELIST="lsb-release rsync jq sudo"
#

echo "System update and package installation: $PACKAGELIST"

if [ $ID_OS != "alpine" ]; then
	# ubuntu, debian
	export DEBIAN_FRONTEND="noninteractive"
	apt-get update
	apt-get install -y $PACKAGELIST
else
	# alpine
	apk update
	apk upgrade --available
	apk add --no-cache --upgrade $PACKAGELIST
fi

echo "System update and package installation completed successfully"

echo "Successfully"

#sudo dpkg-query -W -f='${Status}\n' lsb-release | head -n1 | awk '{print $3;}' | grep -q '^installed$' || (sudo apt-get update && sudo apt-get install -y lsb-release)
