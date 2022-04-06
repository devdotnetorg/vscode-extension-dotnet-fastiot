#!/bin/bash
# Run: 
# chmod +x testpackagelibgpiod.sh
# ./testpackagelibgpiod.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: testpackagelibgpiod.sh"

#
gpiodetect --version

echo "Successfully"
