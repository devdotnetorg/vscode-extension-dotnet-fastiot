#!/bin/bash
# Run: 
# chmod +x testpackagedebugger.sh
# ./testpackagedebugger.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: testpackagedebugger.sh"

#test
/usr/share/vsdbg/vsdbg --help

echo "Successfully"
