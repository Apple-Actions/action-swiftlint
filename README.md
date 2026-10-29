# SwiftLint

A GitHub Action that installs a pinned [SwiftLint](https://github.com/realm/SwiftLint) and runs `swiftlint lint` with GitHub Actions annotations. Designed to compose with the rest of the Apple-Actions suite:

- [`Apple-Actions/import-codesign-certs`](https://github.com/Apple-Actions/import-codesign-certs)
- [`Apple-Actions/download-provisioning-profiles`](https://github.com/Apple-Actions/download-provisioning-profiles)
- [`Apple-Actions/xcodebuild`](https://github.com/Apple-Actions/xcodebuild)
- [`Apple-Actions/upload-testflight-build`](https://github.com/Apple-Actions/upload-testflight-build)
- [`Apple-Actions/create-dmg`](https://github.com/Apple-Actions/create-dmg)
- [`Apple-Actions/notarize`](https://github.com/Apple-Actions/notarize)

## Usage

### Pin a version

```yaml
- uses: Apple-Actions/swiftlint@v1
  with:
    version: 0.65.1
```

### Pin from a file

Put the version on the first non-comment line of a file (for example `.swiftlint-version`):

```text
0.65.1
```

```yaml
- uses: Apple-Actions/swiftlint@v1
  with:
    version-file: .swiftlint-version
```

If both `version` and `version-file` are set, `version` wins. If neither is set, the action installs the latest SwiftLint release.

### Options

```yaml
- uses: Apple-Actions/swiftlint@v1
  with:
    version: 0.65.1
    strict: true
    config: .swiftlint.yml
    path: Sources
    reporter: github-actions-logging
```

| Input | Default | Description |
|-------|---------|-------------|
| `version` | | SwiftLint version (for example `0.65.1`) or `latest` |
| `version-file` | | Path to a file containing the version |
| `strict` | `true` | Pass `--strict` so warnings fail the step |
| `config` | | Path to a SwiftLint config file |
| `path` | | Path to lint |
| `args` | | Extra arguments appended to `swiftlint lint` |
| `reporter` | `github-actions-logging` | SwiftLint reporter |
| `token` | `${{ github.token }}` | Token for GitHub Releases API / downloads |

| Output | Description |
|--------|-------------|
| `version` | Resolved SwiftLint version that was installed |
| `swiftlint-path` | Absolute path to the `swiftlint` binary |

Works on `ubuntu-*` and `macos-*` runners (downloads the matching portable / Linux release asset).
