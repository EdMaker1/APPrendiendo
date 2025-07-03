// Elementos del DOM
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaSeleccion = document.getElementById('pantalla-seleccion');
const pantallaJuego = document.getElementById('pantalla-juego');
const btnEmpezar = document.getElementById('btnEmpezar');
const btnVolverInicio = document.getElementById('btnVolverInicio');
const btnVolverSeleccion = document.getElementById('btnVolverSeleccion');
const btnBorrador = document.getElementById('btnBorrador');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imagenFondo = document.getElementById('imagenFondo');
const miniatura = document.getElementById('miniatura');
const colorPicker = document.getElementById('colorPicker');
const progresoElement = document.getElementById('progreso');
const mensajeFinal = document.getElementById('mensajeFinal');
const paletaColores = document.getElementById('paleta-colores');
const opcionesImagen = document.querySelectorAll('.opcion-imagen');

// Variables del juego
let colorSeleccionado = '#ff0000';
let modoBorrador = false;
let progreso = 0;
let circulos = [];
let imagenActual = 1;
const RADIO_CIRCULO = 12;
const OPACIDAD_CIRCULOS = 0.2;

// Paleta de colores predefinidos
const coloresPaleta = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', 
  '#00FFFF', '#FFA500', '#A52A2A', '#800080', '#008000',
  '#000080', '#808000', '#800000', '#008080', '#FFC0CB'
];

// Configuración inicial
document.addEventListener('DOMContentLoaded', () => {
  generarPaletaColores();
  precargarImagenes();
});

function precargarImagenes() {
  for (let i = 1; i <= 3; i++) {
    new Image().src = `imagenes/Color${i}.png`;
    new Image().src = `imagenes/BlancoNegro${i}.png`;
  }
}

// Navegación entre pantallas
btnEmpezar.addEventListener('click', () => {
  pantallaInicio.classList.add('oculta');
  pantallaSeleccion.classList.remove('oculta');
});

btnVolverInicio.addEventListener('click', () => {
  pantallaSeleccion.classList.add('oculta');
  pantallaInicio.classList.remove('oculta');
});

btnVolverSeleccion.addEventListener('click', () => {
  pantallaJuego.classList.add('oculta');
  pantallaSeleccion.classList.remove('oculta');
});

// Selección de imágenes
opcionesImagen.forEach(opcion => {
  opcion.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-seleccionar') || e.target.tagName === 'P' || e.target.tagName === 'IMG') {
      imagenActual = opcion.dataset.imagen;
      cargarImagen(imagenActual);
      pantallaSeleccion.classList.add('oculta');
      pantallaJuego.classList.remove('oculta');
      iniciarJuego();
    }
  });
});

function cargarImagen(numeroImagen) {
  miniatura.src = `imagenes/Color${numeroImagen}.png`;
  imagenFondo.src = `imagenes/BlancoNegro${numeroImagen}.png`;
}

// Funciones del juego
btnBorrador.addEventListener('click', toggleBorrador);
colorPicker.addEventListener('input', (e) => {
  colorSeleccionado = e.target.value;
  modoBorrador = false;
  btnBorrador.style.backgroundColor = '#ff6666';
  btnBorrador.textContent = '🧽 Borrador';
  actualizarSeleccionColorPicker();
});

function generarPaletaColores() {
  paletaColores.innerHTML = '';
  coloresPaleta.forEach(color => {
    const colorElement = document.createElement('div');
    colorElement.className = 'color-option';
    colorElement.style.backgroundColor = color;
    colorElement.dataset.color = color;
    
    colorElement.addEventListener('click', () => {
      colorSeleccionado = color;
      modoBorrador = false;
      btnBorrador.style.backgroundColor = '#ff6666';
      btnBorrador.textContent = '🧽 Borrador';
      actualizarSeleccionColorPicker();
      colorPicker.value = color;
    });
    
    paletaColores.appendChild(colorElement);
  });
}

function actualizarSeleccionColorPicker() {
  document.querySelectorAll('.color-option').forEach(el => {
    el.classList.remove('selected');
    if (el.dataset.color === colorSeleccionado) {
      el.classList.add('selected');
    }
  });
}

function iniciarJuego() {
  if (!imagenFondo.complete) {
    imagenFondo.onload = function() {
      configurarCanvas();
    };
  } else {
    configurarCanvas();
  }
}

function configurarCanvas() {
  // Configurar el canvas al tamaño de la imagen
  canvas.width = imagenFondo.naturalWidth;
  canvas.height = imagenFondo.naturalHeight;
  
  // Calcular cantidad de círculos
  const ancho = canvas.width;
  const alto = canvas.height;
  const espacioEntreCirculos = RADIO_CIRCULO * 2.5;
  
  const columnas = Math.floor(ancho / espacioEntreCirculos);
  const filas = Math.floor(alto / espacioEntreCirculos);
  
  // Generar círculos en cuadrícula
  circulos = [];
  const codigos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'E', 'I', 'O', 'U'];
  
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const x = col * espacioEntreCirculos + RADIO_CIRCULO;
      const y = fila * espacioEntreCirculos + RADIO_CIRCULO;
      const codigo = codigos[Math.floor(Math.random() * codigos.length)];
      
      circulos.push({
        x,
        y,
        codigo,
        color: null,
        pintado: false
      });
    }
  }
  
  dibujarCirculos();
  actualizarProgreso();
  actualizarSeleccionColorPicker();
}

function toggleBorrador() {
  modoBorrador = !modoBorrador;
  btnBorrador.style.backgroundColor = modoBorrador ? '#555' : '#ff6666';
  btnBorrador.textContent = modoBorrador ? '✏️ Pintar' : '🧽 Borrador';
}

function reiniciarJuego() {
  progreso = 0;
  circulos = [];
  mensajeFinal.textContent = "";
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function dibujarCirculos() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  circulos.forEach(c => {
    if (!c.pintado) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, RADIO_CIRCULO, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(200, 200, 255, ${OPACIDAD_CIRCULOS})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(150, 150, 200, ${OPACIDAD_CIRCULOS})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.font = `${RADIO_CIRCULO}px Arial`;
      ctx.fillStyle = `rgba(0, 0, 0, ${OPACIDAD_CIRCULOS + 0.3})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.codigo, c.x, c.y);
    } else {
      ctx.beginPath();
      ctx.arc(c.x, c.y, RADIO_CIRCULO, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(c.x - RADIO_CIRCULO/3, c.y - RADIO_CIRCULO/3, RADIO_CIRCULO/3, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      
      ctx.font = `${RADIO_CIRCULO}px Arial`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.codigo, c.x, c.y);
    }
  });
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const xClick = e.clientX - rect.left;
  const yClick = e.clientY - rect.top;

  let circuloModificado = false;

  circulos.forEach(c => {
    const distancia = Math.hypot(c.x - xClick, c.y - yClick);
    if (distancia < RADIO_CIRCULO) {
      if (modoBorrador) {
        if (c.pintado) {
          c.pintado = false;
          c.color = null;
          progreso--;
          circuloModificado = true;
        }
      } else if (!c.pintado) {
        c.pintado = true;
        c.color = colorSeleccionado;
        progreso++;
        circuloModificado = true;
      }
    }
  });

  if (circuloModificado) {
    dibujarCirculos();
    actualizarProgreso();
    if (progreso === circulos.length) {
      mensajeFinal.textContent = "🎉 ¡Felicidades, completaste tu dibujo! 🏅";
    }
  }
});

function actualizarProgreso() {
  progresoElement.textContent = `Progreso: ${progreso} de ${circulos.length} zonas pintadas`;
}