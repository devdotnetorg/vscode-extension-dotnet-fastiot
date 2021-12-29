#!/bin/bash
# Run: 
# chmod +x checkpackagedebugger.sh
# ./checkpackagedebugger.sh

set -e #Exit immediately if a comman returns a non-zero status

FILE=/usr/share/vsdbg/vsdbg
if [ -f "$FILE" ]; then
    echo "Installed [/usr/share/vsdbg]"
else 
    echo "notinstalled"
fi
