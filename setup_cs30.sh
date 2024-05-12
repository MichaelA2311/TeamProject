#!/bin/bash

# Script to set up the development environment by exporting certain environment variables
# Run from project root directory as follows: source ./setup_cs30.sh

CS30_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
export CS30_DIR=$CS30_DIR