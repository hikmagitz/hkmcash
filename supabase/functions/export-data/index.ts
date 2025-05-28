import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import * as XLSX from 'npm:xlsx@0.18.5';
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts';

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

    const { format, enterpriseName } = await req.json();

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    if (transactionsError) {
      throw transactionsError;
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (categoriesError) {
      throw categoriesError;
    }

    // Create a temporary directory for the export
    const tempDir = await Deno.makeTempDir();
    let filePath: string;
    let contentType: string;
    let fileName: string;

    if (format === 'json') {
      const data = {
        transactions,
        categories,
        enterpriseName,
      };

      fileName = `${enterpriseName || 'HikmaCash'}_export_${new Date().toISOString().split('T')[0]}.json`;
      filePath = join(tempDir, fileName);
      contentType = 'application/json';

      await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2));
    } else if (format === 'excel') {
      const transactionData = transactions.map((t: any) => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type,
        Category: t.category,
        Client: t.client || 'N/A',
        Description: t.description,
        Amount: t.amount,
      }));

      const wb = XLSX.utils.book_new();
      
      if (enterpriseName) {
        const infoSheet = XLSX.utils.aoa_to_sheet([
          ['Enterprise Name', enterpriseName],
          ['Export Date', new Date().toLocaleDateString()],
          [],
        ]);
        XLSX.utils.book_append_sheet(wb, infoSheet, 'Info');
      }

      const ws = XLSX.utils.json_to_sheet(transactionData);

      const colWidths = [
        { wch: 12 }, // Date
        { wch: 10 }, // Type
        { wch: 15 }, // Category
        { wch: 20 }, // Client
        { wch: 30 }, // Description
        { wch: 12 }, // Amount
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      fileName = `${enterpriseName || 'HikmaCash'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      filePath = join(tempDir, fileName);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      XLSX.writeFile(wb, filePath);
    } else {
      throw new Error('Invalid format specified');
    }

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exports')
      .upload(`${user.id}/${fileName}`, await Deno.readFile(filePath), {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get a signed URL for the uploaded file
    const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
      .from('exports')
      .createSignedUrl(`${user.id}/${fileName}`, 300); // URL expires in 5 minutes

    if (signedUrlError) {
      throw signedUrlError;
    }

    // Clean up the temporary file
    await Deno.remove(filePath);
    await Deno.remove(tempDir);

    return new Response(JSON.stringify({ downloadUrl: signedUrl }), {
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