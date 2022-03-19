let button = $("#btnMain");
let buttonReset = $("#btnReset");
let list = $("#list");
const corsProxy = "";
const dolarAPI = "https://api-dolar-argentina.herokuapp.com";
const dolarOficial = dolarAPI + "/api/dolaroficial";
const dolarTarjeta = dolarAPI + "/api/dolarturista";
const dolarBlue = dolarAPI + "/api/dolarblue";
let preciosCalculados = [];
let contenedor;

const saveLocal = (id, value) => {
  localStorage.setItem(id, value);
  preciosCalculados = JSON.parse(localStorage.getItem("productos"));
};

async function getDolar(tipoDolar) {
  try {
    const response = await fetch(corsProxy + tipoDolar, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }),
    });
    return response.json();
  } catch {
    console.log("Fetch failed. Returning fallback");
    let fallback;
    if (
      tipoDolar == "https://api-dolar-argentina.herokuapp.com/api/dolaroficial"
    )
      fallback = {
        fecha: "2022/03/18 22:58:45",
        compra: "108.93",
        venta: "114.93",
      };
    if (
      tipoDolar == "https://api-dolar-argentina.herokuapp.com/api/dolarturista"
    )
      fallback = {
        fecha: "2022/03/18 23:38:52",
        compra: "No cotiza",
        venta: "189.63",
      };

    if (tipoDolar == "https://api-dolar-argentina.herokuapp.com/api/dolarblue")
      fallback = {
        fecha: "2022/03/18 23:40:07",
        compra: "199.50",
        venta: "202.50",
      };
    return fallback;
  }
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
  let dolarofi = await getDolar(dolarOficial);
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

// Set Text
async function setText() {
  console.log(await getDolar(dolarOficial));
  const dolOfi = await getDolar(dolarOficial);
  const dolTar = await getDolar(dolarTarjeta);
  const dolBlue = await getDolar(dolarBlue);
  document.getElementById("dolOfi").textContent = `Venta: ${dolOfi.venta}`;
  document.getElementById("dolTar").textContent = `Venta: ${dolTar.venta}`;
  document.getElementById("dolBlue").textContent = `Venta: ${dolBlue.venta}`;
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

// Run on start
setText();

function modificarContenedor() {
  productos = JSON.parse(localStorage.getItem("productos"));
  let last = Object.keys(productos).length;
  list.append(
    `<div id="${producto.ID}" class="ProductText"><h3>Producto Calculado #${
      producto.ID
    }</h3>
                          <p> Precio Base: ${producto.precioBase}</p>
                          <p>  Descuento: ${producto.descuento}</p>
                          <p> Importe en Resumen: ${producto.importe.toFixed(
                            2
                          )} USD</p>
                          <b> Precio Total: ${producto.total.toFixed(2)}</b>
                          </div>`
  );
  $("#btnReset").prop("disabled", false);
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
  if (Object.keys(productos).length == 1) $("#btnReset").prop("disabled", true);
  saveLocal("productos", JSON.stringify(preciosCalculados));
}
