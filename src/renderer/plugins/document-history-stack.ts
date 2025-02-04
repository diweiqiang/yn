import type { Plugin, Ctx } from '@fe/context'
import type { BuildInActionName, Doc } from '@fe/types'

export default {
  name: 'document-history-stack',
  register: (ctx: Ctx) => {
    let stack: Doc[] = []
    let idx = -1

    const backId = 'plugin.document-history-stack.back'
    const forwardId = 'plugin.document-history-stack.forward'

    function go (offset: number) {
      const index = idx + offset
      if (index >= stack.length || index < 0) {
        return
      }

      const nextFile = stack[index]
      if (!ctx.doc.isSameFile(nextFile, ctx.store.state.currentFile)) {
        ctx.doc.switchDoc(nextFile)
      }

      idx = index
      updateMenu()
    }

    function updateMenu () {
      ctx.statusBar.tapMenus(menus => {
        const list = menus['status-bar-navigation']?.list || []
        if (list) {
          menus['status-bar-navigation'].list = [
            {
              id: forwardId,
              type: 'normal' as any,
              title: ctx.i18n.t('status-bar.nav.forward'),
              disabled: idx >= stack.length - 1,
              subTitle: ctx.command.getKeysLabel(forwardId),
              onClick: () => ctx.action.getActionHandler(forwardId)()
            },
            {
              id: backId,
              type: 'normal' as any,
              title: ctx.i18n.t('status-bar.nav.back'),
              disabled: idx <= 0,
              subTitle: ctx.command.getKeysLabel(backId),
              onClick: () => ctx.action.getActionHandler(backId)()
            },
          ].concat(list.filter(x => ![forwardId, backId].includes(x.id as BuildInActionName)) as any)
        }
      })
    }

    function removeFromStack (doc?: Doc) {
      stack = stack.filter(x => !ctx.doc.isSubOrSameFile(doc, x))
      idx = stack.length - 1
      updateMenu()
    }

    ctx.registerHook('DOC_SWITCHED', ({ doc }) => {
      if (doc) {
        if (!ctx.doc.isSameFile(stack[idx], doc)) {
          stack.splice(idx + 1, stack.length)
          stack.push({ type: doc.type, repo: doc.repo, name: doc.name, path: doc.path })
          idx = stack.length - 1
        }
      }
      updateMenu()
    })

    ctx.registerHook('DOC_DELETED', ({ doc }) => removeFromStack(doc))
    ctx.registerHook('DOC_MOVED', ({ oldDoc }) => removeFromStack(oldDoc))

    ctx.action.registerAction({
      name: backId,
      handler: () => go(-1),
      keys: [ctx.command.Alt, ctx.command.BracketLeft],
    })

    ctx.action.registerAction({
      name: forwardId,
      handler: () => go(1),
      keys: [ctx.command.Alt, ctx.command.BracketRight],
    })
  }
} as Plugin
