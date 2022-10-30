const bgColors = {
    '935263': 'd1',
    '937008': 'd2',
    '24490': 'e64',
    '171269': 'nor64',
}

function bgPaint(arr) {
    let color = ''
    const l = arr.sort((a,b)=>b-a)
    const n = l.length
    switch (n) {
      case 1: color = `bg-${bg[l[0]]}`; break;
      case 2: color = `bg-gradient-to-r from-${bg[l[0]]} to-${bg[l[1]]}`; break;
      case 3: color = `bg-gradient-to-r from-${bg[l[0]]} via-${bg[l[1]]} to-${bg[l[2]]}`; break;
      case 4: color = `bg-gradient-to-r from-${bg[l[2]]} via-${bg[l[1]]} to-${bg[l[0]]}`; break;
      default: break;
    }
    return color
}

export default bgColors

