/** @babel */

import {CompositeDisposable, Disposable} from 'atom'

let dockWorkaroundElements = [null, null]
let dockWorkaroundObservers = [null, null]
let dockWorkaroundTimeout = [null, null]
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
    setupLiberalWindowDragging()
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
    'atom-workspace-axis.horizontal'
    // Putting the element in the side panel container prevents scrolling in the
    // dock contents from interfering with dragging. However, scrolling in the
    // editor's tab-bar can also interfere. So we must put our workaround
    // elements up one level from those containers.
    // `atom-panel-container.${side}`
  ].join(' ')), hook => {
    const pos = side === 'left' ? 0 : 1

    // create a new invisible element specifically for window dragging
    dockWorkaroundElements[pos] = document.createElement('div')
    dockWorkaroundElements[pos].classList.add(`no-title-bar-${side}-dock-workaround`)
    dockWorkaroundElements[pos].style.webkitAppRegion = 'drag'
    dockWorkaroundElements[pos].style.position = 'absolute'
    dockWorkaroundElements[pos].style.top = '0'
    if (side === 'left') dockWorkaroundElements[pos].style.left = '0'
    else dockWorkaroundElements[pos].style.right = '0'
    hook.appendChild(dockWorkaroundElements[pos])
    subs.add(new Disposable(() => dockWorkaroundElements[pos].remove()))

    // watch for dock resize events so we can adjust our drag element
    let m = (side === 'left')
      ? new MutationObserver(_ => adjustDockWorkaroundElement('left'))
      : new MutationObserver(_ => adjustDockWorkaroundElement('right'))
    const dock = (side === 'left')
      ? atom.views.getView(atom.workspace.getLeftDock()).querySelector('div.atom-dock-mask')
      : atom.views.getView(atom.workspace.getRightDock()).querySelector('div.atom-dock-mask')
    m.observe(dock, {attributes: true, attributeFilter: ['style']})
    dockWorkaroundObservers[pos] = m
    subs.add(new Disposable(() => dockWorkaroundObservers[pos].disconnect()))
  })
}

/** Returns true iff your platform can support no-title-bar. */
export function enabledForPlatform (platform) {
  return document.body.classList.contains(`platform-${platform}`)
}

/** Creates and installs a stylesheet to enable global window dragging. */
function setupLiberalWindowDragging () {
  let s = document.createElement('style')
  s.type = 'text/css'
  s.innerText = `
    .no-title-bar:not(.fullscreen) > atom-workspace { -webkit-app-region: drag; }'
  `
  document.querySelector('head atom-styles').appendChild(s)
  subs.add(new Disposable(() => s.parentNode.removeChild(s)))
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

  __guard__(dockWorkaroundTimeout[pos], x => {
    clearTimeout(dockWorkaroundTimeout[pos])
    dockWorkaroundTimeout[pos] = null
  })

  const dockWoraroundTimeoutResponseTime = 500 // ms
  dockWorkaroundTimeout[pos] = setTimeout(() => {
    let element = dockWorkaroundElements[pos]
    if (element) {
      __guard__(document.querySelector([
        '.no-title-bar:not(.fullscreen).custom-title-bar',
        '>',
        'atom-workspace',
        `atom-panel-container.${side}`
      ].join(' ')), panel => {
        element.style.height = window.getComputedStyle(panel).marginTop
        element.style.width = window.getComputedStyle(panel).width
      })
    }
  }, dockWoraroundTimeoutResponseTime)
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
