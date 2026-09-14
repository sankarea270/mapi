/*
 * Datos legales de la empresa.
 *
 * Una sola fuente para la página «Nosotros», la política de privacidad y
 * los términos. Antes vivían escritos dentro del componente de «Nosotros»,
 * y los textos legales tenían los suyos propios —con otro dominio y otros
 * proveedores—: dos versiones de los mismos datos acaban siempre diciendo
 * cosas distintas, y en un documento legal eso es un problema.
 */
export const empresa = {
  razonSocial: "MAPI TRAVELS TOUR OPERATOR E.I.R.L.",
  ruc: "20491103753",
  actividad: "Agencia de viajes y operador turístico",
  licenciaFuncionamiento: "002059-2012",
  certificadoAutorizacion: "301-2012",
  domicilio: "Av. El Sol 123, Cusco - Perú",
  ciudad: "Cusco",
} as const;
