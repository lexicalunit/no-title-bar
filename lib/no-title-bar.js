/** @babel */

let themeObserver = null

export function activate () {
  themeObserver = atom.themes.onDidChangeActiveThemes(() => {
    let tabBarStyle = window.getComputedStyle(document.getElementsByClassName("tab-bar")[0])

    var titleBarHeight = "0"
    for (let panel of atom.workspace.getHeaderPanels()) {
      let element = panel.item.element
      if (element.className == "title-bar") {
        let style = window.getComputedStyle(element)
        titleBarHeight = style.height
        break
      }
    }

    let panelTopOffset = Math.max(
      parseFloat(tabBarStyle.height.replace("px", "")),
      parseFloat(titleBarHeight.replace("px", "")),
    ) + "px"

    for (let panel of atom.workspace.getLeftPanels()) {
      panel.item.element.parentNode.style.marginTop = panelTopOffset
      break // since we set the top margin on the parent node, stop now.
    }

    for (let panel of atom.workspace.getRightPanels()) {
      panel.item.element.parentNode.style.marginTop = panelTopOffset
      break // since we set the top margin on the parent node, stop now.
    }
  })
}

export function deactivate () {
  if (themeObserver) {
    themeObserver.dispose()
  }
}
