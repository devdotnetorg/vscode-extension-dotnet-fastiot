#!/bin/bash
# Run: 
# chmod +x uninstallpackagedocker.sh
# ./uninstallpackagedocker.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: uninstallpackagedocker.sh"

#
sudo dpkg -l | grep -i docker
sudo apt-get purge -y docker-engine docker docker.io docker-ce docker-ce-cli
sudo apt-get autoremove -y --purge docker-engine docker docker.io docker-ce
#
sudo rm -rf /var/lib/docker /etc/docker
sudo rm /etc/apparmor.d/docker
sudo groupdel docker
sudo rm -rf /var/run/docker.sock

echo "Successfully"