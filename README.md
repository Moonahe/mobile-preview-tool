# mobile-preview

Automated mobile preview pipeline CLI tool for Expo and React Native repositories.

`mobile-preview` provides an automated pipeline that inspects incoming code changes in CI, distinguishes between JavaScript/asset modifications and native code changes, and publishes preview updates accordingly:

- **JS/assets changes**: Publishes an Expo EAS Update to a preview channel.
- **Native changes**: Builds a new Android APK (via Gradle or EAS Build) and publishes it as a stable "latest preview" release (e.g. GitHub Releases).

---

## 🏗 High-Level Pipeline Architecture

```text
                    Git Repository
                          │
                          ▼
                 GitHub Actions
                          │
                          ▼
                mobile-preview CLI
                          │
             ┌────────────┴────────────┐
             │                         │
        JS/assets only            Native changes
             │                         │
             ▼                         ▼
       EAS Update                  Native Build
             │                         │
             ▼                         ▼
       Expo Update CDN            APK artifact
             │                         │
             │                    GitHub Release
             │                         │
             ▼                         ▼
                    Developer Phone
```

### Core Design Principle

`mobile-preview` treats the **native application binary as a relatively stable shell** and the **EAS Update as the rapidly changing application layer**.

Only rebuild the native shell when necessary (native files, native package dependency changes, Expo native config modifications).

---

## 📱 Demo App

A pre-configured sample application is available in the [`demo/`](./demo) directory (`slug: demo-preview`, `owner: moonahes-team`) to showcase and test `mobile-preview` features.

```bash
cd demo
npx mobile-preview doctor
npx mobile-preview detect
```

See [`demo/README.md`](./demo/README.md) for detailed instructions.

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
    "nativePackages": [],
    "useFingerprint": true
  }
}
```

---

## 🏷 Optional UI Badge (`MobilePreviewBadge`)

Applications can optionally render a developer preview badge:

```tsx
import { MobilePreviewBadge } from 'mobile-preview';

export default function App() {
  return (
    <>
      <MainApp />
      {__DEV__ && <MobilePreviewBadge commitSha="82f91c" channel="preview" />}
    </>
  );
}
```

---

## 🔮 Future Architecture & Roadmap

The architecture is designed to support the following future enhancements:

1. **QR Code / Web Installation Landing Page**:
   - Web page displaying latest preview metadata, QR code, and direct download links (`[Install Android Preview]`, `[Open EAS Preview]`).
2. **Custom Preview Publishers**:
   - Pluggable `HttpPublisher`, `S3Publisher`, `FirebasePublisher`, and custom private artifact hosting options.
3. **Multiple Preview Environments**:
   - Multi-tenant preview channels such as `preview/developer-a`, `preview/demo`, `preview/staging`.
4. **Agent Feedback & Telemetry API**:
   - Enable agents to query logs, capture application screenshots (`mobile-preview screenshot`), and inspect phone runtime state for closed-loop repairs.
5. **Automated Device Farm Integration**:
   - End-to-end loop: Agent code changes → build → physical/virtual device farm → visual UI evaluation via LLM → automated agent bug fix.
