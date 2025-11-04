document.addEventListener("DOMContentLoaded", () => {
  actualizarEventos();
  calcularTotales();
  habilitarEnterParaTabular();
  mostrarHistorial(); // obtiene los datos desde el backend
});

/* ===========================
   Funciones para tablas
=========================== */
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

function editarFila(btn) {
  const row = btn.closest("tr");
  row.querySelectorAll("input").forEach(i => i.removeAttribute("readonly"));
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾";
  saveBtn.onclick = function() { guardarFilaEditada(this); };
  btn.parentNode.replaceChild(saveBtn, btn);
}

function guardarFilaEditada(btn) {
  const row = btn.closest("tr");
  row.querySelectorAll("input").forEach(i => i.setAttribute("readonly", true));
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = function() { editarFila(this); };
  btn.parentNode.replaceChild(editBtn, btn);
  calcularTotales();
}

function eliminarFila(btn) {
  btn.closest("tr").remove();
  calcularTotales();
}

function actualizarEventos() {
  document.querySelectorAll(".cantidad, .precio, .monto-servicio-realizado").forEach(inp => {
    inp.oninput = calcularTotales;
  });
}

/* ===========================
   Totales
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
   Usabilidad
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
   PDF
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


function limpiarFormulario() {
  // Limpiar campos de texto
  document.getElementById("fecha").value = "";
  document.getElementById("cliente").value = "";
  document.getElementById("ruc").value = "";
  document.getElementById("vehiculo").value = "";
  document.getElementById("chapa").value = "";
  document.getElementById("mecanico").value = "";
  document.getElementById("factura").value = "";

  // Limpiar tablas
  document.querySelector("#tabla-servicios tbody").innerHTML = "";
  document.querySelector("#tabla-servicios-realizados tbody").innerHTML = "";

  // Limpiar totales
  document.getElementById("total-general").textContent = "0";
  document.getElementById("montoServicio").textContent = "0";
  document.getElementById("diferencia").textContent = "0";
  document.getElementById("monto-total-final").textContent = "0";

  // Opcional: agregar una fila vacía al inicio
  agregarFila();
  agregarServicioRealizado();
}
/* ===========================
   Funciones con backend (offline)
=========================== */
async function guardarHistorial() {
  try {
    const nuevoControl = recolectarDatos(); // recolecta TODOS los datos del formulario

    const res = await fetch("http://localhost:3000/api/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoControl)
    });

    const data = await res.json();
    mostrarMensaje(data.mensaje); // mensaje flotante bonito

    // actualizar historial en el frontend
    mostrarHistorial();

  } catch (err) {
    console.error("Error al guardar:", err);
    mostrarMensaje("Error al guardar control ❌");
  }
}


