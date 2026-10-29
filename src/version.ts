import {existsSync, readFileSync} from 'node:fs'
import {isAbsolute, join} from 'node:path'

/** Strip surrounding whitespace and an optional leading `v`. */
export function normalizeVersion(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error('SwiftLint version is empty')
  }
  return trimmed.replace(/^v/i, '')
}

/**
 * Read the first non-empty, non-`#` line from a version file (for example
 * `.swiftlint-version`).
 */
export function parseVersionFileContents(contents: string): string {
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    return normalizeVersion(trimmed)
  }
  throw new Error('version file has no version line')
}

export type ResolveVersionOptions = {
  version: string
  versionFile: string
  workspace: string
  warn: (message: string) => void
}

/**
 * Resolve the SwiftLint version spec from `version` / `version-file`.
 * Returns `latest` when neither is set. If both are set, `version` wins.
 */
export function resolveVersionSpec({
  version,
  versionFile,
  workspace,
  warn
}: ResolveVersionOptions): string {
  if (version && versionFile) {
    warn(
      'Both `version` and `version-file` are set; only `version` will be used'
    )
  }

  if (version) {
    return normalizeVersion(version)
  }

  if (versionFile) {
    const path = isAbsolute(versionFile)
      ? versionFile
      : join(workspace, versionFile)
    if (!existsSync(path)) {
      throw new Error(`version-file not found: ${versionFile}`)
    }
    return parseVersionFileContents(readFileSync(path, 'utf8'))
  }

  return 'latest'
}
