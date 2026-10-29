import {
  getBooleanInput,
  getInput,
  info,
  setFailed,
  setOutput,
  warning
} from '@actions/core'
import {exec} from '@actions/exec'
import {fetchLatestVersion, installSwiftLint} from './install'
import {resolveVersionSpec} from './version'

async function run(): Promise<void> {
  try {
    await main()
  } catch (err) {
    setFailed(err instanceof Error ? err.message : String(err))
  }
}

function splitArgs(raw: string): string[] {
  const trimmed = raw.trim()
  if (!trimmed) {
    return []
  }
  // Simple whitespace split; quote-aware parsing is out of scope.
  return trimmed.split(/\s+/)
}

async function main(): Promise<void> {
  const versionInput = getInput('version')
  const versionFile = getInput('version-file')
  const strict = getBooleanInput('strict')
  const config = getInput('config')
  const path = getInput('path')
  const argsInput = getInput('args')
  const reporter = getInput('reporter') || 'github-actions-logging'
  const token = getInput('token')

  const workspace = process.env.GITHUB_WORKSPACE || process.cwd()
  let version = resolveVersionSpec({
    version: versionInput,
    versionFile,
    workspace,
    warn: warning
  })

  if (version === 'latest') {
    version = await fetchLatestVersion(token)
    info(`Resolved latest SwiftLint to ${version}`)
  }

  const swiftlintPath = await installSwiftLint(version, token)

  const args = ['lint', '--reporter', reporter]
  if (strict) {
    args.push('--strict')
  }
  if (config) {
    args.push('--config', config)
  }
  args.push(...splitArgs(argsInput))
  if (path) {
    args.push(path)
  }

  info(`Running: ${swiftlintPath} ${args.join(' ')}`)
  await exec(swiftlintPath, args, {cwd: workspace})

  setOutput('version', version)
  setOutput('swiftlint-path', swiftlintPath)
}

run()
