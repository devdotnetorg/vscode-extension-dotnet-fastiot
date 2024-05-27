#!/bin/bash
# Run: 
# chmod +x installpackagelibgpiod.sh
# ./installpackagelibgpiod.sh options

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagelibgpiod.sh"
#
OP1="$1"
OP2="$2"
OP3="$3"
OP4="$4"
OP5="$5"
OP6="$6"
OP7="$7"

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y curl
#install
curl -SL --output setup-libgpiod.sh https://raw.githubusercontent.com/devdotnetorg/docker-libgpiod/fastiot/setup-libgpiod.sh
chmod +x setup-libgpiod.sh
sudo ./setup-libgpiod.sh $OP1 $OP2 $OP3 $OP4 $OP5 $OP6 $OP7

echo "Successfully"
