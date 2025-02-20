#!/usr/bin/env bash
set -e

# Create portal directory if it doesn't exist
mkdir -p portal

# Process each .sol file in the contracts directory
for contract in contracts/*.sol; do
    # Skip if it's not a file
    [ -f "$contract" ] || continue

    # Extract the base name without path and extension
    base_name=$(basename "$contract" .sol)

    # Check if metadata file exists
    metadata_file="out/$base_name.sol/$base_name.metadata.json"
    if [ -f "$metadata_file" ]; then
        # Copy to portal directory with new name
        cp "$metadata_file" "portal/$base_name.json"
        echo "Processed $base_name"
    else
        echo "Warning: Metadata file not found for $base_name"
    fi
done

echo "Done! Metadata files have been copied to the portal directory."

