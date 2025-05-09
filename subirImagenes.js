const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Configura tu Supabase
const supabase = createClient(
  "https://nipgqvjtsxdytuwlbain.supabase.co",  // ← Sustituye por tu URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcGdxdmp0c3hkeXR1d2xiYWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNTQ0OTAsImV4cCI6MjA1OTkzMDQ5MH0.zORhG2XBy05q8BAvWdi57QOhIt5eWxbqABu9DdBwaVY"                // ← Sustituye por tu clave
);

const carpetaImagenes = path.join(__dirname, "public/imagenes");

(async () => {
  const archivos = fs.readdirSync(carpetaImagenes);

  for (const archivo of archivos) {
    const nombreSinExtension = path.parse(archivo).name;
    const urlRelativa = `/imagenes/${archivo}`;

    // Comprobar si ya existe esa ruta (imagenurl)
    const { data: existente, error: errorSelect } = await supabase
      .from("imagenesrompecabezas")
      .select("idimagen")
      .eq("imagenurl", urlRelativa)
      .maybeSingle();

    if (errorSelect) {
      console.error(`❌ Error al comprobar ${archivo}:`, errorSelect.message);
      continue;
    }

    if (existente) {
      console.log(`⚠️ Ya existe esta ruta: ${urlRelativa}`);
      continue;
    }

    // Insertar si no existe
    const { error: errorInsert } = await supabase
      .from("imagenesrompecabezas")
      .insert([
        {
          nombre: nombreSinExtension,
          imagenurl: urlRelativa,
        },
      ]);

    if (errorInsert) {
      console.error(`❌ Error al insertar ${archivo}:`, errorInsert.message);
    } else {
      console.log(`✅ Insertada: ${archivo}`);
    }
  }

  console.log("🎉 Proceso terminado.");
})();
