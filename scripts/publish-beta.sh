#!/bin/bash

npm --no-git-tag-version version patch
npm publish --tag beta