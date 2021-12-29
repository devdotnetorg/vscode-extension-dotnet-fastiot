#!/bin/bash
# Run: 
# chmod +x armbiangetalloverlays.sh
# ./armbiangetalloverlays.sh

set -e #Exit immediately if a comman returns a non-zero status

#read info

echo "overlay_prefix:$(cat /boot/armbianEnv.txt | grep overlay_prefix | sed 's/overlay_prefix=//g')"
echo "overlays:$(cat /boot/armbianEnv.txt | grep overlays | sed 's/overlays=//g')"
