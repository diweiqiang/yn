export function $args () {
  return new URLSearchParams(location.search)
}

export const URL_GITHUB = 'https://github.com/purocean/yn'
export const URL_MAS = 'https://apps.apple.com/cn/app/yank-note/id1551528618'

export const FLAG_DISABLE_XTERM = false
export const FLAG_DEMO = process.env.NODE_ENV === 'demo'
