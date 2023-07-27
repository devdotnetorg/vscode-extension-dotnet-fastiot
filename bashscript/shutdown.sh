#!/bin/bash
# Run: 
# chmod +x shutdown.sh
# ./shutdown.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: shutdown.sh"

# check inside docker container
if [ -f /.dockerenv ]; then
	echo "Error: running inside a docker container is not possible.";
	exit 1;
fi

echo "Command: sudo shutdown now"
sudo shutdown now
