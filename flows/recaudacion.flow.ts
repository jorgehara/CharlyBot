import { addKeyword } from "@builderbot/bot";
import { formFlow } from "./form.flow";


const flowRecaudacion1 = addKeyword("1")
  .addAnswer(
   `🏡 *INMUEBLE Y SERVICIOS GENERALES* 🏡

⚠️ *En el caso de no aparecer dicho inmueble, se tendrá que solicitar ALTA DE INMUEBLE.* ⚠️

📅 *Fechas de pago:* 📅

1️⃣ *Pago 1er cuota Inmobiliario y Servicios Generales*
📅 Vto. 15/04/2025

2️⃣ *Pago 2da cuota Inmobiliario y Servicios Generales*
📅 Vto. 15/06/2025

3️⃣ *Pago 3ra cuota Inmobiliario y Servicios Generales*
📅 Vto. 15/08/2025

4️⃣ *Pago 4ta cuota Inmobiliario y Servicios Generales*
📅 Vto. 15/10/2025

5️⃣ *Pago 5ta cuota Inmobiliario y Servicios Generales*
📅 Vto. 15/12/2025

*Abonando el total del impuesto antes del vencimiento de la primer cuota, obtendrás un 10% de descuento.*`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowRecaudacion2 = addKeyword("2")
  .addAnswer(
  `🚗 *PATENTAMIENTO* 🚗

📄 *Para inscribir un vehículo:* 📄

- Fotocopia del Título del vehículo
- Fotocopia de la Factura de Compra (en el caso de que el vehículo haya sido comprado nuevo)
- Baja del municipio anterior (en el caso que el vehículo haya sido comprado usado)

📅 *Fechas de pago:* 📅

1️⃣ *Pago 1er cuota Patentamiento*
📅 Vto. 15/03/2025

2️⃣ *Pago 2da cuota Patentamiento*
📅 Vto. 15/05/2025

3️⃣ *Pago 3ra cuota Patentamiento*
📅 Vto. 15/07/2025

4️⃣ *Pago 4ta cuota Patentamiento*
📅 Vto. 15/09/2025

5️⃣ *Pago 5ta cuota Patentamiento*
📅 Vto. 15/11/2025

*Abonando el total del impuesto antes del vencimiento de la primer cuota, obtendrás un 10% de descuento.*`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowRecaudacion3 = addKeyword("3")
  .addAnswer(
   `⚰️ *CEMENTERIO* ⚰️

📜 *Para realizar trámites:* 📜

- Solicitar *ACTA DE DEFUNCIÓN* en el Registro Civil
- Solicitud de Inhumación: *$6.000*

📅 *Fechas de pago:* 📅

1️⃣ *Pago 1er cuota Cementerio*
📅 Vto. 15/04/2025

2️⃣ *Pago 2da cuota Cementerio*
📅 Vto. 15/07/2025

3️⃣ *Pago 3ra cuota Cementerio*
📅 Vto. 15/10/2025

4️⃣ *Pago 4ta cuota Cementerio*
📅 Vto. 15/12/2025

*Abonando el total del impuesto antes del vencimiento de la primer cuota, obtendrás un 10% de descuento.*`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowRecaudacion4 = addKeyword("4")
  .addAnswer(
   `🏢 *HABILITACIÓN COMERCIAL* 🏢

📋 *Requisitos:* 📋

- Libre de deuda del solicitante en concepto de todo rubro previsto en la Ordenanza Municipal
- Libre de deuda del local donde se desarrolla la actividad comercial
- Fotocopia del D.N.I de los dos frentes
- Constancia de Inscripción ante AFIP
- Constancia de Inscripción ante ATP
- Libreta Sanitaria (Personal de comercios habilitados para comestibles, carnicerías, verdulerías y heladerías)
- Nota de Solicitud de inscripción dirigida a la intendencia

💰 *Tarifas:* 💰

- Solicitud Habilitación Comercial: *$7.500*
- Por Certificado de Inscripción de Locales comerciales: *$5.250*
- Por Constancia de Cese de Actividad Comercial: *$5.250*

📅 *Fechas de pago:* 📅

1️⃣ *Pago 1er cuota Habilitación Comercial*
📅 Vto. 25/03/2025

2️⃣ *Pago 2da cuota Habilitación Comercial*
📅 Vto. 25/05/2025

3️⃣ *Pago 3ra cuota Habilitación Comercial*
📅 Vto. 25/07/2025

4️⃣ *Pago 4ta cuota Habilitación Comercial*
📅 Vto. 25/09/2025

5️⃣ *Pago 5ta cuota Habilitación Comercial*
📅 Vto. 25/11/2025

6️⃣ *Pago 6ta cuota Habilitación Comercial*
📅 Vto. 25/01/2026

*Abonando el total del impuesto antes del vencimiento de la primer cuota, obtendrás un 10% de descuento.*`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });
const flowRecaudacion5 = addKeyword("5") 
  .addAnswer(
    `📅 *FECHAS DE PAGOS COMERCIAL* 📅

1️⃣ *Pago 1er Bimestre (ENERO-FEBRERO) - INDUSTRIA Y COMERCIO*
(PAGO 1-10 MARZO)

2️⃣ *PAGO 2do Bimestre (MARZO-ABRIL) - INDUSTRIA Y COMERCIO*
(PAGO 1-10 MAYO)

3️⃣ *PAGO 3er Bimestre (MAYO-JUNIO) - INDUSTRIA Y COMERCIO*
(PAGO 1-10 JULIO)

4️⃣ *PAGO 4to Bimestre (JULIO-AGOSTO) - INDUSTRIA Y COMERCIO*
(PAGO 1-10 SEPTIEMBRE)

5️⃣ *PAGO 5to Bimestre (SEPTIEMBRE-OCTUBRE) - INDUSTRIA Y COMERCIO*
(PAGO 1-10 DICIEMBRE)

6️⃣ *Pago 6to Bimestre (NOVIEMBRE-DICIEMBRE) - INDUSTRIA Y COMERCIO*
(PAGO 1-10 ENERO)

*Abonando el total del impuesto antes del vencimiento de la primer cuota, obtendrás un 10% de descuento.*`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });
const flowRecaudacion6 = addKeyword("6") 
  .addAnswer(
    `🚗 *SOLICITUD/RENOVACIÓN PARA REGISTROS DE CONDUCTOR DE AUTOMOTORES* 🚗

📋 *Para solicitar carnet por primera vez:* 📋

- FORMULARIO (Rellenar en el médico)
- *FOTOCOPIA DEL D.N.I.*

🗓️ *La duración del Carnet completo es de 3 años. La renovación es cada Fecha de Cumpleaños.*

💵 *Tarifas para el año 2025:* 💵

- 🏍️ *Otorgamiento Cat. A,* para Motocicletas y Triciclos motorizados: *$2.700*
- 🚗 *Otorgamiento Cat. B,* para Automóviles, camionetas con acoplado de 750 Kg. o casa rodante: *$3.100*
- 🚚 *Otorgamiento Cat. C,* para Camiones sin acoplado incluye Cat. B: *$3.100*
- 🚌 *Otorgamiento Cat. D,* para Profesionales, serv. Transp. de pasajeros, emergencia y seguridad incluye Cat. B: *$4.200*
- 🚛 *Otorgamiento Cat. E,* para camiones artic. c/acoplado, maquinaria esp. no agrícola incluye Cat. B y C: *$4.200*
- 🚜 *Otorgamiento Cat. G,* para Tractores agrícolas y maquinarias esp. Agrícolas: *$4.200*

🔄 *Renovación para el año 2025:* 🔄

- *Registro de Conductor - Renovación Cat. A:* *$2.700*
- *Registro de Conductor - Renovación Cat. B, C:* *$4.000*
- *Registro de Conductor - Renovación Cat. D, E y G:* *$4.100*`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });
const flowRecaudacion7 = addKeyword("7") 
  .addAnswer(
    "🎭 *ESPECTÁCULOS PÚBLICOS* 🎭\n\n📄 *Requisito:* 📄\n\n- Presentar NOTA por duplicado dirigida al Intendente Municipal.\n\n 💸 Tasa abonada en Dirección de Recaudación."
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

  const flowRecaudacion8 = addKeyword("8") 
  .addAnswer(
    "💧 *REPARTO Y VENTA DE AGUA* 💧\n\n 🕔 *Horarios de venta de Agua*\n\n Lunes a Jueves desde las 7.00 a las 9.00hs.\n\n Solicita tu número de manera presencial. Se entregan 40 números diarios.\n\n💲 *Precio:* 1.000 litros de agua por $2.000.-\n\n"
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowRecaudacion9 = addKeyword("9") 
  .addAnswer(
    "📢 *Consultas, Sugerencias o Reclamos* 📢\n\n ✍¡Estamos aquí para ayudarte!\nDejaremos asentada su consulta, sugerencia o reclamo, luego de unas breves preguntas..."
  )
  .addAction(async (ctx, ctxFn) => {
    const formFlow = await import("./form.flow.js").then((mod) => mod.formFlow);
    await ctxFn.gotoFlow(formFlow);
  });

export {
  flowRecaudacion1,
  flowRecaudacion2,
  flowRecaudacion3,
  flowRecaudacion4,
  flowRecaudacion5,
  flowRecaudacion6,
  flowRecaudacion7,
  flowRecaudacion8,
  flowRecaudacion9,
};
