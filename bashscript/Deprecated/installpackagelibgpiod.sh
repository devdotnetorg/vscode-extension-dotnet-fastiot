#!/bin/bash
# Run: 
# chmod +x installpackagelibgpiod.sh
# ./installpackagelibgpiod.sh 1.6.3 /usr/share/libgpiod

# '1.6.3', 'checkinrepository','installfromrepository'

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagelibgpiod.sh"
#
LIBGPIOD_VERSION="$1"
INSTALLPATH="$2"

#
#Check the version of Libgpiod in the repository
if [ $LIBGPIOD_VERSION == "checkinrepository" ]; then
	echo "Check the version of Libgpiod in the repository"
	sudo apt-get update
	sudo apt list libgpiod-dev
	echo "Successfully"	
	exit 0
fi

#Install Libgpiod from repository
if [ $LIBGPIOD_VERSION == "installfromrepository" ]; then
	echo "Install Libgpiod from repository"
	sudo apt-get update
	sudo apt-get install -y libgpiod-dev gpiod
	gpiodetect --version
	echo "Successfully"	
	exit 0
fi

#Install Libgpiod from source
if [ -z $LIBGPIOD_VERSION ]; then
	echo "Error: library version not specified"
	exit 1;
fi

if [ -z $INSTALLPATH ]; then
	INSTALLPATH=/usr/share/libgpiod
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y curl

#install
curl -SL --output setup-libgpiod.sh https://raw.githubusercontent.com/devdotnetorg/docker-libgpiod/master/setup-libgpiod.sh
chmod +x setup-libgpiod.sh
sudo ./setup-libgpiod.sh $LIBGPIOD_VERSION $INSTALLPATH

gpiodetect --version

echo "Successfully"
