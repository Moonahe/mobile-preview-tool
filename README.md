# mobile-preview

Automated mobile preview pipeline CLI tool for Expo and React Native repositories.

`mobile-preview` provides an automated pipeline that inspects incoming code changes in CI, distinguishes between JavaScript/asset modifications and native code changes, and publishes preview updates accordingly:

- **JS/assets changes**: Publishes an Expo EAS Update to a preview channel.
- **Native changes**: Builds a new Android APK (via Gradle or EAS Build) and publishes it as a latest preview release (e.g. GitHub Releases).

---

## 🚀 Quick Start

Install `mobile-preview` in your Expo or React Native repository:

```bash
npm install --save-dev mobile-preview
```

Initialize configuration and GitHub Actions workflow:

```bash
npx mobile-preview init
```

This generates `mobile-preview.config.json` and `.github/workflows/mobile-preview.yml`.

---

## 🛠 Commands

### `mobile-preview init`
Initializes configuration file and GitHub Actions CI workflow in the repository.

### `mobile-preview detect [--json] [--base <ref>]`
Inspects git diffs against base commit to classify changes into `javascript`, `native`, or `configuration`.

### `mobile-preview update`
Publishes Expo EAS Update for JavaScript and asset changes.

### `mobile-preview build [--platform <android|ios>]`
Builds native application binary (Android APK) via configured provider (`gradle` or `eas`).

### `mobile-preview publish`
Orchestrates detection -> update (if JS) or build + release publish (if native change).

### `mobile-preview status`
Displays status of current branch, commit SHA, preview channel, and last update metadata.

### `mobile-preview doctor`
Checks CLI environment prerequisites (Node, Git, EAS CLI, Expo/GitHub authentication, Android SDK/Gradle).

### `mobile-preview rollback [--to <version>]`
Rolls back preview channel updates or release tags.

---

## ⚙️ Configuration (`mobile-preview.config.json`)

Example configuration:

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

---

## 🔐 GitHub Action Secrets

Ensure the following secrets are configured in your repository settings:
- `EXPO_TOKEN`: Expo access token for EAS Update / EAS Build permissions.
- `GITHUB_TOKEN`: Provided automatically by GitHub Actions (ensure `contents: write` permission).
