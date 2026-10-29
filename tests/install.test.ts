import {describe, expect, it} from 'vitest'
import {releaseAssetName} from '../src/install'

describe('releaseAssetName', () => {
  it('uses the portable zip on macOS', () => {
    expect(releaseAssetName({platform: 'darwin', arch: 'arm64'})).toBe(
      'portable_swiftlint.zip'
    )
  })

  it('picks linux amd64 and arm64 assets', () => {
    expect(releaseAssetName({platform: 'linux', arch: 'x64'})).toBe(
      'swiftlint_linux_amd64.zip'
    )
    expect(releaseAssetName({platform: 'linux', arch: 'arm64'})).toBe(
      'swiftlint_linux_arm64.zip'
    )
  })

  it('rejects unsupported platforms', () => {
    expect(() => releaseAssetName({platform: 'win32', arch: 'x64'})).toThrow(
      /macOS and Linux/
    )
  })
})
