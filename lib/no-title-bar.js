/** @babel */

import {CompositeDisposable, Disposable} from 'atom'

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

let dockWorkaroundElements = [null, null]
let leftDockVisible = false
let subs = null

export function activate (state) {
  if (!enabledForPlatform(process.platform)) return
  subs = new CompositeDisposable()

  document.body.classList.add('no-title-bar')
  subs.add(new Disposable(() => {
    setPadding(null)
    document.body.classList.remove('no-title-bar')
  }))

  // wait to finish package initialization until atom is fully loaded
  let mutationObserver = new MutationObserver((mutations) => {
    if (mutationObserver) mutationObserver.disconnect()
    mutationObserver = null
    finishInitialize()
  })
  mutationObserver.observe(atom.views.getView(atom.workspace), {attributes: true})
}

export function deactivate () {
  if (subs) subs.dispose()
}

/** Finishes package initialization such as setting up observers, events, styles, etc... */
function finishInitialize () {
  subs.add(
    atom.workspace.getLeftDock().observeVisible(visible => {
      leftDockVisible = visible
      updatePadding()
    }),
    atom.workspace.getRightDock().observeVisible(_ => updatePadding()),
    atom.config.observe('no-title-bar.trafficLightsPadding', () => updatePadding()),
    atom.config.observe('no-title-bar.automaticTrafficLightsPadding', () => updatePadding())
  )
  if (atom.config.get('no-title-bar.enableLiberalWindowDragging')) {
    subs.add(setupLiberalWindowDragging())
  }

  setupDockWorkaround('left')
  setupDockWorkaround('right')
}

/** Workaround window drag issues when there are scrolled panels in side docks.
  *
  * When a the content in a panel in a dock, like the tree-view, is scrolled
  * beyond the height of the window, webkit-app-region drag stops working.
  * To get around this we overlay a hidden element on top of the dock padding,
  * and set its webkit-app-region. For now, this seems to work ok.
  */
function setupDockWorkaround (side) {
  __guard__(document.querySelector([
    'atom-workspace',
    'atom-workspace-axis.horizontal',
    `atom-panel-container.${side}`
  ].join(' ')), hook => {
    const pos = side === 'left' ? 0 : 1
    dockWorkaroundElements[pos] = document.createElement('div')
    dockWorkaroundElements[pos].classList.add('no-title-bar-left-dock-workaround')
    dockWorkaroundElements[pos].style.webkitAppRegion = 'drag'
    dockWorkaroundElements[pos].style.position = 'absolute'
    dockWorkaroundElements[pos].style.top = '0'
    dockWorkaroundElements[pos].style.left = '0'
    hook.appendChild(dockWorkaroundElements[pos])
    adjustDockWorkaroundElement(side)
    subs.add(new Disposable(() => dockWorkaroundElements[pos].remove()))
  })
}

/** Returns true iff your platform can support no-title-bar. */
export function enabledForPlatform (platform) {
  return document.body.classList.contains(`platform-${platform}`)
}

/** Creates and installs a stylesheet to enable global window dragging.
  *
  * @return A Disposable to easily remove the installed stylesheet.
  */
function setupLiberalWindowDragging () {
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
  adjustDockWorkaroundElement('left')
  adjustDockWorkaroundElement('right')
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

/** Correctly fit the dock workaround element into its dock container. */
function adjustDockWorkaroundElement (side) {
  const pos = side === 'left' ? 0 : 1
  if (dockWorkaroundElements[pos]) {
    __guard__(document.querySelector([
      '.no-title-bar:not(.fullscreen).custom-title-bar',
      '>',
      'atom-workspace',
      `atom-panel-container.${side}`
    ].join(' ')), panel => {
      dockWorkaroundElements[pos].style.height = window.getComputedStyle(panel).marginTop
      dockWorkaroundElements[pos].style.width = window.getComputedStyle(panel).width
    })
  }
}

/** Calls setPadding() with the correct value width value for Atom's current state. */
function updatePadding () {
  if (leftDockVisible) {
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
