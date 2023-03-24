#!/bin/bash
# Run: 
# chmod +x testpackagedocker.sh
# ./testpackagedocker.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: testpackagedocker.sh"

sudo systemctl status docker
docker --version
docker version
sudo docker info

echo "Successfully"
