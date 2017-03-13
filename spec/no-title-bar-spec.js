/** @babel */

let enabledForPlatform = require('../lib/no-title-bar').enabledForPlatform

describe('no-title-bar', () => {
  let [workspaceElement] = []

  beforeEach(() => {
    atom.config.set('core.titleBar', 'custom')

    waitsForPromise(() => {
      return atom.packages.activatePackage('no-title-bar')
    })

    waitsForPromise(() => {
      return atom.workspace.open()
    })

    runs(() => {
      workspaceElement = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceElement)
    })
  })

  describe('after activation', () => {
    it('installs theming hook', () => {
      let classList = atom.document.body.classList
      let isEnabled = enabledForPlatform(process.platform)
      expect(classList.contains('no-title-bar')).toBe(isEnabled)
    })

    it('hides the title bar', () => {
      let titleBar = workspaceElement.querySelector('.title-bar')
      if (enabledForPlatform()) {
        expect(titleBar).not.toBe(null)
        expect(window.getComputedStyle(titleBar).marginTop).toBe('0px')
      } else {
        expect(titleBar).toBe(null)
      }
    })
  })
})
