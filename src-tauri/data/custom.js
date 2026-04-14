window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
;(function () {
  const nativeOpen =
    typeof window.open === 'function' ? window.open.bind(window) : null
  function resolveUrl(url) {
    try {
      return new URL(url, window.location.href).href
    } catch {
      return String(url || '')
    }
  }
  /** Tauri：新 Webview 窗口；否则：原生新标签页 */
  function openInNewWindow(url, title) {
    const href = resolveUrl(url)
    if (!href) return null
    try {
      if (window.__TAURI__ && window.__TAURI__.webviewWindow) {
        const { WebviewWindow } = window.__TAURI__.webviewWindow
        const label =
          'pp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
        const webview = new WebviewWindow(label, {
          url: href,
          width: 1000,
          height: 700,
          focus: true,
          title: title || document.title || '新窗口',
          center: true,
          resizable: true,
          transparent: false,
          visible: true,
        })
        webview.once('tauri://created', function () {
          console.log('new webview created', label)
        })
        webview.once('tauri://error', function (e) {
          console.log('new webview error', e)
          if (nativeOpen) nativeOpen(href, '_blank', 'noopener,noreferrer')
        })
        return webview
      }
    } catch (err) {
      console.error('WebviewWindow error', err)
    }
    if (nativeOpen) return nativeOpen(href, '_blank', 'noopener,noreferrer')
    window.location.href = href
    return null
  }
  const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
      'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
      (origin && origin.href && origin.target === '_blank') ||
      (origin && origin.href && isBaseTargetBlank)
    ) {
      e.preventDefault()
      console.log('handle origin', origin)
      openInNewWindow(
        origin.href,
        origin.getAttribute('title') || origin.textContent || ''
      )
    } else {
      console.log('not handle origin', origin)
    }
  }
  window.open = function (url, target, features) {
    console.log('open', url, target, features)
    return openInNewWindow(url, document.title)
  }
  document.addEventListener('click', hookClick, { capture: true })
})()