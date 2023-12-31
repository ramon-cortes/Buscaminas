// Variables
let tabla = [], tablaJuego = [];
const symbols = {
  unchecked: '■',
  checked: '0',
  flagged: '√',
  mine: '☼',
}
const state = {
  buildMode: true,
  status: 0,
  message: 'Elige tamaño (3-30) y clic en "Construir"',
  mineCount: 0
} // 0=playing, 1=won, 2=lost
let row, cell;

// Init table with symbols.unchecked
function initThisTable(tamano) {
  return new Array(tamano).fill().map(e => new Array(tamano).fill(symbols.unchecked));
}

// Gets column No from n
function obtenColumna(n, len) {
  return  n % len;
}

// Gets row No from n
function obtenRenglon(n, len) {
  return Math.floor(n / len);
}

// Get shot from row and column (inverse from obtenRenglon & obtenColumna)
function obtenShot(i, j, len) {
  let sol = i * len + j;
  return sol;
}

// Counts mines around
function cuentaMinasCerca(renglon, columna, tamano) {
  let closemines = 0;
  for (let i = renglon - 1; i <= renglon + 1; i++) {
    for (let j = columna - 1; j <= columna + 1; j++) {
      // Within boundaries
      if (i >= 0 && i < tamano && j >= 0 && j < tamano && (i !== renglon || j !== columna)) {
        if (tabla[i][j] === symbols.mine) {
          closemines++;
        }
      }          
    }        
  }
  return String(closemines);
}

// Check if a "checked" square is around (this means this cell has 0 mines)
function estoyJuntoAChecked(renglon, columna) {
  for (let i = renglon - 1; i <= renglon + 1; i++) {
    for (let j = columna - 1; j <= columna + 1; j++) {
      // Within boundaries
      if (i >= 0 && i < tablaJuego[0].length && j >= 0 && j < tablaJuego.length && (i !== renglon || j !== columna)) {
        if (tablaJuego[i][j] === symbols.checked) {
          return true;
        }
      }          
    }        
  }
  return false;
}

// Count checked & flagged cells around
function cuentaAlrededor(renglon, columna, botonesPC, action) {
  //     unchecked,flagged,unchpositions,"1"positions,"2"positions
  //               ↓  ↓   ↓   ↓   ↓
  let alrededor = [0, 0, [], [], []];
  for (let i = renglon - 1; i <= renglon + 1; i++) {
    for (let j = columna - 1; j <= columna + 1; j++) {
      // Within boundaries
      if (i >= 0 && i < tablaJuego[0].length && j >= 0 && j < tablaJuego.length && (i !== renglon || j !== columna)) {
        if (tablaJuego[i][j] === symbols.unchecked) {
          alrededor[0]++;
          alrededor[2].push(obtenShot(i, j, tablaJuego.length));
          // Debería hacer un click derecho, pero no sé cómo ↓ botonesPC[obtenShot(i, j, tablaJuego.length)].auxclick();
          if (action === 'flag') {
            document.getElementById(obtenShot(i, j, tablaJuego.length)).src = './img/flag.png';
            tablaJuego[i][j] = symbols.flagged;
          }
          if (action === 'unchecked') {
            //console.log('dando clic en: ', obtenShot(i, j, tablaJuego.length));
            botonesPC[obtenShot(i, j, tablaJuego.length)].click();
            //tablaJuego[i][j] = tabla[i][j];
          }
          //document.getElementById(obtenShot(i, j, tablaJuego.length)).src = './img/flag.png';
        } else if (tablaJuego[i][j] === symbols.flagged) {
          alrededor[1]++;
        } else if (tablaJuego[i][j] === '1') {
          alrededor[3].push(obtenShot(i, j, tablaJuego.length));
        } else if (tablaJuego[i][j] === '2') {
          alrededor[4].push(obtenShot(i, j, tablaJuego.length));
        }
      }          
    }        
  }
  return alrededor;
}

// Obtains elements in "a" that are not in "b" and viceversa
function subConjunto(a, b) {
  let aa = [];
  for (let x = 0; x < a.length; x++) {
    let included = false;
    for (let y = 0; y < b.length; y++) {
      if (a[x] === b[y]) included = true;
    }
    if (!included) aa.push(a[x]);
  }
  return aa;
}
function subConjuntoS(a, b) {
  if (a.length > 0 && b.length > 0) {
    let subs = []
    subs.push(subConjunto(a, b));
    subs.push(subConjunto(b, a));
    return subs;
  } else {
    return false;
  }
}

