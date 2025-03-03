import { addKeyword } from "@builderbot/bot";
import { formFlow } from "./form.flow.js";

const flowFiestaDelChivo1 = addKeyword("1")
.addAnswer(
  `🛒 𝗣𝗔𝗠𝗣𝗔 𝗗𝗘𝗟 𝗜𝗡𝗙𝗜𝗘𝗥𝗡𝗢 – 𝗣𝘂𝗻𝘁𝗼𝘀 𝗱𝗲 𝘃𝗲𝗻𝘁𝗮 𝗼𝗳𝗶𝗰𝗶𝗮𝗹𝗲𝘀:
  
  📍 *Dirección de Cultura* Alte. Brown e/ H. Yrigoyen y Güemes (Ex Oficina de Catastro)
  📞 Gladis García: 3644369747 
  📞 Karla Barraza: 3644124768
  
  📍 *Municipalidad de Pampa del Infierno*
  📞 Magalí Sosa: 3644566730 
  📞 Cinthia Espíndola: 3644628534
  📞 Patricia Alomo: 3644377552 
  📞 Ramiro Triantofilo: 3644617346
  📞 Betiana Garofalo: 3644563708 
  📞 Sandra Sosa: 3644362583
  📞 Mónica Moyano: 3644673961 
  📞 Nico Juárez: 3644822768
  📞 Ricardo Caro: 3644633602 
  📞 Silvia Trejo: 3644371845
  📞 Ariana Cabeza: 3644112744
  
  🎶 ¡Te esperamos para disfrutar del Festival Provincial del Chivo en Pampa del Infierno! 🐐`
    ).addAction(async (ctx, ctxFn) => {
      const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
      await ctxFn.gotoFlow(menuFlow);
    })

const flowFiestaDelChivo2 = addKeyword("2")
.addAnswer(
  `🔖 𝗣𝗨𝗡𝗧𝗢𝗦 𝗗𝗘 𝗩𝗘𝗡𝗧𝗔 𝗬 𝗖𝗢𝗡𝗧𝗔𝗖𝗧𝗢𝗦 𝗣𝗔𝗥𝗔 𝗘𝗡𝗧𝗥𝗔𝗗𝗔𝗦
  *SÁENZ PEÑA*
  📞 Gabriela Pucheta: 3644445089
  
  *CHARATA*
  📞 Juan Ignacio Escobedo: 3731527275
  
  *J. J. CASTELLI*
  📞 Radio Fan / Radio Norte / El Pórtico
  
  *MONTE QUEMADO Y LOS FRENTONES*
  📞 Gonzalo Triantofilo: 3644792182
  
  *MIRAFLORES*
  📞 Dalma Albornoz: 3644357269
  
  *CAMPO LARGO*
  📞 Paola Arguello: 3644575250
  
  *LAS BREÑAS*
  📞 Pedro Aballay: 3731546521
  
  🎶 ¡Te esperamos para disfrutar del Festival Provincial del Chivo en Pampa del Infierno! 🐐`
    )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowFiestaDelChivo3 = addKeyword("3")
  .addAnswer(
`📷*¡ATENCIÓN MEDIOS!*

📣 *Acreditación para Medios de Comunicación - Festival Folklórico Fiesta Provincial del Chivo*

El Festival Folklórico Provincial del Chivo se llevará a cabo del 10 al 12 de Octubre en Pampa del Infierno. Invitamos a los medios de comunicación a solicitar su acreditación para garantizar una cobertura efectiva y acceso a los eventos del festival.

✍ *Requisitos para la acreditación:*
-Nombre y apellido
-DNI
-Medio al cual representa
-Tarea a realizar
-Una foto (puede ser tomada con el teléfono)
-Teléfono de contacto
-Correo electrónico
🔹 *Beneficios de la acreditación*
-Acceso prioritario al área de prensa y entrevistas
-Espacio de prensa con Wi-Fi y puntos de carga
-Materiales promocionales e información exclusiva
🔸 *¿Cómo solicitar la acreditación?*
-Las solicitudes deben enviarse al 📞 3644 628585 o al correo electrónico: ✉️ joselpucheta@yahoo.com.ar.
*Plazo de recepción: hasta el jueves 10 de Octubre a las 12:00 horas.*
*Cada medio podrá acreditar hasta 2 personas.*

🎶 ¡Te esperamos para disfrutar del Festival Provincial del Chivo en Pampa del Infierno! 🐐`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowFiestaDelChivo4 = addKeyword("4")
  .addAnswer(
`🎉✨ ¡𝗦𝘂𝗺𝗮𝘁𝗲 𝗮 𝗹𝗮 𝗙𝗶𝗲𝘀𝘁𝗮 𝗣𝗿𝗼𝘃𝗶𝗻𝗰𝗶𝗮𝗹 𝗱𝗲𝗹 𝗖𝗵𝗶𝘃𝗼! ✨🎉

🕺 ¿Tenés un talento que compartir? ¿Querés ser parte de uno de los eventos folklóricos más grandes de la región? ¡Esta es tu oportunidad! 🎤

🎶 Participá en la Exposición y Remate Caprino, disfrutá de la Cacharpaya y cerrá con broche de oro junto a artistas de todo el país. 🌟 No te pierdas esta fiesta llena de tradición y cultura.

👉 𝗜𝗻𝘀𝗰𝗿𝗶𝗯𝗶𝘁𝗲 𝗮𝗵𝗼𝗿𝗮 𝗰𝗼𝗺𝗽𝗹𝗲𝘁𝗮𝗻𝗱𝗼 𝗲𝘀𝘁𝗲 𝗳𝗼𝗿𝗺𝘂𝗹𝗮𝗿𝗶𝗼: 
https://forms.gle/HWk2bvefQw6vt84y5

🐐 ¡Te esperamos para vivir una experiencia única en Pampa del Infierno! 
📲 Comunicate al +54 9 364 450-3807 (Ángel Ferreyra)
🔥 ¡Volvió el Festival Provincial del Chivo a Pampa del Infierno!👏

#FiestaDelChivo2024 
#Cacharpaya2024
#IntendenteGlendaSeifert
#PampaConVosyParaVos`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

  export {
  flowFiestaDelChivo1,
  flowFiestaDelChivo2,
  flowFiestaDelChivo3,
  flowFiestaDelChivo4,
};
