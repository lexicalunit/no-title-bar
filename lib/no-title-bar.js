/** @babel */

const treeViewDockSelector = 'atom-panel-container.left > atom-dock.left > .atom-dock-inner'
const tabBarPaddingSelector = `.platform-darwin:not(.fullscreen):not(.hidden-title-bar)
  atom-panel-container.left + atom-workspace-axis.vertical
  .pane:nth-child(1)
  .tab-bar
`

var init = false
var paneSub = null
var configSub = null
var mutationObserver = null
var treeViewDockElement = null
var treeViewVisible = false

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null)
    ? transform(value)
    : undefined
}

function setPadding (width) {
  __guard__(document.querySelector(tabBarPaddingSelector), element => {
    element.style.paddingLeft = width + 'px'
  })
}

function updatePadding () {
  if (treeViewVisible) {
    setPadding(0)
  } else {
    setPadding(atom.config.get('no-title-bar.trafficLightsPadding'))
  }
}

function mutationHandler (mutations) {
  __guard__(treeViewDockElement, x => {
    treeViewVisible = x.classList.contains('atom-dock-open')
    updatePadding()
  })
}

function destroyConfigSub () {
  __guard__(configSub, x => x.dispose())
  configSub = null
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
    init = true
    updatePadding()
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
    paneSub = atom.workspace.observePaneItems(handlePaneItem)
    configSub = atom.config.observe('no-title-bar.trafficLightsPadding', () => { updatePadding() })
    document.body.classList.add('no-title-bar')
  }
}

export function deactivate () {
  if (enabledForPlatform(process.platform)) {
    updatePadding(0)
    destroyPaneSub()
    destroyConfigSub()
    destroyMutationObserver()
    document.body.classList.remove('no-title-bar')
  }
}

export const config = {
  'trafficLightsPadding': {
    'description': 'A padding width, in pixels, to accommodate the window traffic lights.',
    'type': 'integer',
    'minimum': 0,
    'maximum': 300,
    'default': 80
  }
}
