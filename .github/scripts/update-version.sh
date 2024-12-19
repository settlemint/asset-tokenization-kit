#!/bin/bash

OLD_VERSION=$(jq -r '.version' package.json)
echo "Old version: $OLD_VERSION"

if [[ $GITHUB_REF_SLUG =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  VERSION=$(echo $GITHUB_REF_SLUG | sed 's/^v//')
  echo "TAG=latest" >> $GITHUB_ENV
elif [[ $GITHUB_REF_NAME == "main" ]]; then
  VERSION="${OLD_VERSION}-main$(echo $GITHUB_SHA_SHORT | sed 's/^v//')"
  echo "TAG=main" >> $GITHUB_ENV
else
  VERSION="${OLD_VERSION}-pr$(echo $GITHUB_SHA_SHORT | sed 's/^v//')"
  echo "TAG=pr" >> $GITHUB_ENV
fi

echo "VERSION=$VERSION" >> $GITHUB_ENV

if [ -z "$VERSION" ]; then
  echo "Error: VERSION is not set"
  exit 1
fi

echo "Updating version to $VERSION"
jq --arg version "$VERSION" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json

update_package_json() {
  local dir="$1"
  local version="$2"
  echo "Updating $dir/package.json version to $version and updating workspace dependencies"
  jq --arg version "$version" '
    .version = $version |
    (.dependencies) |= with_entries(if .value == "workspace:*" then .value = $version else . end) |
    (.devDependencies) |= with_entries(if .value == "workspace:*" then .value = $version else . end) |
    (.peerDependencies) |= with_entries(if .value == "workspace:*" then .value = $version else . end)
  ' "$dir/package.json" > "$dir/package.json.tmp" && mv "$dir/package.json.tmp" "$dir/package.json" || {
    echo "Error updating $dir/package.json"
    cat "$dir/package.json.tmp"
    exit 1
  }
}

for dir in ./kit/*; do
  if [ -f "$dir/package.json" ]; then
    update_package_json "$dir" "$VERSION"
  fi
done


echo "Updated version to $VERSION"

# Output TAG and VERSION
echo "TAG=${TAG}" >> $GITHUB_OUTPUT
echo "VERSION=${VERSION}" >> $GITHUB_OUTPUT