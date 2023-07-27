#!/bin/bash
# Run: 
# chmod +x testpackagedotnetruntimes.sh
# ./testpackagedotnetruntimes.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: testpackagedotnetruntimes.sh"

#
dotnet --info

echo "Successfully"
