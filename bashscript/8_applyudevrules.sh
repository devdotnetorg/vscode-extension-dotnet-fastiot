#!/bin/bash
# Run: 
# chmod +x 8_applyudevrules.sh
# ./8_applyudevrules.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: 9_applyudevrules.sh"

#reload udev rules
echo "Reload udev rules"

# check inside docker container
if [ -f /.dockerenv ]; then
	echo "The script is executed inside the docker container."
	echo "UDEV subsystem is not in the docker container."
	exit 0;
fi
#

sudo udevadm control --reload-rules && sudo udevadm trigger

echo "Successfully"
