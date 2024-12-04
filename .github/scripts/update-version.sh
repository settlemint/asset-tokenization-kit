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
echo "Updating version to $VERSION"
jq --arg version "$VERSION" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json

echo "Updated version to $VERSION"

# Output TAG and VERSION
echo "TAG=${TAG}" >> $GITHUB_OUTPUT
echo "VERSION=${VERSION}" >> $GITHUB_OUTPUT 