// Navegación pura del deck. state: { index: 0..22, step }.
// steps[i] = cantidad de pasos de la slide i (>=1).
export function next(state, steps) {
  const { index, step } = state
  if (index === 0) return state // la slide 0 solo sale por orientación
  const lastStep = steps[index] - 1
  if (step < lastStep) return { index, step: step + 1 }
  if (index === steps.length - 1) return state // última slide
  return { index: index + 1, step: 0 }
}

export function prev(state, steps) {
  const { index, step } = state
  if (step > 0) return { index, step: step - 1 }
  if (index <= 1) return state // no se vuelve a la slide 0
  const prevIndex = index - 1
  return { index: prevIndex, step: steps[prevIndex] - 1 }
}
