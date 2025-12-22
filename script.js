document.addEventListener("DOMContentLoaded", () => {
  mostrarHistorial(); // carga los controles desde backend
});

let HISTORIAL_GLOBAL = [];


/*
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes(); // cargamos clientes en el select
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
  document.getElementById("fecha").value = "";
  document.getElementById("cliente").value = "";
  document.getElementById("cliente_id")?.remove(); // quitar si existía
  document.getElementById("ruc").value = "";
  document.getElementById("vehiculo").value = "";
  document.getElementById("chapa").value = "";
  document.getElementById("mecanico").value = "";
  document.getElementById("factura").value = "";

  document.querySelector("#tabla-servicios tbody").innerHTML = "";
  document.querySelector("#tabla-servicios-realizados tbody").innerHTML = "";

  document.getElementById("total-general").textContent = "0";
  document.getElementById("montoServicio").textContent = "0";
  document.getElementById("diferencia").textContent = "0";
  document.getElementById("monto-total-final").textContent = "0";

  agregarFila();
  agregarServicioRealizado();
}

/* ===========================
   Backend con Railway
=========================== */

const API_URL = "https://back-tff-production.up.railway.app";

/*
// Cargar clientes y asignar cliente_id
async function cargarClientes() {
  try {
    const res = await fetch(`${API_URL}/api/clientes`);
    const data = await res.json();
    const inputCliente = document.getElementById("cliente");

    if (data.ok && data.datos.length > 0) {
      // Si solo querés mostrar el primer cliente automáticamente
      inputCliente.value = data.datos[0].nombre;
      // Guardar cliente_id en input oculto
      let hiddenId = document.getElementById("cliente_id");
      if (!hiddenId) {
        hiddenId = document.createElement("input");
        hiddenId.type = "hidden";
        hiddenId.id = "cliente_id";
        inputCliente.parentNode.appendChild(hiddenId);
      }
      hiddenId.value = data.datos[0].id;
    }
  } catch (err) {
    console.error("Error cargando clientes:", err);
  }
}
   */

function recolectarDatos() {
  // Datos del formulario
  const cliente = document.getElementById("cliente").value.trim();
  const ruc = document.getElementById("ruc").value.trim();
  const vehiculo = document.getElementById("vehiculo").value;
  const chapa = document.getElementById("chapa").value;
  const mecanico = document.getElementById("mecanico").value;
  const fecha = document.getElementById("fecha").value;
  const factura = document.getElementById("factura").value;

  // Items
  const items = [];
  document.querySelectorAll("#tabla-servicios tbody tr").forEach(r => {
    items.push({
      codigo: r.querySelector(".codigo")?.value || "",
      cantidad: Number(r.querySelector(".cantidad")?.value || 0),
      descripcion: r.querySelector(".descripcion")?.value || "",
      precio: Number(r.querySelector(".precio")?.value || 0)
    });
  });

  // Servicios realizados
  const servicios = [];
  document.querySelectorAll("#tabla-servicios-realizados tbody tr").forEach(r => {
    servicios.push({
      servicio: r.querySelector(".servicio-realizado")?.value || "",
      monto: Number(r.querySelector(".monto-servicio-realizado")?.value || 0)
    });
  });

  // Totales
  const monto_total = Number(document.getElementById("total-general").textContent || 0);
  const monto_servicios = Number(document.getElementById("montoServicio").textContent || 0);
  const monto_items = monto_total;
  const diferencia = Number(document.getElementById("diferencia").textContent || 0);

  return {
    cliente,          // 👈 IMPORTANTE
    ruc,
    vehiculo,
    chapa,
    mecanico,
    fecha,
    factura,
    monto_total,
    monto_servicios,
    monto_items,
    diferencia,
    servicios,
    items
  };
}

