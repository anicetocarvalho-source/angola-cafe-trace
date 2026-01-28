import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestUser {
  email: string;
  password: string;
  nome: string;
  role: string;
}

const testUsers: TestUser[] = [
  { email: "tecnico@teste.ao", password: "Teste123!", nome: "Técnico INCA", role: "tecnico_inca" },
  { email: "produtor@teste.ao", password: "Teste123!", nome: "Produtor Teste", role: "produtor" },
  { email: "cooperativa@teste.ao", password: "Teste123!", nome: "Cooperativa Teste", role: "cooperativa" },
  { email: "processador@teste.ao", password: "Teste123!", nome: "Processador Teste", role: "processador" },
  { email: "transportador@teste.ao", password: "Teste123!", nome: "Transportador Teste", role: "transportador" },
  { email: "exportador@teste.ao", password: "Teste123!", nome: "Exportador Teste", role: "exportador" },
  { email: "comprador@teste.ao", password: "Teste123!", nome: "Comprador Teste", role: "comprador" },
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role for user creation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create regular client to verify caller's role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check if caller is admin_inca
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin_inca')
      .single();

    if (roleError || !roleData) {
      console.log("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin_inca role required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Admin verified, creating test users...");

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const user of testUsers) {
      try {
        console.log(`Creating user: ${user.email}`);

        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === user.email);

        let userId: string;

        if (existingUser) {
          console.log(`User ${user.email} already exists, updating role...`);
          userId = existingUser.id;
        } else {
          // Create user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: { nome: user.nome }
          });

          if (createError) {
            console.error(`Error creating ${user.email}:`, createError);
            results.push({ email: user.email, success: false, error: createError.message });
            continue;
          }

          userId = newUser.user.id;
          console.log(`User created with ID: ${userId}`);

          // Update profile name
          await supabaseAdmin
            .from('profiles')
            .update({ nome: user.nome })
            .eq('id', userId);
        }

        // Check if role already exists
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role', user.role)
          .single();

        if (!existingRole) {
          // Assign role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: userId, role: user.role });

          if (roleError) {
            console.error(`Error assigning role for ${user.email}:`, roleError);
            results.push({ email: user.email, success: false, error: roleError.message });
            continue;
          }
        }

        results.push({ email: user.email, success: true });
        console.log(`Successfully set up ${user.email} with role ${user.role}`);

      } catch (err) {
        console.error(`Unexpected error for ${user.email}:`, err);
        results.push({ email: user.email, success: false, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Test users creation completed",
        results,
        credentials: testUsers.map(u => ({ email: u.email, password: u.password, role: u.role }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-test-users:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