async function mostrarHistorial() {
  try {
    const res = await fetch("http://localhost:3000/api/historial");
    const historial = await res.json();
    const historialLista = document.getElementById("historial-lista");
    historialLista.innerHTML = "";

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
        <p><strong>Monto Total Final:</strong> ${control.totales?.montoFinal || "0"}</p>
        <div class="no-print">
          <button onclick="cargarHistorial(${index})">Cargar</button>
          <button onclick="eliminarHistorial(${index})">Eliminar</button>
        </div>
      `;
      historialLista.appendChild(itemDiv);
    });
  } catch (err) {
    console.error("Error al cargar historial:", err);
    mostrarMensaje("Error al cargar historial ❌");
  }
}


async function cargarHistorial(index) {
  try {
    const res = await fetch("http://localhost:3000/api/historial");
    const historial = await res.json();

    if (index >= 0 && index < historial.length) {
      const control = historial[index];

      // === Campos generales ===
      document.getElementById("fecha").value = control.fecha || "";
      document.getElementById("cliente").value = control.cliente || "";
      document.getElementById("ruc").value = control.ruc || "";
      document.getElementById("vehiculo").value = control.vehiculo || "";
      document.getElementById("chapa").value = control.chapa || "";
      document.getElementById("mecanico").value = control.mecanico || "";
      document.getElementById("factura").value = control.factura || "";

      // === Tabla servicios realizados ===
      const tbodyServicios = document.querySelector("#tabla-servicios-realizados tbody");
      tbodyServicios.innerHTML = "";
      if (control.serviciosRealizados?.length > 0) {
        control.serviciosRealizados.forEach(sr => agregarServicioRealizado(sr.servicio, sr.monto));
      } else {
        agregarServicioRealizado();
      }

      // === Tabla ítems utilizados ===
      const tbodyItems = document.querySelector("#tabla-servicios tbody");
      tbodyItems.innerHTML = "";
      if (control.items?.length > 0) {
        control.items.forEach(item => agregarFila(item.codigo, item.cantidad, item.descripcion, item.precio));
      } else {
        agregarFila();
      }

      // === Totales ===
      calcularTotales();

      // === Mensaje flotante bonito ===
      mostrarMensaje(`Control de ${control.cliente} cargado exitosamente ✅`);
    } else {
      mostrarMensaje("Error: índice de historial no válido ❌");
    }
  } catch (err) {
    console.error("Error al cargar historial:", err);
    mostrarMensaje("Error al cargar historial ❌");
  }
}



async function eliminarHistorial(id, cliente) {
  mostrarConfirmacion(
    `¿Estás seguro que quieres eliminar los datos guardados de ${cliente}? Esta acción es irreversible.`,
    async () => {
      try {
        await fetch(`http://localhost:3000/api/eliminar/${id}`, { method: 'DELETE' });
        mostrarHistorial();
        mostrarMensaje(`Control de ${cliente} eliminado ✅`);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  );
}

/* ===========================
   Extras UI (mensajes y confirmaciones)
=========================== */
function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensaje-flotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 3000);
}

function mostrarConfirmacion(texto, callbackAceptar) {
  const confirmBox = document.getElementById("confirmacion-flotante");
  const mensaje = document.getElementById("mensaje-confirmacion");
  mensaje.textContent = texto;
  confirmBox.classList.add("show");

  const btnAceptar = confirmBox.querySelector(".aceptar");
  const btnCancelar = confirmBox.querySelector(".cancelar");

  btnAceptar.onclick = () => {
    confirmBox.classList.remove("show");
    callbackAceptar();
  };
  btnCancelar.onclick = () => confirmBox.classList.remove("show");
}

/* ===========================
   Recolectar datos del formulario
=========================== */
function recolectarDatos() {
  const serviciosRealizados = [];
  document.querySelectorAll("#tabla-servicios-realizados tbody tr").forEach(row => {
    serviciosRealizados.push({
      servicio: row.querySelector(".servicio-realizado").value.trim(),
      monto: parseFloat(row.querySelector(".monto-servicio-realizado").value) || 0,
    });
  });

  const items = [];
  document.querySelectorAll("#tabla-servicios tbody tr").forEach(row => {
    items.push({
      codigo: row.querySelector(".codigo").value.trim(),
      cantidad: parseFloat(row.querySelector(".cantidad").value) || 0,
      descripcion: row.querySelector(".descripcion").value.trim(),
      precio: parseFloat(row.querySelector(".precio").value) || 0,
    });
  });

  return {
    fecha: document.getElementById("fecha").value,
    cliente: document.getElementById("cliente").value.trim(),
    ruc: document.getElementById("ruc").value.trim(),
    vehiculo: document.getElementById("vehiculo").value.trim(),
    chapa: document.getElementById("chapa").value.trim(),
    mecanico: document.getElementById("mecanico").value.trim(),
    factura: document.getElementById("factura").value.trim(),
    serviciosRealizados,
    items,
    totales: {
      montoFinal: document.getElementById("monto-total-final").textContent.trim(),
      montoServicios: document.getElementById("montoServicio").textContent.trim(),
      montoItems: document.getElementById("total-general").textContent.trim(),
      diferencia: document.getElementById("diferencia").textContent.trim()
    }
  };



}


