#!/bin/bash
# Run: 
# chmod +x uninstallpackagedebugger.sh
# ./uninstallpackagedebugger.sh /usr/share/vsdbg

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: uninstallpackagedebugger.sh"

#
PATHSDK="$1"
#

if [ -z $PATHSDK ]; then
	echo "Error: PATHSDK not specified"
	exit 1;
fi

#deleting a folder
sudo rm -R $PATHSDK

echo "Successfully"