function azar() {
  // Random shot/test
  let uncheckedSquares = [], tamano = tablaJuego.length;
  for (let i = 0; i < tamano; i++) {
    for (let j = 0; j < tamano; j++) {
      if (tablaJuego[i][j] === symbols.unchecked) {
        uncheckedSquares.push(obtenShot(i, j, tamano));
      }              
    }            
  }  
  let rand = Math.floor(Math.random() * uncheckedSquares.length);
  //console.log(uncheckedSquares);
  //console.log('tirando en index:', rand);
  return uncheckedSquares[rand];
}

// Creates board's empty array
function construye() {
  // Reset mineCount
  let infoMinas = document.getElementById('info-minas');
  state.mineCount = 0;
  infoMinas.innerText = state.mineCount;

  // Set limits
  const tamanoInput = document.getElementById('input-tamano');
  let tamano = Number(tamanoInput.value);
  if (tamano < 3) tamano = 3;
  if (tamano > 40) tamano = 40;
  tamanoInput.value = tamano;
  
  // Set empty array
  tabla = [];
  // Init mine table
  tabla = initThisTable(tamano);
  /*for (let i = 0; i < tamano; i++) {
    let arregloLineal = [];
    for (let j = 0; j < tamano; j++) {
      arregloLineal.push(symbols.unchecked);      
    }
    tabla.push(arregloLineal);
  }*/

  // Update state
  state.buildMode = false;
  state.message = '1. Clic en el Tablero para colocar minas. Clic en "Probar" para jugar Buscaminas. Clic en "Auto-Juego" para ver cómo lo intenta resolver';
  document.getElementById('state').textContent = state.message;
  state.status = 0;
  document.getElementById('pc-status').innerText = ' ';
  document.getElementById('img-status').src = './img/status-normal.png';

  // Reset table
  const tablaElemento = document.getElementById('table');
  tablaElemento.innerHTML = '';    
  
  // Insert rows and cells into table
  let index = 0;
  for (let i = 0; i < tamano; i++) {
    row = tablaElemento.insertRow();
    for (let j = 0; j < tamano; j++) {
      cell = row.insertCell();
      cell.id = index + 10000;
      let img = document.createElement('img');
      img.id = index;
      img.className = 'img-tablero';
      img.src = './img/unchecked.png';
      cell.appendChild(img);
      index++;
    }
  }

  // Enable Probar and Auto-Juego buttons
  document.getElementById('boton-probar').disabled = false;
  document.getElementById('boton-iniciar').disabled = false;

  // Create click, auxclick (eg right-click) event for each cell
  // contextmenu just to prevent the right click menu to pop up
  //dibujaTablero(tamano, clicIzquierdo, clicDerecho);

  let cellTodas = [];
  for (let i = 0; i < tamano**2; i++) {
    cellTodas.push(document.getElementById(i));
    // Place or remove mine
    cellTodas[i].addEventListener('click', () => {
      /*if (i > 998) {
        console.log('Últimas celdas', i);
      }*/
      let renglon = obtenRenglon(i, tamano);
      let columna = obtenColumna(i, tamano);
      let img = document.getElementById(i);
      if (tabla[renglon][columna] === symbols.unchecked) {
        tabla[renglon][columna] = symbols.mine;        
        img.src = './img/mine.png';
        state.mineCount++;
        infoMinas.innerText = state.mineCount;
      } else {
        tabla[renglon][columna] = symbols.unchecked;
        img.src = './img/unchecked.png';
        state.mineCount--;
        infoMinas.innerText = state.mineCount;
      }
    }, false);
    cellTodas[i].addEventListener('contextmenu', (e) => e.preventDefault(), false);
    cellTodas[i].addEventListener('auxclick', (e) => {
      e.preventDefault();
      console.log('right', i);
    }, false);
  }
  
  // Places random mines: ≈1 mine per 6.5 cells
  // ej: 10x10 = 100/6 : 16 mines
  // Oficial Sizes 9x9:10 16x16:40 16x30:99
  let cuantasMinas = Math.floor(tamano**2 / 6.6), ponerMinasAqui = [];
  //console.log(`debo poner ${cuantasMinas} al azar`);
  while (ponerMinasAqui.length < cuantasMinas) {
    let rand = Math.floor(Math.random() * tamano**2);
    if (ponerMinasAqui.length !== 0) {
      let repeated = false;
      ponerMinasAqui.forEach((e) => {
        if (rand === e) repeated = true;
      });
      if (!repeated) ponerMinasAqui.push(rand);
    } else {
      ponerMinasAqui.push(rand);
    }
  }
  //console.log(JSON.stringify(ponerMinasAqui));
  ponerMinasAqui.forEach((e) => {
    document.getElementById(e).click();
  });
}

