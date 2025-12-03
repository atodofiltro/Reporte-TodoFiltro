const API_URL = "https://back-tff-production.up.railway.app";

async function cargarBDD() {
  try {
    const res = await fetch(`${API_URL}/api/historial`);
    const datos = await res.json();

    const tbodyControles = document.querySelector("#tabla-controles tbody");
    const tbodyServicios = document.querySelector("#tabla-servicios-detalle tbody");
    const tbodyItems = document.querySelector("#tabla-items-detalle tbody");

    tbodyControles.innerHTML = "";
    tbodyServicios.innerHTML = "";
    tbodyItems.innerHTML = "";

    datos.forEach((control, index) => {
      // Tabla principal de controles
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${control.fecha || "-"}</td>
        <td>${control.cliente || "-"}</td>
        <td>${control.ruc || "-"}</td>
        <td>${control.vehiculo || "-"}</td>
        <td>${control.chapa || "-"}</td>
        <td>${control.mecanico || "-"}</td>
        <td>${control.factura || "-"}</td>
        <td>${control.monto_items || 0}</td>
        <td>${control.monto_servicios || 0}</td>
        <td>${control.diferencia || 0}</td>
      `;
      tbodyControles.appendChild(tr);

      // Servicios por control
      if (control.servicios && control.servicios.length > 0) {
        control.servicios.forEach(s => {
          const trS = document.createElement("tr");
          trS.innerHTML = `
            <td>${index + 1}</td>
            <td>${s.servicio || "-"}</td>
            <td>${s.monto || 0}</td>
          `;
          tbodyServicios.appendChild(trS);
        });
      }

      // Items por control
      if (control.items && control.items.length > 0) {
        control.items.forEach(i => {
          const trI = document.createElement("tr");
          trI.innerHTML = `
            <td>${index + 1}</td>
            <td>${i.codigo || "-"}</td>
            <td>${i.cantidad || 0}</td>
            <td>${i.descripcion || "-"}</td>
            <td>${i.precio || 0}</td>
          `;
          tbodyItems.appendChild(trI);
        });
      }
    });

  } catch (err) {
    console.error("Error al cargar BDD:", err);
    alert("No se pudo cargar la base de datos ❌");
  }
}

// Ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", cargarBDD);
