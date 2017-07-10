/** @babel */

import {CompositeDisposable} from 'atom'

const treeViewDockSelector = 'atom-panel-container.left > atom-dock.left > .atom-dock-inner'
const tabBarPaddingSelector = `.no-title-bar:not(.fullscreen):not(.hidden-title-bar)
  atom-panel-container.left + atom-workspace-axis.vertical
  .pane:nth-child(1)
  .tab-bar
`

var init = false
var paneSub = null
var configSubs = null
var mutationObserver = null
var treeViewDockElement = null

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null)
    ? transform(value)
    : undefined
}

function setPadding (width) {
  const found = __guard__(document.querySelector(tabBarPaddingSelector), element => {
    element.style.paddingLeft = width + 'px'
    return true
  })
  if (found) {
    return found
  } else {
    return false
  }
}

function configTrafficLightsPadding () {
  return atom.config.get('no-title-bar.trafficLightsPadding')
}

function configAutomaticTrafficLightsPadding () {
  return atom.config.get('no-title-bar.automaticTrafficLightsPadding')
}

function configAutomaticTrafficLightsPaddingOffset () {
  return atom.config.get('no-title-bar.automaticTrafficLightsPaddingOffset')
}

function treeViewIsVisible () {
  const element = document.querySelector(treeViewDockSelector)
  const visible = __guard__(element, x => {
    return x.classList.contains('atom-dock-open')
  })
  if (visible) {
    return visible
  } else {
    return false
  }
}

function updatePadding () {
  if (treeViewIsVisible()) {
    return setPadding(0)
  }

  if (configAutomaticTrafficLightsPadding()) {
    const set = __guard__(document.querySelector('.tool-panel.tree-view'), element => {
      if (element.offsetWidth > 0) {
        return setPadding(element.offsetWidth + configAutomaticTrafficLightsPaddingOffset())
      }
      return setPadding(configTrafficLightsPadding())
    })
    if (set) {
      return set
    }
  }

  // always fallback to config setting
  return setPadding(configTrafficLightsPadding())
}

function mutationHandler (mutations) {
  __guard__(treeViewDockElement, x => {
    updatePadding()
  })
}

function destroyConfigSubs () {
  __guard__(configSubs, x => x.dispose())
  configSubs = null
}

function destroyPaneSub () {
  __guard__(paneSub, x => x.dispose())
  paneSub = null
}

function destroyMutationObserver () {
  __guard__(mutationObserver, x => x.disconnect())
  mutationObserver = null
}

function handlePaneItem (item) {
  if (!init && item.constructor.name === 'TextEditor') {
    // avoid race condition by using timeout so DOM can refresh before update
    setTimeout(() => {
      if (!init) {
        init = updatePadding()
      }
    }, 0)
  } else if (item.constructor.name === 'TreeView') {
    mutationObserver = new MutationObserver(mutationHandler)
    treeViewDockElement = document.querySelector(treeViewDockSelector)
    __guard__(treeViewDockElement, x => {
      destroyPaneSub()
      mutationObserver.observe(x, { attributes: true })
    })
  }
}

export function enabledForPlatform (platform) {
  return document.body.classList.contains(`platform-${platform}`)
}

export function activate (state) {
  if (enabledForPlatform(process.platform)) {
    document.body.classList.add('no-title-bar') // ensure class is added as soon as possible
    paneSub = atom.workspace.observePaneItems(handlePaneItem)
    configSubs = new CompositeDisposable()
    configSubs.add(
      atom.config.observe('no-title-bar.trafficLightsPadding', () => { updatePadding() }),
      atom.config.observe('no-title-bar.automaticTrafficLightsPadding', () => { updatePadding() })
    )
  }
}

export function deactivate () {
  if (enabledForPlatform(process.platform)) {
    updatePadding(0)
    destroyPaneSub()
    destroyConfigSubs()
    destroyMutationObserver()
    document.body.classList.remove('no-title-bar')
  }
}

export const config = {
  trafficLightsPadding: {
    description: 'A padding width, in pixels, to accommodate the window traffic lights.',
    type: 'integer',
    minimum: 0,
    default: 80
  },
  automaticTrafficLightsPadding: {
    description: 'Use the width of your Tree View as the width for the traffic lights padding.',
    type: 'boolean',
    default: false
  },
  automaticTrafficLightsPaddingOffset: {
    description: 'An offset adjustment width, in pixels, when using automatic padding.',
    type: 'integer',
    default: 0
  }
}