function showMines(won) {
  let tamano = tabla.length;
  let index = 10000;
  for (let i = 0; i < tamano; i++) {
    for (let j = 0; j < tamano; j++) {
      let thisCell = document.getElementById(index);
      thisCell.innerHTML = '';
      index++;
      if (tabla[i][j] === symbols.mine && !won) {
        tablaJuego[i][j] = symbols.mine;
      }
      let deadImg = document.createElement('img');
      deadImg.className = 'img-tablero';
      if (tablaJuego[i][j] === symbols.checked) {
        deadImg.src = './img/checked.png';
      } else if (tablaJuego[i][j] === symbols.unchecked) {
        deadImg.src = './img/unchecked.png';
      } else if (tablaJuego[i][j] === symbols.mine && !won) {
        deadImg.src = './img/mine.png';
      } else if (tablaJuego[i][j] === symbols.mine && won) {
        deadImg.src = './img/flag.png';
      } else if (tablaJuego[i][j] === symbols.flagged && !won) {
        deadImg.src = './img/x.png';
      } else if (tablaJuego[i][j] === symbols.flagged && won) {
        deadImg.src = './img/flag.png';
      } else {
        deadImg.src = `./img/${tablaJuego[i][j]}.png`;
      }
      thisCell.appendChild(deadImg);
    }      
  }
}

function playMines(e, tamano) {  
  //console.log(e.target.id);
  let shot = Number(e.target.id);
  let renglon = obtenRenglon(shot, tamano);
  let columna = obtenColumna(shot, tamano);
  //console.log(renglon, columna);
  //console.log(JSON.stringify(tablaJuego));
  let img = document.getElementById(shot);
  if (tabla[renglon][columna] === symbols.mine) {
    // You lost: displays mines
    showMines(false);
    document.getElementById('img-status').src = './img/status-lost.png';
    state.status = 2;
    document.getElementById('state').textContent = 'JUEGO PERDIDO. Da clic en "Construir" para crear un juego nuevo';
    document.getElementById('boton-probar').disabled = true;
    document.getElementById('boton-iniciar').disabled = true;
  } else if (tablaJuego[renglon][columna] === symbols.unchecked) {
    tablaJuego[renglon][columna] = cuentaMinasCerca(renglon, columna, tamano);
    if (tablaJuego[renglon][columna] !== symbols.checked) {
      img.src = `./img/${tablaJuego[renglon][columna]}.png`;
    } else {
      // Zero close mines, so clean around
      img.src = `./img/checked.png`;
      let vaciosLimpiados = false;
      while (!vaciosLimpiados) {
        vaciosLimpiados = true;
        for (let i = 0; i < tamano; i++) {
          for (let j = 0; j < tamano; j++) {
            if (tablaJuego[i][j] === symbols.unchecked) {
              if (estoyJuntoAChecked(i, j)) {
                tablaJuego[i][j] = cuentaMinasCerca(i, j, tamano);
                vaciosLimpiados = false;
                //console.log('shot', obtenShot(i, j, tamano));
                img = document.getElementById(obtenShot(i, j, tamano));
                if (tablaJuego[i][j] === symbols.checked) {
                  img.src = `./img/checked.png`;
                } else {
                  img.src = `./img/${tablaJuego[i][j]}.png`;
                }                
              }
            }
          }          
        }
      }
    }    
  }
  if (state.status !== 2) {
    let hasWon = true;
    for (let i = 0; i < tamano; i++) {
      for (let j = 0; j < tamano; j++) {
        if (tabla[i][j] === symbols.unchecked && tablaJuego[i][j] === symbols.unchecked)
        hasWon = false;
      }
    }
    if (hasWon) {
      showMines(true);
      document.getElementById('img-status').src = './img/status-won.png';
      state.status = 1;
      document.getElementById('state').textContent = 'JUEGO GANADO !!!';
    }
  }
  
  
}

