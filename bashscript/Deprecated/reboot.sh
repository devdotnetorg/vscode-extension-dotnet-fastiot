#!/bin/bash
# Run: 
# chmod +x reboot.sh
# ./reboot.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: reboot.sh"

echo "Command: sudo reboot"
sudo reboot
