#!/bin/bash
# Run: 
# chmod +x test.sh
# ./test.sh
# package: docker

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/docker/test.sh"

sudo systemctl status docker
docker --version
docker version
sudo docker info

echo "Successfully"
