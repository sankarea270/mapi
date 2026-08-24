# Smoke test de Mapi Travels — verifica rutas x 3 idiomas + API
# Uso: npm run build && npm run start -- -p 3232
#      powershell -File scripts/smoke-test.ps1 -Port 3232
param([int]$Port = 3232)

$ProgressPreference = "SilentlyContinue"
$base = "http://localhost:$Port"

$routes = @(
  "", "/tours", "/tours/machu-picchu-clasico", "/tours/camino-inca-clasico",
  "/destinos", "/destinos/machu-picchu", "/destinos/colca",
  "/paquetes", "/paquetes/cusco-express", "/paquetes/peru-clasico",
  "/experiencias", "/experiencias/textileria", "/experiencias/gastronomia",
  "/guia", "/guia/como-llegar", "/guia/faq",
  "/contacto", "/reservar", "/reservas",
  "/legal/terminos", "/legal/privacidad"
)
$locales = @("", "/en", "/pt")
$nonLocalized = @("/robots.txt", "/sitemap.xml", "/api/tours", "/api/health")

$fail = 0
$bad = @()

foreach ($l in $locales) {
  foreach ($r in $routes) {
    $code = 0
    try { $code = (Invoke-WebRequest -Uri "$base$l$r" -UseBasicParsing -ErrorAction Stop).StatusCode }
    catch { $code = [int]$_.Exception.Response.StatusCode }
    if ($code -ne 200) { $fail++; $bad += "$l$r=$code" }
  }
}

foreach ($r in $nonLocalized) {
  $code = 0
  try { $code = (Invoke-WebRequest -Uri "$base$r" -UseBasicParsing -ErrorAction Stop).StatusCode }
  catch { $code = [int]$_.Exception.Response.StatusCode }
  if ($code -ne 200) { $fail++; $bad += "$r=$code" }
}

$total = $locales.Count * $routes.Count + $nonLocalized.Count
"OK=$($total - $fail) FAIL=$fail (total $total)"
$bad | ForEach-Object { "  FAIL: $_" }
if ($fail -eq 0) { "SMOKE TEST: PASSED" } else { "SMOKE TEST: FAILED"; exit 1 }