async function guardarHistorial() {
  try {
    const nuevoControl = recolectarDatos();

    const res = await fetch(`${API_URL}/api/insertControl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoControl)
    });

    const data = await res.json();
    mostrarMensaje(data.mensaje);

    mostrarHistorial();

  } catch (err) {
    console.error("Error al guardar:", err);
    mostrarMensaje("Error al guardar control ❌");
  }
}

/* ===========================
   Historial
=========================== */

async function mostrarHistorial() {
  try {
    const res = await fetch(`${API_URL}/api/historial`);
    HISTORIAL_GLOBAL = await res.json(); // guardamos todo en memoria

    renderHistorial(HISTORIAL_GLOBAL); // mostramos todo
  } catch (err) {
    console.error("Error al cargar historial:", err);
    mostrarMensaje("Error al cargar historial ❌");
  }
}



async function cargarHistorial(id) {
  try {
    const res = await fetch(`${API_URL}/api/historial`);
    const historial = await res.json();

    const control = historial.find(c => c.id === id);

    if (!control) {
      mostrarMensaje("Control no encontrado ❌");
      return;
    }

    // CARGA DE DATOS
    document.getElementById("fecha").value = control.fecha || "";
    document.getElementById("cliente").value = control.cliente || "";
    document.getElementById("vehiculo").value = control.vehiculo || "";
    document.getElementById("chapa").value = control.chapa || "";
    document.getElementById("mecanico").value = control.mecanico || "";
    document.getElementById("factura").value = control.factura || "";

    // Servicios realizados
    const tbodyServ = document.querySelector("#tabla-servicios-realizados tbody");
    tbodyServ.innerHTML = "";
    if (control.serviciosRealizados?.length) {
      control.serviciosRealizados.forEach(s =>
        agregarServicioRealizado(s.servicio, s.monto)
      );
    } else {
      agregarServicioRealizado();
    }

    // Items
    const tbodyItems = document.querySelector("#tabla-servicios tbody");
    tbodyItems.innerHTML = "";
    if (control.items?.length) {
      control.items.forEach(i =>
        agregarFila(i.codigo, i.cantidad, i.descripcion, i.precio)
      );
    } else {
      agregarFila();
    }

    calcularTotales();
    mostrarMensaje(`Control de ${control.cliente} cargado ✅`);

  } catch (err) {
    console.error(err);
    mostrarMensaje("Error al cargar control ❌");
  }
}


async function eliminarHistorial(id, cliente) {
  mostrarConfirmacion(
    `¿Estás seguro que quieres eliminar los datos de ${cliente}? Esta acción es irreversible.`,
    async () => {
      try {
        await fetch(`${API_URL}/api/eliminar/${id}`, { method: "DELETE" });
        mostrarHistorial();
        mostrarMensaje(`Control de ${cliente} eliminado ✅`);
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  );
}

/* ===========================
   Extras UI
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

  btnCancelar.onclick = () => {
    confirmBox.classList.remove("show");
  };
}

/* ===========================
   Botón para ir a BDD
=========================== */
function irABDD() {
  window.location.href = "bdd.html";
}


let controlesMemoria = []; // Aquí guardamos los controles cargados desde el backend

function renderHistorial(lista) {
  const historialLista = document.getElementById("historial-lista");
  historialLista.innerHTML = "";

  if (!lista || lista.length === 0) {
    historialLista.innerHTML = "<p>No hay controles guardados</p>";
    return;
  }

  lista.forEach(control => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("historial-item");

    itemDiv.innerHTML = `
      <p><strong>Fecha:</strong> ${control.fecha || "N/A"}</p>
      <p><strong>Cliente:</strong> ${control.cliente || "N/A"}</p>
      <p><strong>Vehículo:</strong> ${control.vehiculo || "N/A"} - ${control.chapa || ""}</p>

      <div class="no-print">
        <button onclick="cargarHistorial(${control.id})">Cargar</button>
      </div>
    `;

    historialLista.appendChild(itemDiv);
  });
}


// Función de filtrado
function filtrarHistorial() {
  const clienteBuscado = document.getElementById("buscar-cliente").value.toLowerCase();
  const vehiculoBuscado = document.getElementById("buscar-vehiculo").value.toLowerCase();
  const fechaBuscada = document.getElementById("buscar-fecha").value;

  const filtrado = controlesMemoria.filter(c => {
    const coincideCliente = c.cliente?.toLowerCase().includes(clienteBuscado) || false;
    const coincideVehiculo = c.vehiculo?.toLowerCase().includes(vehiculoBuscado) || false;
    const coincideFecha = fechaBuscada ? c.fecha?.startsWith(fechaBuscada) : true;
    return coincideCliente && coincideVehiculo && coincideFecha;
  });

  renderizarHistorial(filtrado);
}

// Eventos de los filtros
document.getElementById("buscar-cliente").addEventListener("input", filtrarHistorial);
document.getElementById("buscar-vehiculo").addEventListener("input", filtrarHistorial);
document.getElementById("buscar-fecha").addEventListener("change", filtrarHistorial);
