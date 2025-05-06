const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Configura tu Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
