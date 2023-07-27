#!/bin/bash
# Run: 
# chmod +x pregetinformation.sh
# ./pregetinformation.sh

# Run as root 

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: pregetinformation.sh"

#
PACKAGELIST="lsb-release rsync jq sudo curl wget"
#

export DEBIAN_FRONTEND="noninteractive"

echo "System update and package installation: $PACKAGELIST"

apt-get update
apt-get install -y $PACKAGELIST

echo "System update and package installation completed successfully"

echo "Successfully"

#sudo dpkg-query -W -f='${Status}\n' lsb-release | head -n1 | awk '{print $3;}' | grep -q '^installed$' || (sudo apt-get update && sudo apt-get install -y lsb-release)
