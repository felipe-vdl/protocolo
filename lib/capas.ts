import { Capa } from "@prisma/client";
import { addHours, format } from "date-fns";

export function printCapa(capa: Capa) {
  let win = window.open();
  win.document.write(`
            <html>
              <head><title>Capa</title></head>
              <body style="margin: 0; border: 2px solid black; padding: 3rem 5rem; display: flex; flex-direction: column; justify-content: flex-start; font-family: Arial, Helvetica, sans-serif;">
                <p style="margin: 0.5rem; margin-left: 0; text-align: start; font-size: 14px;"><b>PROTOCOLO N°:</b> <span>${
                  capa.num_protocolo
                }</span></p>
                <p style="margin: 0.5rem; margin-left: 0; text-align: start; font-size: 14px;"><b>DISTRIBUIÇÃO:</b> <span>${format(
                  addHours(new Date(capa.distribuicao), 3),
                  "dd/MM/yyyy"
                )}</span></p>
                <p style="margin-top: 2rem; text-align: start; font-size: 24px; font-weight: bold; align-self:center;">PREFEITURA MUNICIPAL DE MESQUITA</p>
                <img src="" alt="Logo" width="181" height="181" style="align-self: center; margin-top: 0.25rem; margin-bottom: 5rem;">
                <p style="margin: 1rem; padding: 0.25rem 0.5rem; width: fit-content; margin-inline: auto; border: 1px solid black; text-align: start; font-size: 14px;"><b>VOLUME:</b> <span>${
                  capa.volume
                }</span></p>
                  <p style="margin: 1rem; padding: 0.25rem; width: 100%; margin-inline: auto; border: 1px solid black; padding-left: 0.5rem; text-align: start; font-size: 14px;"><b>REQUERENTE:</b> <span>${
                    capa.requerente
                  }</span></p>
                <p style="margin: 1rem; padding: 0.25rem; width: 100%; margin-inline: auto; border: 1px solid black; padding-left: 0.5rem; text-align: start; font-size: 14px;"><b>ASSUNTO:</b> <span>${
                  capa.assunto
                }</span></p>
                <p style="margin: 1rem; padding: 0.25rem; width: 100%; margin-inline: auto; border: 1px solid black; padding-left: 0.5rem; text-align: start; font-size: 14px;"><b>OBSERVAÇÃO:</b> <span>${
                  capa.observacao
                }</span></p>
                <script>
                  const img = new Image();
                  img.src = "/logo-mesquita192.png";
                  document.querySelector("img").src = img.src;
                  img.onload = () => {
                    window.print();
                    
                  };
                </script>
              </body>
            </html>
          `);
}
