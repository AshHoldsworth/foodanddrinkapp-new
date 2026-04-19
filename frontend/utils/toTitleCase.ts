export function toTitleCase(type: string) {
  const words = type.split(' ')
  words.forEach((word, index) => {
    words[index] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  return words.join(' ')
}
