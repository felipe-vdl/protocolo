import { Capa } from "@prisma/client";

export function printCapa(capa: Capa) {
  let win = window.open();
  win.document.write(`
            <html>
              <head><title>Capa</title></head>
              <body style="margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: flex-start; font-family: Arial, Helvetica, sans-serif;">
                <p style="margin: 0.5rem; margin-left: 3rem; text-align: start; font-size: 16px;"><b>PROTOCOLO N°:</b> <span>${
                  capa.num_protocolo
                }</span></p>
                <p style="margin: 0.5rem; margin-left: 3rem; text-align: start; font-size: 16px;"><b>DISTRIBUIÇÃO:</b> <span>${new Date(
                  capa.distribuicao
                ).toLocaleDateString("pt-br")}</span></p>
                <p style="margin-top: 2rem; text-align: start; font-size: 24px; font-weight: bold; align-self:center;">PREFEITURA MUNICIPAL DE MESQUITA</p>
                <img src="" alt="Logo" width="128" height="128" style="align-self: center; margin-top: 0.25rem; margin-bottom: 5rem;">
                <p style="margin: 1rem; border: 1px solid black; padding: 1rem; padding-top: 0.5rem; padding-left: 0.5rem; text-align: start; font-size: 16px;"><b>VOLUME:</b> <span>${
                  capa.volume
                }</span></p>
                  <p style="margin: 1rem; border: 1px solid black; padding: 1rem; padding-top: 0.5rem; padding-left: 0.5rem; text-align: start; font-size: 16px;"><b>REQUERENTE:</b> <span>${
                    capa.requerente
                  }</span></p>
                <p style="margin: 1rem; border: 1px solid black; padding: 1rem; padding-top: 0.5rem; padding-left: 0.5rem; text-align: start; font-size: 16px;"><b>ASSUNTO:</b> <span>${
                  capa.assunto
                }</span></p>
                <p style="margin: 1rem; border: 1px solid black; padding: 1rem; padding-top: 0.5rem; padding-left: 0.5rem; text-align: start; font-size: 16px;"><b>OBSERVAÇÃO:</b> <span>${
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
