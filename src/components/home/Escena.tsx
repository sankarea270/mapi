import { cn } from "@/lib/utils";

/**
 * Sección clavada.
 *
 * El bloque se queda pegado arriba mientras se recorre su pista, de modo
 * que las animaciones de dentro suceden con la sección quieta en pantalla.
 * Es lo que hace "Diseñado en Cusco" y lo que se pidió para el resto.
 *
 * Tres detalles que deciden si esto funciona o rompe la página:
 *
 *  · `min-h-dvh` y NO `h-dvh`. Con altura fija, un bloque más alto que la
 *    ventana —las cuatro razones en un portátil bajo, por ejemplo— quedaría
 *    cortado sin aviso. Con altura mínima, si no cabe simplemente crece y
 *    se recorre como siempre: se pierde el clavado, no el contenido.
 *
 *  · Sin `overflow-hidden`. Un ancestro con overflow oculto se convierte en
 *    contenedor de scroll, y entonces `animation-timeline: view()` mide el
 *    avance contra esa caja, que no se desplaza nunca: las animaciones de
 *    dentro se quedarían congeladas. Ya pasó una vez.
 *
 *  · El fondo va en la pista, no solo en la sección. La sección ocupa lo
 *    que ocupe su contenido y queda centrada; sin fondo en la pista se
 *    verían franjas del color del cuerpo por arriba y por abajo.
 *
 * Coste: cada sección clavada consume el alto de su pista en scroll. Con
 * 180vh, una portada de cinco bloques clavados pide unas nueve pantallas
 * de rueda. Es el precio del efecto, y por eso `alto` es ajustable.
 */
export function Escena({
  children,
  fondo = "bg-white",
  alto = "180vh",
}: {
  children: React.ReactNode;
  fondo?: string;
  alto?: string;
}) {
  return (
    <div className={cn("relative", fondo)} style={{ height: alto }}>
      <div className="sticky top-0 flex min-h-dvh w-full items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
