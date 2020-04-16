#!/bin/sh
set -e

if [ -n "${GITHUB_WORKSPACE}" ]; then
  cd "${GITHUB_WORKSPACE}" || exit
fi

export REVIEWDOG_GITHUB_API_TOKEN="${INPUT_GITHUB_TOKEN}"

swiftlint \
  | reviewdog -efm="%f:%l:%c: %m" -name="swiftlint" -reporter="${INPUT_REPORTER:-github-pr-check}" -level="${INPUT_LEVEL}"
