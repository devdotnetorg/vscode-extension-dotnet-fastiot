#!/bin/bash
# Run: 
# chmod +x shutdown.sh
# ./shutdown.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: shutdown.sh"

echo "Command: sudo shutdown now"
sudo shutdown now
