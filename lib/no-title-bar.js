/** @babel */

export const config = {
  trafficLightsPadding: {
    description: 'A padding width, in pixels, to accommodate the window traffic lights.',
    type: 'integer',
    minimum: 0,
    default: 80
  },
  automaticTrafficLightsPadding: {
    description: 'Use the width of your left dock as the width for the traffic lights padding.',
    type: 'boolean',
    default: false
  },
  automaticTrafficLightsPaddingOffset: {
    description: 'An offset adjustment width, in pixels, when using automatic padding.',
    type: 'integer',
    default: 0
  },
  enableLiberalWindowDragging: {
    'description': 'Liberally allow window dragging from any "empty" space.',
    type: 'boolean',
    default: true
  }
}

export function activate (state) {
  if (!enabledForPlatform(process.platform)) return

  // ensure class is added as soon as possible
  document.body.classList.add('no-title-bar')

  // wait to finish package initialization until atom is fully loaded
  this.mutationObserver = new MutationObserver((mutations) => {
    __guard__(this.mutationObserver, x => x.disconnect())
    this.mutationObserver = null
    finishInitialize()
  })
  this.mutationObserver.observe(atom.views.getView(atom.workspace), {attributes: true})
}

export function deactivate () {
  if (!enabledForPlatform(process.platform)) return

  setPadding(null)
  __guard__(this.subs, x => x.dispose())
  this.subs = null
  __guard__(this.mutationObserver, x => x.disconnect())
  this.mutationObserver = null
  __guard__(this.leftDockObserver, x => x.disconnect())
  this.leftDockObserver = null
  document.body.classList.remove('no-title-bar')
}

/** Returns true iff your platform can support no-title-bar. */
export function enabledForPlatform (platform) {
  return document.body.classList.contains(`platform-${platform}`)
}

/** Returns true iff the left dock is currently visible. */
function isLeftDockVisible () {
  const leftDockSelector = 'atom-panel-container.left > atom-dock.left > .atom-dock-inner'
  const element = document.querySelector(leftDockSelector)
  const visible = __guard__(element, x => {
    return x.classList.contains('atom-dock-open')
  })
  if (visible !== undefined) return visible
  return false
}

/** Finishes package initialization such as setting up observers, events, styles, etc... */
function finishInitialize () {
  const {CompositeDisposable} = require('atom')
  this.subs = new CompositeDisposable()
  this.subs.add(
    atom.config.observe('no-title-bar.trafficLightsPadding', () => updatePadding()),
    atom.config.observe('no-title-bar.automaticTrafficLightsPadding', () => updatePadding())
  )
  observeLeftDock()
  if (atom.config.get('no-title-bar.enableLiberalWindowDragging')) {
    this.subs.add(setupLiberalWindowDragging())
  }
}

/** Ensures observation of left dock is set up. */
function observeLeftDock () {
  if (this.observeLeftDockInit) return
  const leftDockSelector = 'atom-panel-container.left > atom-dock.left > .atom-dock-inner'
  if (this.leftDockObserver === undefined) {
    this.leftDockObserver = new MutationObserver(() => updatePadding())
  }
  this.leftDockElement = document.querySelector(leftDockSelector)
  if (!this.observeLeftDockInit && this.leftDockElement !== undefined) {
    this.leftDockObserver.observe(this.leftDockElement, { attributes: true })
    this.observeLeftDockInit = true
  }
}

/** Creates and installs a stylesheet to enable global window dragging.
  *
  * @return A Disposable to easily remove the installed stylesheet.
  */
function setupLiberalWindowDragging () {
  const {Disposable} = require('atom')
  let s = document.createElement('style')
  s.type = 'text/css'
  s.innerText = '.no-title-bar:not(.fullscreen) > atom-workspace { -webkit-app-region: drag; }'
  document.querySelector('head atom-styles').appendChild(s)
  return new Disposable(() => {
    s.parentNode.removeChild(s)
    s = null
  })
}

/** Sets the left padding width to accomodate window traffic lights. */
function setPadding (width) {
  const tabBarPaddingSelector = `.no-title-bar:not(.fullscreen):not(.hidden-title-bar)
    atom-panel-container.left + atom-workspace-axis.vertical
    .pane:nth-child(1)
    .tab-bar
  `
  const found = __guard__(document.querySelector(tabBarPaddingSelector), element => {
    if (width !== null) element.style.paddingLeft = width + 'px'
    else element.style.paddingLeft = ''
    return true
  })
  if (found !== undefined) return found
  return false
}

/** Calls setPadding() with the correct value width value for Atom's current state. */
function updatePadding () {
  if (isLeftDockVisible()) {
    return setPadding(0)
  }

  if (atom.config.get('no-title-bar.automaticTrafficLightsPadding')) {
    const width = __guard__(atom.workspace.getLeftDock(), x => x.state.size)
    if (width) {
      const offset = atom.config.get('no-title-bar.automaticTrafficLightsPaddingOffset')
      return setPadding(width + offset)
    }
  }

  return setPadding(atom.config.get('no-title-bar.trafficLightsPadding'))
}

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null)
    ? transform(value)
    : undefined
}
