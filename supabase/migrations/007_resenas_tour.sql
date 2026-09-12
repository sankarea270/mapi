-- ═══════════════════════════════════════════════════════════════════════
--  Las reseñas apuntaban a tours que no existen
-- ═══════════════════════════════════════════════════════════════════════
--
--  Cada reseña guarda en `tour_slug` la ficha del catálogo de la que habla,
--  y el panel ya pedía ese dato («tour al que se refiere»). Pero no se
--  pintaba en ninguna parte, así que nadie notó que cinco de las seis
--  señalaban a slugs inexistentes: la opinión salía flotando, sin decir de
--  qué viaje hablaba.
--
--  Ahora la ficha se enseña bajo cada opinión. Quien la pinta comprueba
--  antes que el slug resuelva —si no, sale sin enlace en vez de con uno
--  roto—, así que sin esta corrección cinco de las seis se quedan mudas.
--
--  Solo se corrige lo que la propia reseña nombra sin lugar a dudas y que
--  encaja con UNA entrada del catálogo. Se comprueba en el WHERE para que
--  volver a ejecutarlo no haga nada.

-- «Hicimos el circuito del Sur del Perú» → es un paquete, no un tour.
update public.reviews set tour_slug = 'sur-del-peru'
 where tour_slug = 'sur-del-peru-clasico';

-- «El tour por la selva de Iquitos» → único tour de Iquitos del catálogo.
update public.reviews set tour_slug = 'iquitos-amazon'
 where tour_slug = 'amazonia-iquitos-clasico';

-- «Una experiencia de lujo en el Cañón del Colca» → así se llama la ficha.
update public.reviews set tour_slug = 'colca-canyon'
 where tour_slug = 'colca-full-day';

-- El mismo tour con el slug al revés.
update public.reviews set tour_slug = 'city-tour-cusco'
 where tour_slug = 'cusco-city-tour';

--  Queda una a propósito: la de Sarah Johnson dice «el tour al Valle
--  Sagrado con la experiencia gastronómica», y en el catálogo eso encaja
--  con más de un tour. Elegir uno a ojo sería atribuirle a alguien un viaje
--  que no se sabe si hizo. Se decide desde el panel, en su campo «tour al
--  que se refiere»; hasta entonces su opinión sale sin enlace, que es
--  correcto.

-- Para comprobar cómo quedó:
--   select author, tour_slug from public.reviews order by sort_order;
