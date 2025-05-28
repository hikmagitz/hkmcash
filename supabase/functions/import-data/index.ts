import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided');
    }

    const data = JSON.parse(await file.text());

    if (data.transactions && Array.isArray(data.transactions)) {
      // Delete existing transactions
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insert new transactions
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(
          data.transactions.map((t: any) => ({
            ...t,
            user_id: user.id
          }))
        );

      if (insertError) throw insertError;
    }

    if (data.categories && Array.isArray(data.categories)) {
      // Delete existing categories
      const { error: deleteCatError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id);

      if (deleteCatError) throw deleteCatError;

      // Insert new categories
      const { error: insertCatError } = await supabase
        .from('categories')
        .insert(
          data.categories.map((c: any) => ({
            ...c,
            user_id: user.id
          }))
        );

      if (insertCatError) throw insertCatError;
    }

    if (data.enterpriseName) {
      const { error: settingsError } = await supabase
        .from('enterprise_settings')
        .upsert({
          user_id: user.id,
          name: data.enterpriseName
        })
        .eq('user_id', user.id);

      if (settingsError) throw settingsError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});