function markMines(e, tamano) {
  //e.preventDefault();
  let markThis = e.target.id;
  let renglon = obtenRenglon(markThis, tamano);
  let columna = obtenColumna(markThis, tamano);
  //console.log('right click', markThis);
  if (tablaJuego[renglon][columna] === symbols.unchecked) {
    tablaJuego[renglon][columna] = symbols.flagged;
    document.getElementById(markThis).src = './img/flag.png';
  } else if (tablaJuego[renglon][columna] === symbols.flagged) {
    tablaJuego[renglon][columna] = symbols.unchecked;
    document.getElementById(markThis).src = './img/unchecked.png';
  }
}

// Start test-game (human played game)
function probar() {
  const tamano = tabla.length;
  tablaJuego = initThisTable(tamano);
  // tablaJuego = game the user can see (AKA mines are hidden)
  //console.log(JSON.stringify(tablaJuego));
  // redibujar tablero con valores de tablaJuego
  // cambiar funcionalidad de los clics
  

  // Clear board images
  let imgTodas = [];  
  for (let i = 10000; i < tamano**2 + 10000; i++) {
    let renglon = obtenRenglon(i - 10000, tamano);
    let columna = obtenColumna(i - 10000, tamano);
    imgTodas.push(document.getElementById(i));
    imgTodas[i - 10000].innerHTML = '';
    let img = document.createElement('img');
    img.id = i - 10000;
    img.className = 'img-tablero';
    let cell = document.getElementById(i);
    cell.appendChild(img);
    if (tablaJuego[renglon][columna] === symbols.unchecked) {
      img.src = './img/unchecked.png';      
    }
    img.addEventListener('contextmenu', e => e.preventDefault(), false);
    img.addEventListener('click', e => playMines(e, tamano), false);    
    img.addEventListener('auxclick', e => markMines(e, tamano), false);
  }  
}

