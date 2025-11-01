document.addEventListener("DOMContentLoaded", () => {
  actualizarEventos(); // Asigna eventos a los inputs existentes
  calcularTotales(); // Calcula los totales iniciales
  habilitarEnterParaTabular(); // Habilita la navegación con Enter
  mostrarHistorial(); // Muestra el historial guardado al cargar la página
});

/* ===========================
   Funciones para la gestión de tablas
=========================== */

/**
 * Agrega una nueva fila a la tabla de ítems utilizados.
 */
function agregarFila(codigo = "", cantidad = 1, descripcion = "", precio = 0) {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td><input type="text" class="codigo" value="${codigo}" readonly></td>
    <td><input type="number" class="cantidad" value="${cantidad}" min="0" readonly></td>
    <td><input type="text" class="descripcion" value="${descripcion}" readonly></td>
    <td><input type="number" class="precio" value="${precio}" min="0" readonly></td>
    <td class="total">0</td>
    <td class="no-print">
      <button onclick="editarFila(this)">✏️</button>
      <button onclick="eliminarFila(this)">🗑</button>
    </td>
  `;
  document.querySelector("#tabla-servicios tbody").appendChild(fila);
  actualizarEventos();
  habilitarEnterParaTabular();
  calcularTotales();
}

/**
 * Agrega una nueva fila a la tabla de servicios realizados.
 */
function agregarServicioRealizado(servicio = "", monto = 0) {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td><input type="text" class="servicio-realizado" value="${servicio}" required readonly></td>
    <td><input type="number" class="monto-servicio-realizado" value="${monto}" min="0" readonly></td>
    <td class="no-print">
      <button onclick="editarFila(this)">✏️</button>
      <button onclick="eliminarFila(this)">🗑</button>
    </td>
  `;
  document.querySelector("#tabla-servicios-realizados tbody").appendChild(fila);
  actualizarEventos();
  habilitarEnterParaTabular();
  calcularTotales();
}

/**
 * Habilita la edición de los campos de una fila.
 */
function editarFila(btn) {
  const row = btn.closest("tr");
  row.querySelectorAll("input").forEach(i => i.removeAttribute("readonly"));
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾";
  saveBtn.onclick = function() { guardarFilaEditada(this); };
  btn.parentNode.replaceChild(saveBtn, btn);
}

/**
 * Guarda los cambios realizados en una fila editada.
 */
function guardarFilaEditada(btn) {
  const row = btn.closest("tr");
  row.querySelectorAll("input").forEach(i => i.setAttribute("readonly", true));
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = function() { editarFila(this); };
  btn.parentNode.replaceChild(editBtn, btn);
  calcularTotales();
}

/**
 * Elimina la fila de la tabla.
 */
function eliminarFila(btn) {
  btn.closest("tr").remove();
  calcularTotales();
}

/**
 * Asigna el evento 'input' para recalcular totales automáticamente.
 */
function actualizarEventos() {
  document.querySelectorAll(".cantidad, .precio, .monto-servicio-realizado").forEach(inp => {
    inp.oninput = calcularTotales;
  });
}

/* ===========================
   Funciones de Cálculo de Totales
=========================== */
function calcularTotales() {
  let totalItems = 0;
  document.querySelectorAll("#tabla-servicios tbody tr").forEach(r => {
    const cant = parseFloat(r.querySelector(".cantidad")?.value || 0);
    const prec = parseFloat(r.querySelector(".precio")?.value || 0);
    const tot = cant * prec;
    r.querySelector(".total").textContent = tot.toFixed(0);
    totalItems += tot;
  });
  document.getElementById("total-general").textContent = totalItems.toFixed(0);

  let totalServ = 0;
  document.querySelectorAll(".monto-servicio-realizado").forEach(i => {
    totalServ += parseFloat(i.value) || 0;
  });
  document.getElementById("montoServicio").textContent = totalServ.toFixed(0);

  document.getElementById("diferencia").textContent = (totalServ - totalItems).toFixed(0);
  document.getElementById("monto-total-final").textContent = totalServ.toFixed(0);
}

/* ===========================
   Funciones de Usabilidad
=========================== */
function habilitarEnterParaTabular() {
  const inputs = [...document.querySelectorAll("input,textarea")];
  inputs.forEach((inp, idx) => {
    inp.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        inputs[idx + 1]?.focus();
      }
    });
  });
}

function toggleEdicion() {
  document.querySelectorAll("input").forEach(inp => {
    if (!inp.closest(".no-print")) {
      inp.toggleAttribute("readonly");
    }
  });
}

