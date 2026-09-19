/**
 * Un bloque de datos estructurados (JSON-LD).
 *
 * `<` se escapa: el JSON va dentro de un <script> y una descripción con
 * «</script>» —sea de un dato del panel o de una reseña— cerraría la
 * etiqueta y dejaría el resto como HTML. Es el escape que recomienda la
 * propia documentación de React para este caso.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
