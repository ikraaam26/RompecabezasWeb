// src/app/api/delete-user/route.js o route.ts si usas TypeScript
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Falta el ID de usuario.' }), { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Eliminar de tu tabla personalizada
    const { error: userTableError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (userTableError) {
      console.error('Error eliminando de usuarios:', userTableError.message);
      return new Response(JSON.stringify({ error: 'Error eliminando del sistema interno.' }), {
        status: 500,
      });
    }

    // 2. Eliminar del sistema de autenticación
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error eliminando de auth.users:', authError.message);
      return new Response(JSON.stringify({ error: 'Error eliminando de la autenticación.' }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Error inesperado en /api/delete-user:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
  }
}
