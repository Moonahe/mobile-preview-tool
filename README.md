# mobile-preview

Automated mobile preview pipeline tool for Expo and React Native applications.

`mobile-preview` automates preview deployments for React Native/Expo apps by detecting code changes between commits. It intelligently determines whether a change only affects JavaScript/assets (triggering a fast EAS Update) or native dependencies/files (triggering a native build and release).

---

## Key Features

- **Automated Change Detection**: Automatically classifies changes between commits as `JavaScript`, `Native`, or `Configuration`.
- **EAS Update Integration**: Instantly publishes Over-The-Air (OTA) updates when only JavaScript or bundle assets change.
- **Native Build Pipeline**: Triggers native application builds (Gradle APK or EAS Build) and releases when native code or dependencies change.
- **CI/CD Integration**: Generates GitHub Actions workflow configuration out of the box with `mobile-preview init`.
- **Environment Diagnostics**: Built-in health check tool (`mobile-preview doctor`) to verify CLI tools, environment variables, and SDK setup.
- **Rollback Support**: Quickly rollback a channel or preview release to a previous deployment.

---

## Installation

You can run `mobile-preview` using `npx` or install it locally in your project:

```bash
# Run directly with npx
npx mobile-preview <command>

# Or install as a dev dependency
npm install --save-dev mobile-preview
```

---

## Quick Start

1. Navigate to your Expo / React Native project root directory.
2. Initialize the preview configuration and GitHub Actions workflow:

   ```bash
   npx mobile-preview init
   ```

   This command creates:
   - `mobile-preview.config.json`: Configuration settings for the pipeline.
   - `.github/workflows/mobile-preview.yml`: GitHub Actions workflow ready for PRs and push triggers.

3. Configure GitHub Secrets:
   Add the following secrets to your GitHub repository settings (`Settings > Secrets and variables > Actions`):
   - `EXPO_TOKEN`: Access token from Expo (`expo.dev`) for EAS updates and builds.
   - `GITHUB_TOKEN`: GitHub token with `contents: write` permissions (provided automatically by GitHub Actions).

4. Check your environment setup:

   ```bash
   npx mobile-preview doctor
   ```

5. Run change detection or publish preview updates manually or in CI:

   ```bash
   # Detect change type
   npx mobile-preview detect

   # Publish update or build depending on detected changes
   npx mobile-preview publish
   ```

---

## CLI Commands

### `mobile-preview init`
Initializes mobile preview configuration and creates `.github/workflows/mobile-preview.yml`.

```bash
npx mobile-preview init [--yes]
```
- `--yes`: Skip interactive prompts and write default configuration.

---

### `mobile-preview detect`
Detects file and dependency changes between the current commit and a base commit.

```bash
npx mobile-preview detect [--json] [--base <baseRef>]
```
- `--json`: Output machine-readable JSON format.
- `--base <baseRef>`: Specify custom Git base ref or branch to diff against (e.g., `main`, `origin/main`).

---

### `mobile-preview publish`
Orchestrates change detection and executes either a JavaScript update (EAS Update) or a native build + release artifact publication.

```bash
npx mobile-preview publish
```

---

### `mobile-preview update`
Publishes JS/assets update via Expo EAS Update to a target branch or channel.

```bash
npx mobile-preview update [--branch <branch>] [--channel <channel>] [--message <message>]
```
- `--branch <branch>`: Target EAS update branch (default: `preview`).
- `--channel <channel>`: Target EAS update channel (default: `preview`).
- `--message <message>`: Update description message.

---

### `mobile-preview build`
Builds the native binary application (Android APK or iOS).

```bash
npx mobile-preview build [--platform <platform>]
```
- `--platform <platform>`: Target platform: `android` (default) or `ios`.

---

### `mobile-preview status`
Displays status, channel details, and last deployed metadata for the mobile preview pipeline.

```bash
npx mobile-preview status
```

---

### `mobile-preview doctor`
Runs environment checks for dependencies (Node.js, Git, EAS CLI, Android SDK, and authentication tokens).

```bash
npx mobile-preview doctor
```

---

### `mobile-preview rollback`
Rolls back a target preview channel to a previous version or target commit.

```bash
npx mobile-preview rollback [--to <version>] [--channel <channel>]
```
- `--to <version>`: Version, commit SHA, or target to rollback to (default: `previous`).
- `--channel <channel>`: EAS channel to perform rollback on (default: `preview`).

---

## Configuration (`mobile-preview.config.json`)

When you run `mobile-preview init`, a `mobile-preview.config.json` file is generated in your project root:

```json
{
  "provider": "expo",
  "appDirectory": ".",
  "preview": {
    "channel": "preview",
    "branch": "preview",
    "platforms": ["android", "ios"]
  },
  "nativeBuild": {
    "provider": "gradle",
    "android": {
      "enabled": true,
      "artifact": "apk"
    },
    "ios": {
      "enabled": false
    }
  },
  "publish": {
    "provider": "github-release",
    "repository": "auto",
    "releaseTag": "mobile-preview"
  },
  "detection": {
    "nativePaths": [
      "android/**",
      "ios/**",
      "app.config.js",
      "app.config.ts",
      "app.json",
      "expo.json"
    ],
    "nativeDependencies": true,
    "nativePackages": []
  }
}
```

### Configuration Schema Options

- **`provider`**: App framework provider (default: `"expo"`).
- **`appDirectory`**: Root directory of the mobile project (default: `"."`).
- **`preview.channel`**: EAS update target channel (default: `"preview"`).
- **`preview.branch`**: EAS update target branch (default: `"preview"`).
- **`preview.platforms`**: Supported platforms (`["android", "ios"]`).
- **`nativeBuild.provider`**: Build provider for native apps (`"gradle"` or `"eas"`, default: `"gradle"`).
- **`nativeBuild.android.enabled`**: Enable Android native builds (default: `true`).
- **`nativeBuild.android.artifact`**: Artifact format (`"apk"`).
- **`nativeBuild.ios.enabled`**: Enable iOS native builds (default: `false`).
- **`publish.provider`**: Strategy for publishing native build artifacts (`"github-release"`, `"http"`, `"s3"`, `"custom"`).
- **`publish.releaseTag`**: Release tag name on GitHub Releases (default: `"mobile-preview"`).
- **`detection.nativePaths`**: Glob patterns that trigger native builds when modified.
- **`detection.nativeDependencies`**: Automatically detect native package dependency changes in `package.json` (default: `true`).
- **`detection.nativePackages`**: Explicit list of package names that should trigger native builds on version change.

---

## Environment Variables & Secrets

- **`EXPO_TOKEN`**: Expo access token required for publishing EAS updates and EAS builds.
- **`GITHUB_TOKEN`**: Required for creating GitHub Releases and uploading build artifacts in CI.

---

## TypeScript / Programmatic API

`mobile-preview` can also be imported as a Node.js library in TypeScript or JavaScript scripts:

```typescript
import { detectChanges, loadConfig, saveConfig } from 'mobile-preview';

// Load configuration
const config = loadConfig(process.cwd());

// Detect changes programmatically
const result = await detectChanges(config, process.cwd());

console.log('Change classification:', result.classification);
console.log('Native change required:', result.nativeChange);
```

---

## License

[MIT](LICENSE)
