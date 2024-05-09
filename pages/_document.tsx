import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-br" className="dark">
      <Head />
      <body>
        <div id="modal" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
