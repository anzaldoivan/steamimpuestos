let button = $("#btnMain");
let buttonReset = $("#btnReset");
let list = $("#list");
const dolarAPI = "https://api-dolar-argentina.herokuapp.com";
const dolarOficial = dolarAPI + "/api/dolaroficial";
let preciosCalculados = [];
let contenedor;

const saveLocal = (id, value) => {
  localStorage.setItem(id, value);
  preciosCalculados = JSON.parse(localStorage.getItem("productos"));
};

async function getDolarOficial() {
  const response = await fetch(dolarOficial);
  // waits until the request completes...
  console.log(response.json());
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
  IVA = calcularPorcentaje(IVA);
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

function calculate() {
  let price = Number(document.getElementById("price").value);
  let discount = Number(document.getElementById("discount").value);
  let iva = Number(document.getElementById("iva").value);
  let taxpais = Number(document.getElementById("taxpais").value);
  let taxretenciones = Number(document.getElementById("taxretenciones").value);
  let ID = Number(preciosCalculados.length) + 1;
  producto = {
    ID: ID,
    precioBase: price,
    descuento: discount,
    IVA: iva,
    impuestoPais: taxpais,
    retencion: taxretenciones,
    total: calcularImpuestos(price, discount, iva, taxpais, taxretenciones),
    importe: 0,
  };
  preciosCalculados.push(producto);
  console.log(preciosCalculados);
  saveLocal("productos", JSON.stringify(preciosCalculados));
}

button.click(function () {
  contenedor = document.createElement("div");
  console.log("Click");
  calculate();
  console.log(JSON.parse(localStorage.getItem("productos")));
  modificarContenedor(contenedor);
  getDolarOficial();
});

buttonReset.click(function () {
  removeLastElement();
});

function modificarContenedor() {
  productos = JSON.parse(localStorage.getItem("productos"));
  let last = Object.keys(productos).length;
  list.append(
    `<div id="${producto.ID}"><h3>Producto Calculado #${producto.ID}</h3>
                          <p> Precio Base: ${producto.precioBase}</h3>
                          <p>  Descuento: ${producto.descuento}</p>
                          <b> Precio Total: ${producto.total}</b></div>
                          <b> Importe en Resumen: ${producto.importe} USD</b></div>`
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
