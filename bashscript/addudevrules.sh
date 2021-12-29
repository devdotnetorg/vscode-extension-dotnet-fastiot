#!/bin/bash
# Run: 
# chmod +x addudevrules.sh
# ./addudevrules.sh debugvscode

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: addudevrules.sh"

#
NEWUSERNAME="$1"

#
if [ -z $NEWUSERNAME ]; then
	echo "Error: NEWUSERNAME not specified"
	exit 1;
fi

#create udev rules
sudo groupadd --force gpio
sudo usermod -aG gpio $NEWUSERNAME
sudo usermod -aG video $NEWUSERNAME &>/dev/null || echo "Group video does not exist"
sudo usermod -aG i2c $NEWUSERNAME &>/dev/null || echo "Group  i2c does not exist"
sudo usermod -aG spi $NEWUSERNAME &>/dev/null || echo "Group spi does not exist"
sudo usermod -aG spidev $NEWUSERNAME &>/dev/null || echo "Group spidev does not exist"
sudo usermod -aG kmem $NEWUSERNAME &>/dev/null || echo "Group kmem does not exist"
sudo usermod -aG tty $NEWUSERNAME &>/dev/null || echo "Group tty does not exist"
sudo usermod -aG dialout $NEWUSERNAME &>/dev/null || echo "Group dialout does not exist"
sudo usermod -aG input $NEWUSERNAME &>/dev/null || echo "Group input does not exist"
sudo usermod -aG audio $NEWUSERNAME &>/dev/null || echo "Group audio does not exist"

#reload udev rules
sudo udevadm control --reload-rules && udevadm trigger

echo "Successfully"
