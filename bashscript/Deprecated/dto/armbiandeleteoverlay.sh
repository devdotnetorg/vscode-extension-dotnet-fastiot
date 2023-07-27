#!/bin/bash
# Run: 
# chmod +x armbiandeleteoverlay.sh
# ./armbiandeleteoverlay.sh /boot/dtb/allwinner/overlay/sun50i-a64-i2c1-bme280.dtbo

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbiandeleteoverlay.sh"

#
DELETE_OVERLAY="$1"

#
if [ -z $DELETE_OVERLAY ]; then
	echo "Error: OVERLAY not specified"
	exit 1;
fi

#delete *.dtbo
sudo rm $DELETE_OVERLAY

echo "Successfully"
