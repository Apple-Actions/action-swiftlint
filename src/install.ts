import {info} from '@actions/core'
import {cacheDir, downloadTool, extractZip, find} from '@actions/tool-cache'
import {chmodSync, existsSync} from 'node:fs'
import {arch as osArch, platform as osPlatform} from 'node:os'
import {join} from 'node:path'

const OWNER = 'realm'
const REPO = 'SwiftLint'
const TOOL_NAME = 'swiftlint'

export type PlatformArch = {
  platform: NodeJS.Platform
  arch: string
}

/** Map runner OS/arch to a SwiftLint release asset name. */
export function releaseAssetName({platform, arch}: PlatformArch): string {
  if (platform === 'darwin') {
    return 'portable_swiftlint.zip'
  }
  if (platform === 'linux') {
    if (arch === 'arm64') {
      return 'swiftlint_linux_arm64.zip'
    }
    if (arch === 'x64') {
      return 'swiftlint_linux_amd64.zip'
    }
    throw new Error(`Unsupported Linux architecture for SwiftLint: ${arch}`)
  }
  throw new Error(
    `SwiftLint action supports macOS and Linux runners only (this one is ${platform})`
  )
}

export async function fetchLatestVersion(token: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Apple-Actions/swiftlint',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`,
    {headers}
  )
  if (!response.ok) {
    throw new Error(
      `Failed to resolve latest SwiftLint release: ${response.status} ${response.statusText}`
    )
  }
  const body = (await response.json()) as {tag_name?: string}
  if (!body.tag_name) {
    throw new Error('Latest SwiftLint release response missing tag_name')
  }
  return body.tag_name.replace(/^v/i, '')
}

function releaseDownloadUrl(version: string, asset: string): string {
  return `https://github.com/${OWNER}/${REPO}/releases/download/${version}/${asset}`
}

function findBinary(extracted: string): string {
  const candidate = join(extracted, 'swiftlint')
  if (!existsSync(candidate)) {
    throw new Error(
      `swiftlint binary not found in extracted archive: ${candidate}`
    )
  }
  return candidate
}

/**
 * Ensure SwiftLint `version` is on disk (tool-cache) and return the binary path.
 */
export async function installSwiftLint(
  version: string,
  token: string,
  platformArch: PlatformArch = {platform: osPlatform(), arch: osArch()}
): Promise<string> {
  const cached = find(TOOL_NAME, version)
  if (cached) {
    const binary = findBinary(cached)
    info(`Using cached SwiftLint ${version} at ${binary}`)
    return binary
  }

  const asset = releaseAssetName(platformArch)
  const url = releaseDownloadUrl(version, asset)
  info(`Downloading SwiftLint ${version} (${asset})`)

  const auth = token ? `token ${token}` : undefined
  const archivePath = await downloadTool(url, undefined, auth)
  const extracted = await extractZip(archivePath)
  const binary = findBinary(extracted)
  chmodSync(binary, 0o755)

  const cachedDir = await cacheDir(extracted, TOOL_NAME, version)
  const cachedBinary = findBinary(cachedDir)
  info(`Installed SwiftLint ${version} at ${cachedBinary}`)
  return cachedBinary
}
