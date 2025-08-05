const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabase() {
  console.log('🔍 Diagnosing database structure...\n');

  try {
    // Check entries table structure
    console.log('📋 Checking entries table structure...');
    const { data: entriesColumns, error: entriesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'entries')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (entriesError) {
      console.error('Error checking entries table:', entriesError);
    } else {
      console.log('Entries table columns:');
      entriesColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Check forms table structure
    console.log('\n📋 Checking forms table structure...');
    const { data: formsColumns, error: formsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'forms')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (formsError) {
      console.error('Error checking forms table:', formsError);
    } else {
      console.log('Forms table columns:');
      formsColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Check if RLS is enabled
    console.log('\n🔒 Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_schema', 'public')
      .in('table_name', ['entries', 'forms']);

    if (rlsError) {
      console.error('Error checking RLS status:', rlsError);
    } else {
      console.log('RLS status:');
      rlsStatus.forEach(table => {
        console.log(`  - ${table.table_name}: RLS ${table.row_security ? 'ENABLED' : 'DISABLED'}`);
      });
    }

    // Try a simple insert test
    console.log('\n🧪 Testing simple insert...');
    const testEntry = {
      hospital_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      month_year: '2025-01-01',
      kwh_usage: 1000,
      water_usage_m3: 500,
      co2_emissions: 800,
      submitted: false,
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('entries')
      .insert([testEntry])
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      console.error('Error code:', insertError.code);
    } else {
      console.log('✅ Insert test successful:', insertResult);
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseDatabase().catch(console.error); 