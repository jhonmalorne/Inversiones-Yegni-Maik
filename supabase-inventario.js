import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔑 Reemplaza esta clave por tu Publishable Key real
const SUPABASE_URL = "https://qhermvfgpvhnhxelqjip.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZwDBaEZUl_thCRqfmXTxyw_hDiMsXZS";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🧩 Leer inventario
async function cargarInventario() {
  const { data, error } = await supabase
    .from("inventario")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al cargar inventario:", error);
    return;
  }

  const tbody = document.getElementById("tabla-productos");
  if (!tbody) return;

  tbody.innerHTML = "";
  data.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre ?? ""}</td>
      <td>${p.categoria ?? ""}</td>
      <td>${p.stock ?? 0}</td>
      <td>${p.precio ?? ""}</td>
      <td>${p.ingresos ?? 0}</td>
      <td>${p.egresos ?? 0}</td>
      <td>${p.caracteristicas ?? ""}</td>
      <td>${p.ultimoPrecio ?? ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 🧩 Insertar en inventario
async function agregarInventario(datos) {
  const { error } = await supabase.from("inventario").insert([datos]);
  if (error) {
    console.error("Error al insertar inventario:", error);
    return false;
  }
  return true;
}

// 🧩 Insertar en historial
async function agregarHistorial(mov) {
  const { error } = await supabase.from("historial").insert([mov]);
  if (error) {
    console.error("Error al insertar historial:", error);
    return false;
  }
  return true;
}

// 🧩 Evento al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarInventario();

  // 📦 Formulario de ingreso
  const btnIngreso = document.getElementById("btnGuardarIngreso");
  if (btnIngreso) {
    btnIngreso.addEventListener("click", async () => {
      const datos = {
        nombre: document.getElementById("productoIngreso").value,
        categoria: document.getElementById("categoriaIngreso").value,
        stock: parseInt(document.getElementById("cantidadIngreso").value || "0"),
        precio: parseFloat(document.getElementById("precioIngreso").value || "0"),
        ingresos: parseInt(document.getElementById("cantidadIngreso").value || "0"),
        egresos: 0,
        caracteristicas: document.getElementById("caracteristicasIngreso").value,
        ultimoPrecio: parseFloat(document.getElementById("precioIngreso").value || "0"),
      };

      const okInv = await agregarInventario(datos);

      const mov = {
        fecha: new Date().toISOString(),
        tipo: "ingreso",
        producto: datos.nombre,
        categoria: datos.categoria,
        cantidad: datos.ingresos,
        precio: datos.precio,
        responsable: document.getElementById("responsableIngreso").value,
      };

      const okHist = await agregarHistorial(mov);

      if (okInv && okHist) {
        limpiarFormularioIngreso();
        cargarInventario();
      }
    });
  }

  // 📦 Formulario de egreso
  const btnEgreso = document.getElementById("btnGuardarEgreso");
  if (btnEgreso) {
    btnEgreso.addEventListener("click", async () => {
      const nombre = document.getElementById("productoIngreso").value; // o un campo específico si tienes
      const categoria = document.getElementById("categoriaIngreso").value;

      const datos = {
        nombre,
        categoria,
        stock: -parseInt(document.getElementById("cantidadEgreso").value || "0"),
        precio: parseFloat(document.getElementById("precioEgreso").value || "0"),
        ingresos: 0,
        egresos: parseInt(document.getElementById("cantidadEgreso").value || "0"),
        caracteristicas: "",
        ultimoPrecio: parseFloat(document.getElementById("precioEgreso").value || "0"),
      };

      const okInv = await agregarInventario(datos);

      const mov = {
        fecha: new Date().toISOString(),
        tipo: "egreso",
        producto: nombre,
        categoria,
        cantidad: datos.egresos,
        precio: datos.precio,
        responsable: document.getElementById("responsableEgreso").value,
      };

      const okHist = await agregarHistorial(mov);

      if (okInv && okHist) {
        limpiarFormularioEgreso();
        cargarInventario();
      }
    });
  }
});
