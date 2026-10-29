import {mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'
import {
  normalizeVersion,
  parseVersionFileContents,
  resolveVersionSpec
} from '../src/version'

describe('normalizeVersion', () => {
  it('strips a leading v', () => {
    expect(normalizeVersion('v0.65.1')).toBe('0.65.1')
  })

  it('trims whitespace', () => {
    expect(normalizeVersion('  0.65.1\n')).toBe('0.65.1')
  })

  it('rejects empty input', () => {
    expect(() => normalizeVersion('   ')).toThrow(/empty/)
  })
})

describe('parseVersionFileContents', () => {
  it('reads the first non-comment line', () => {
    expect(parseVersionFileContents('# pin\n\nv0.65.1\n0.99.0\n')).toBe(
      '0.65.1'
    )
  })

  it('rejects an empty file', () => {
    expect(() => parseVersionFileContents('# only comments\n\n')).toThrow(
      /no version line/
    )
  })
})

describe('resolveVersionSpec', () => {
  it('prefers version over version-file and warns', () => {
    const warn = vi.fn()
    const workspace = mkdtempSync(join(tmpdir(), 'swiftlint-version-'))
    writeFileSync(join(workspace, '.swiftlint-version'), '0.50.0\n')

    expect(
      resolveVersionSpec({
        version: '0.65.1',
        versionFile: '.swiftlint-version',
        workspace,
        warn
      })
    ).toBe('0.65.1')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('reads version-file when version is omitted', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'swiftlint-version-'))
    writeFileSync(join(workspace, '.swiftlint-version'), '0.65.1\n')

    expect(
      resolveVersionSpec({
        version: '',
        versionFile: '.swiftlint-version',
        workspace,
        warn: vi.fn()
      })
    ).toBe('0.65.1')
  })

  it('fails when version-file is missing', () => {
    expect(() =>
      resolveVersionSpec({
        version: '',
        versionFile: '.missing',
        workspace: mkdtempSync(join(tmpdir(), 'swiftlint-version-')),
        warn: vi.fn()
      })
    ).toThrow(/not found/)
  })

  it('defaults to latest', () => {
    expect(
      resolveVersionSpec({
        version: '',
        versionFile: '',
        workspace: mkdtempSync(join(tmpdir(), 'swiftlint-version-')),
        warn: vi.fn()
      })
    ).toBe('latest')
  })
})
