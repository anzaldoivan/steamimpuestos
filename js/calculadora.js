let button = $("#btnMain");
let buttonReset = $("#btnReset");
let list = $("#list");
const corsAnywhere = "https://cors-anywhere.herokuapp.com/";
const dolarAPI = "https://api-dolar-argentina.herokuapp.com";
const dolarOficial = dolarAPI + "/api/dolaroficial";
let preciosCalculados = [];
let contenedor;

const saveLocal = (id, value) => {
  localStorage.setItem(id, value);
  preciosCalculados = JSON.parse(localStorage.getItem("productos"));
};

async function getDolarOficial() {
  const response = await fetch(corsAnywhere + dolarOficial, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }),
  });
  return response.json();
}

function calcularPorcentaje(valor) {
  if (valor == 0) return 1;
  valor = (100 + valor) / 100;
  return parseFloat(valor);
}

function calcularDescuento(valor) {
  if (valor == 0) return 1;
  valor /= 100;
  return parseFloat(valor);
}

function calcularImpuestos(base, descuento, IVA, impuestoPais, retencion) {
  descuento = calcularDescuento(descuento);
  impuestoPais = calcularPorcentaje(impuestoPais);
  retencion = calcularPorcentaje(retencion);
  let total = base * descuento * IVA * impuestoPais * retencion;
  console.log(
    `Calculo: ${base}*${descuento}*${IVA}*${impuestoPais}*${retencion} = ${total}`
  );
  return total;
}

function pedirEntrada(mensaje, valorDefault) {
  let valor = prompt(mensaje);
  valor = parseInt(valor);
  if (!Number.isInteger(valor)) valor = valorDefault;
  return valor;
}

async function calculate() {
  let price = Number(document.getElementById("price").value);
  let discount = Number(document.getElementById("discount").value);
  let iva = calcularPorcentaje(Number(document.getElementById("iva").value));
  let taxpais = Number(document.getElementById("taxpais").value);
  let taxretenciones = Number(document.getElementById("taxretenciones").value);
  let dolarofi = await getDolarOficial();
  let ID = Number(preciosCalculados.length) + 1;
  producto = {
    ID: ID,
    precioBase: price,
    descuento: discount,
    IVA: iva,
    impuestoPais: taxpais,
    retencion: taxretenciones,
    total: calcularImpuestos(price, discount, iva, taxpais, taxretenciones),
    importe: (price * iva) / dolarofi.venta,
  };
  preciosCalculados.push(producto);
  console.log(preciosCalculados);
  saveLocal("productos", JSON.stringify(preciosCalculados));
}

button.click(async function () {
  contenedor = document.createElement("div");
  console.log("Click");
  await calculate();
  console.log(JSON.parse(localStorage.getItem("productos")));
  modificarContenedor(contenedor);
});

buttonReset.click(function () {
  removeLastElement();
});

function modificarContenedor() {
  productos = JSON.parse(localStorage.getItem("productos"));
  let last = Object.keys(productos).length;
  list.append(
    `<div id="${producto.ID}"><h3>Producto Calculado #${producto.ID}</h3>
                          <p> Precio Base: ${producto.precioBase}</p>
                          <p>  Descuento: ${producto.descuento}</p>
                          <p> Importe en Resumen: ${producto.importe.toFixed(
                            2
                          )} USD</p>
                          <b> Precio Total: ${producto.total.toFixed(2)}</b>
                          </div>`
  );
  $(`#${last}`).hide().fadeIn("slow");
}

function removeLastElement() {
  productos = JSON.parse(localStorage.getItem("productos"));
  let last = Object.keys(productos).length;
  console.log(productos);
  console.log(preciosCalculados);
  $(`#${last}`).fadeOut("slow", function () {
    //Cuando termina de ocultarse el elemento lo mostramos nuevamente
    $(`#${last}`).remove();
  });
  preciosCalculados.pop();
  saveLocal("productos", JSON.stringify(preciosCalculados));
}
