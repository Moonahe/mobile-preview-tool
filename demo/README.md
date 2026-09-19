# Mobile Preview Demo App

This directory contains a sample Expo application used to showcase and test `mobile-preview`.

## Project Structure

- `App.js`: Sample Expo React Native application component.
- `app.json`: Expo configuration file.
- `mobile-preview.config.json`: Pre-configured `mobile-preview` settings for this demo app.
- `.github/workflows/mobile-preview.yml`: Example GitHub Actions workflow for automated preview pipelines.

## Showcase & Testing Instructions

### 1. Run Environment Diagnostics

Verify your local environment and configuration:

```bash
cd demo
npx mobile-preview doctor
```

### 2. Run Change Detection

Check how `mobile-preview` classifies changed files:

```bash
# From within the demo directory
npx mobile-preview detect

# Or get JSON formatted output
npx mobile-preview detect --json
```

### 3. Simulating Changes

- **JavaScript Change (OTA Update)**:
  Edit `demo/App.js` or UI text, then run `npx mobile-preview detect`. Notice it classifies the change as `javascript` and triggers an Over-The-Air (EAS Update).

- **Native Dependency Change (Native Build)**:
  Update native packages in `demo/package.json` or native configuration fields in `demo/app.json`. Running `npx mobile-preview detect` will classify it as `native` and trigger a native application build.

### 4. Running the Demo App with Expo

You can run this demo application using standard Expo CLI commands:

```bash
npm install
npm start
```

### 5. Initial EAS Credentials Setup (One-time Manual Step)

When running native builds with EAS Build (`"nativeBuild.provider": "eas"`), Expo Cloud requires an initial Android Keystore to be generated interactively.

Run the build once interactively from your local terminal to set up credentials:

```bash
cd demo
eas build --platform android
```
