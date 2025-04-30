import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const { userId } = await request.json();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Eliminar de la tabla personalizada
  const { error: userTableError } = await supabaseAdmin
    .from('usuarios')
    .delete()
    .eq('id', userId);

  if (userTableError) {
    return new Response(JSON.stringify({ error: userTableError.message }), {
      status: 500,
    });
  }

  // Eliminar del sistema de autenticación
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
