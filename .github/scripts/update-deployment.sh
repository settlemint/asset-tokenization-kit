#!/bin/bash

echo "Updating the Custom Deployment with the new version $VERSION"

if [[ $TAG == "latest" ]]; then
  bun settlemint platform update custom-deployment $VERSION --prod --wait
elif [[ $TAG == "main" ]]; then
  bun settlemint platform update custom-deployment $VERSION --wait
fi