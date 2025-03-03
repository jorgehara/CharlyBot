import { addKeyword } from "@builderbot/bot";
import { formFlow } from "./form.flow.js";

const flowAniversario97 = addKeyword("1")
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


  export {
    flowAniversario97
};
