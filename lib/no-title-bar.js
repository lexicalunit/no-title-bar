/** @babel */

export function enabledForPlatform (platform) {
  atom.getPosition()
  return document.body.classList.contains(`platform-${platform}`)
}

export function activate (state) {
  if (enabledForPlatform(process.platform)) {
    document.body.classList.add('no-title-bar')
  }
}

export function deactivate () {
  if (enabledForPlatform(process.platform)) {
    document.body.classList.remove('no-title-bar')
  }
}
