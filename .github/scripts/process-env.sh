#!/bin/bash

process_env_file() {
  echo "$1" | while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    if [[ -n "$line" ]] && [[ ! "$line" =~ ^[[:space:]]*# ]]; then
      # Remove any trailing comments and trim whitespace
      line="${line%%#*}"
      line="$(echo -e "${line}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

      if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        # Extract key and value
        key="${line%%=*}"
        value="${line#*=}"
        # Remove surrounding quotes if they exist
        value="${value#[\"\']}"
        value="${value%[\"\']}"

        echo "$key=$value" >> $GITHUB_ENV
      fi
    fi
  done
}

# Process provided env files
for env_content in "$@"; do
  process_env_file "$env_content"
done 