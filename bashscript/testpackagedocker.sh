#!/bin/bash
# Run: 
# chmod +x testpackagedocker.sh
# ./testpackagedocker.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: testpackagedocker.sh"

echo "----------------------"
docker --version
echo "----------------------"
sudo systemctl status docker
sudo docker version

declare ARCH_OS=$(uname -m) #aarch64, armv7l, x86_64 or riscv64
if [ $ARCH_OS != "riscv64" ]; then
	sudo docker info
fi

echo "Successfully"
