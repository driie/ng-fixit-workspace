#!/usr/bin/env bash
set -euo pipefail

package_dir="dist/ng-fixit"
package_json="${package_dir}/package.json"

if [[ ! -f "${package_json}" ]]; then
  echo "Missing ${package_json}. Run the library build first." >&2
  exit 1
fi

name="$(node -p "require('./${package_json}').name")"
version="$(node -p "require('./${package_json}').version")"

if npm view "${name}@${version}" version >/dev/null 2>&1; then
  echo "${name}@${version} is already on npm. Skipping publish."
  exit 0
fi

echo "Publishing ${name}@${version}"
npm publish "./${package_dir}" --access public
