#!/bin/bash
# Run: 
# chmod +x pregetinformation.sh
# ./pregetinformation.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: pregetinformation.sh"

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y lsb-release rsync

echo "Successfully"

#sudo dpkg-query -W -f='${Status}\n' lsb-release | head -n1 | awk '{print $3;}' | grep -q '^installed$' || (sudo apt-get update && sudo apt-get install -y lsb-release)