// ---------SELF PLAYED GAME---------
function iniciar() {  
  probar();
  console.log('Iniciando modo "auto-juego"');

  // Set Interval delay
  let inputLag = document.getElementById('input-lag')
  let delay = Number(inputLag.value);
  if (delay < 1) {
    delay = 1;
  } else if (delay > 2000) {
    delay = 2000;
  }
  inputLag.value = delay;
  console.log('DELAY: ', delay);

  // Create "PC's" buttons
  let botonesPC = [], tamano = tabla.length, id = 0;
  for (let i = 0; i < tamano; i++) {
    for (let j = 0; j < tamano; j++) {
      botonesPC.push(document.getElementById(id));
      id++;
    }
  }
  // "PC" ve el tablero accesando tablaJuego  
  let tiroActual = 0, huboAccion = false, iniciandoJuego = true;
  let pcStatus = document.getElementById('pc-status');

  //botonesPC[1].click();
  let timeOutID = setInterval(() => {
    // AQUÍ VOY: algoritmo para 2 celdas con "1" juntas
    
    
    /*for (let x = 0; x < 5; x++) {
      botonesPC[x].click();        
    }   */ 
    
    //AQUÍ VOY: únicamente incluir las celdas que no se han examinado 
    // Creates array with cells that need to be examined
    // Ex idCell > 0 
    let checkThisCells = [];
    for (let i = 0; i < tamano; i++) {
      for (let j = 0; j < tamano; j++) {
        let around = cuentaAlrededor(i, j);
        if (Number(tablaJuego[i][j]) > 0 && around[0] > 0) {
          checkThisCells.push(obtenShot(i, j, tamano));
        }
      }        
    }
    if (tiroActual >= checkThisCells.length) tiroActual = 0;
    //console.log(JSON.stringify(checkThisCells));
    //console.log(checkThisCells.length);  

    
    if (checkThisCells.length > 0) {
      // Analiza celdas
      // Hay nuevos datos, entonces examinar las celdas
      let renglon = obtenRenglon(checkThisCells[tiroActual], tamano);
      let columna = obtenColumna(checkThisCells[tiroActual], tamano);
      let idCell = Number(tablaJuego[renglon][columna]);
      pcStatus.innerHTML = `Analizando (${renglon},${columna}). Tiene ${idCell} minas cerca<br>${pcStatus.innerHTML}`;

      // Counts nearby cells
      let alrededor = cuentaAlrededor(renglon, columna);
      if (idCell === (alrededor[0] + alrededor[1]) && alrededor[0] > 0) {
        // All unchecked cells are mines
        // Flag them
        cuentaAlrededor(renglon, columna, botonesPC, 'flag');
        pcStatus.innerHTML = `Minas identificadas alrededor de (${renglon},${columna})<br>${pcStatus.innerHTML}`;
        huboAccion = true;
      } else if (idCell === alrededor[1] && alrededor[0] > 0) {
        // Flagged cells equal number
        // So all unchecked are safe to click
        pcStatus.innerHTML = `Celdas seguras alrededor de (${renglon},${columna})<br>${pcStatus.innerHTML}`;
        alrededor = cuentaAlrededor(renglon, columna, botonesPC, 'unchecked');
        huboAccion = true;
      } else if (idCell === 1 && alrededor[3].length > 0) {
        // Two or more "1" cells together
        // Celda combinada "1" "1"
        for (let i = 0; i < alrededor[3].length; i++) {
          let renInt = obtenRenglon(alrededor[3][i], tamano);
          let colInt = obtenColumna(alrededor[3][i], tamano);
          let alrededorInt = cuentaAlrededor(renInt, colInt);
          let subs = subConjuntoS(alrededor[2], alrededorInt[2]);
          if (subs) {
            if ((subs[0].length > 0 && subs[1].length === 0) || (subs[1].length > 0 && subs[0].length === 0)) {
              //console.log(`Alrededor: ${JSON.stringify(alrededor)}, AlrededorInt: ${JSON.stringify(alrededorInt)}`);
              if (alrededor[1] === 0 && alrededorInt[1] === 0) {
                pcStatus.innerHTML = `<span class="blue">Celdas combinadas "1" "1" alrededor de (${renglon},${columna})</span><br>${pcStatus.innerHTML}`;
                if (subs[0].length > 0) {
                  console.log('dar clic en', JSON.stringify(subs[0]));              
                  subs[0].forEach(e => botonesPC[e].click());
                } else {
                  console.log('dar clic en', JSON.stringify(subs[1]));
                  subs[1].forEach(e => botonesPC[e].click());
                }
                huboAccion = true;
              }              
            }
          }
        }        
      } else if (idCell === 1 && alrededor[4].length > 0) { // && alrededor hay un "2"
        // y las unchecked de "1" son subconjunto de "2"
        pcStatus.innerHTML = `<span class="purple">Celdas combinadas "1" "2" alrededor de (${renglon},${columna})</span><br>${pcStatus.innerHTML}`;

      }
    } else {
      // Tiro inicial
      let alAzar = azar();
      botonesPC[alAzar].click();
      huboAccion = true;
      tiroActual = -1;
      pcStatus.innerHTML = `<span class="red">Tiro inicial al azar (${obtenRenglon(alAzar, tamano)}, ${obtenColumna(alAzar, tamano)})</span><br>${pcStatus.innerHTML}`;
    }
    if (tiroActual < checkThisCells.length - 1) {
      tiroActual++;
    } else {
      tiroActual = 0;
      pcStatus.innerHTML = `Ciclo terminado<br>${pcStatus.innerHTML}`;
      if (!huboAccion) {
        // No hubo acción, tirando al azar
        let alAzar = azar();
        botonesPC[alAzar].click();
        pcStatus.innerHTML = `<span class="red">No hay dónde tirar. Tirando al azar en (${obtenRenglon(alAzar, tamano)}, ${obtenColumna(alAzar, tamano)})</span><br>${pcStatus.innerHTML}`;
      }//**************      
      huboAccion = false;
    }    


    if (state.status !== 0 ) clearInterval(timeOutID);
  }, delay);

}