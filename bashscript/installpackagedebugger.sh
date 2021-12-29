#!/bin/bash
# Run: 
# chmod +x installpackagedebugger.sh
# ./installpackagedebugger.sh linux-arm64 /usr/share/vsdbg

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagedebugger.sh"

#
NET_RID="$1"
INSTALLPATH="$2"
#

if [ -z $NET_RID ]; then
	echo "Error: .NET RID not specified"
	exit 1;
fi

if [ -z $INSTALLPATH ]; then
	INSTALLPATH=/usr/share/vsdbg
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y curl

#install 
sudo mkdir -p $INSTALLPATH
curl -sSL https://aka.ms/getvsdbgsh | sudo bash /dev/stdin -r $NET_RID -v latest -l $INSTALLPATH

echo "Successfully"
