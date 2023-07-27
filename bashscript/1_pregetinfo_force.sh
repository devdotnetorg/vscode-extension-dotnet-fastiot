#!/bin/bash
# Run: 
# chmod +x 1_pregetinfo_force.sh
# ./1_pregetinfo_force.sh

# Run as root 
# Mode: force

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: 1_pregetinfo_force.sh"

echo "Checking for packages: $PACKAGELIST"

#check packages
#lsb-release
lsb_release -a &>/dev/null || (echo "The lsb-release utility was not found. Continue is not possible." && exit 1;)
#rsync
rsync --version &>/dev/null || (echo "The rsync utility was not found. Continue is not possible." && exit 1;)
#jq
jq --version &>/dev/null || (echo "The jq utility was not found. Continue is not possible." && exit 1;)
#sudo
sudo --version &>/dev/null || (echo "The sudo utility was not found. Continue is not possible." && exit 1;)

echo "All the necessary utilities are found for the extension to work."

echo "Successfully"