/* ===========================
   Funciones de Exportación PDF
=========================== */
function generarPDF() {
  document.body.classList.add("exportando");
  html2pdf()
    .from(document.getElementById("formulario"))
    .set({
      margin: 5,
      filename: "reporte_servicios.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1.5, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    })
    .save()
    .then(() => {
      document.body.classList.remove("exportando");
    });
}

/* ===========================
   Funciones de Historial (localStorage)
=========================== */
const KEY = "historialControles";

function recolectarDatos() {
  const serviciosRealizados = [];
  document.querySelectorAll("#tabla-servicios-realizados tbody tr").forEach(row => {
    serviciosRealizados.push({
      servicio: row.querySelector(".servicio-realizado").value,
      monto: parseFloat(row.querySelector(".monto-servicio-realizado").value) || 0,
    });
  });

  const items = [];
  document.querySelectorAll("#tabla-servicios tbody tr").forEach(row => {
    items.push({
      codigo: row.querySelector(".codigo").value,
      cantidad: parseFloat(row.querySelector(".cantidad").value) || 0,
      descripcion: row.querySelector(".descripcion").value,
      precio: parseFloat(row.querySelector(".precio").value) || 0,
    });
  });

  return {
    fecha: document.getElementById("fecha").value,
    cliente: document.getElementById("cliente").value,
    ruc: document.getElementById("ruc").value,
    vehiculo: document.getElementById("vehiculo").value,
    chapa: document.getElementById("chapa").value,
    mecanico: document.getElementById("mecanico").value,
    factura: document.getElementById("factura").value,
    serviciosRealizados,
    items,
    totales: {
      totalItems: document.getElementById("total-general").textContent,
      totalServicios: document.getElementById("montoServicio").textContent,
      diferencia: document.getElementById("diferencia").textContent,
      montoFinal: document.getElementById("monto-total-final").textContent,
    },
  };
}

function guardarHistorial() {
  const nuevoControl = recolectarDatos();
  let historial = JSON.parse(localStorage.getItem(KEY)) || [];
  historial.push(nuevoControl);
  localStorage.setItem(KEY, JSON.stringify(historial));
  alert("Control guardado en el historial local.");
  mostrarHistorial();
}

function mostrarHistorial() {
  const historialLista = document.getElementById("historial-lista");
  historialLista.innerHTML = "";
  let historial = JSON.parse(localStorage.getItem(KEY)) || [];

  if (historial.length === 0) {
    historialLista.innerHTML = "<p>No hay controles guardados en el historial</p>";
    return;
  }

  historial.forEach((control, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("historial-item");
    itemDiv.innerHTML = `
      <p><strong>Fecha:</strong> ${control.fecha || "N/A"}</p>
      <p><strong>Cliente:</strong> ${control.cliente || "N/A"}</p>
      <p><strong>Vehículo:</strong> ${control.vehiculo || "N/A"} - ${control.chapa || "N/A"}</p>
      <p><strong>Monto Total Final:</strong> ${control.totales.montoFinal || "0"}</p>
      <div class="no-print">
        <button onclick="cargarHistorial(${index})">Cargar</button>
        <button onclick="eliminarHistorial(${index})">Eliminar</button>
      </div>
    `;
    historialLista.appendChild(itemDiv);
  });
}

function cargarHistorial(index) {
  let historial = JSON.parse(localStorage.getItem(KEY)) || [];
  if (index >= 0 && index < historial.length) {
    const control = historial[index];

    document.getElementById("fecha").value = control.fecha;
    document.getElementById("cliente").value = control.cliente;
    document.getElementById("ruc").value = control.ruc;
    document.getElementById("vehiculo").value = control.vehiculo;
    document.getElementById("chapa").value = control.chapa;
    document.getElementById("mecanico").value = control.mecanico;
    document.getElementById("factura").value = control.factura;

    document.querySelector("#tabla-servicios-realizados tbody").innerHTML = "";
    document.querySelector("#tabla-servicios tbody").innerHTML = "";

    if (control.serviciosRealizados?.length > 0) {
      control.serviciosRealizados.forEach(sr => agregarServicioRealizado(sr.servicio, sr.monto));
    } else {
      agregarServicioRealizado();
    }

    if (control.items?.length > 0) {
      control.items.forEach(item => agregarFila(item.codigo, item.cantidad, item.descripcion, item.precio));
    } else {
      agregarFila();
    }

    calcularTotales();
    alert("Control cargado exitosamente.");
  } else {
    alert("Error: Índice de historial no válido.");
  }
}

function eliminarHistorial(index) {
  let historial = JSON.parse(localStorage.getItem(KEY)) || [];
  if (confirm("¿Estás seguro de que quieres eliminar este control del historial? Esta acción es irreversible.")) {
    historial.splice(index, 1);
    localStorage.setItem(KEY, JSON.stringify(historial));
    mostrarHistorial();
    alert("Control eliminado del historial.");
  }
}

function limpiarFormulario() {
  document.getElementById("fecha").value = "";
  document.getElementById("cliente").value = "";
  document.getElementById("ruc").value = "";
  document.getElementById("vehiculo").value = "";
  document.getElementById("chapa").value = "";
  document.getElementById("mecanico").value = "";
  document.getElementById("factura").value = "";

  document.querySelector("#tabla-servicios-realizados tbody").innerHTML = "";
  agregarServicioRealizado();

  document.querySelector("#tabla-servicios tbody").innerHTML = "";
  agregarFila();

  calcularTotales();
  actualizarEventos();
  habilitarEnterParaTabular();
  alert("Formulario limpiado");
}
