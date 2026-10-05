// Parte el texto de `root` en spans `.w` (uno por palabra) sin romper el
// markup interno: recorre solo los nodos de texto, así una palabra dentro de
// un `.accent` queda envuelta dentro de ese mismo `.accent`. Los espacios se
// conservan como texto suelto para que el wrap del párrafo no cambie.
export function splitWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/)
    if (parts.length === 1 && !parts[0].trim()) return
    const frag = document.createDocumentFragment()
    parts.forEach((part) => {
      if (!part) return
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part))
        return
      }
      const span = document.createElement('span')
      span.className = 'w'
      span.textContent = part
      frag.appendChild(span)
    })
    node.replaceWith(frag)
  })

  return root.querySelectorAll('.w')
}
