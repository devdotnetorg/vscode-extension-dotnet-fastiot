#!/bin/bash
# Run: 
# chmod +x uninstallpackagedotnetsdk.sh
# ./uninstallpackagedotnetsdk.sh /usr/share/dotnet

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: uninstallpackagedotnetsdk.sh"

#
PATHSDK="$1"
#

if [ -z $PATHSDK ]; then
	echo "Error: PATHSDK not specified"
	exit 1;
fi

#deleting a folder 
sudo rm -R $PATHSDK

#removing a symbolic link 
if [ -h /usr/bin/dotnet ]; then
	sudo rm /usr/bin/dotnet
fi

echo "Successfully"
