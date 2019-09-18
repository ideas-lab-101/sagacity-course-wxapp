export const colors = {
    'light': '#ddd',
    'stable': '#b2b2b2',
    'positive': '#387ef5',
    'calm': '#11c1f3',
    'balanced': '#68b92e',
    'energized': '#ffc900',
    'assertive': '#ef473a',
    'royal': '#733429',
    'dark': '#444',
}

export const isPresetColor = (color) => {
    if (!color) {
        return false
    }
    return colors[color] ? colors[color] : color
}