const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEntriesTable() {
  console.log('🔍 Testing entries table structure...\n');

  try {
    // Try to insert a test entry with all the new fields
    const testEntry = {
      hospital_id: 'test-hospital-id',
      user_id: 'test-user-id',
      month_year: '2025-01-01',
      kwh_usage: 1000,
      water_usage_m3: 500,
      co2_emissions: 800,
      waste_generated: 200,
      recycling_rate: 75.5,
      renewable_energy_usage: 300,
      paper_usage: 50,
      chemical_usage: 25,
      submitted: false,
    };

    console.log('Attempting to insert test entry with all fields...');
    const { data, error } = await supabase
      .from('entries')
      .insert([testEntry])
      .select();

    if (error) {
      console.error('❌ Error inserting test entry:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error code:', error.code);
    } else {
      console.log('✅ Successfully inserted test entry:', data);
    }

    // Check table structure
    console.log('\n📋 Checking table structure...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'entries')
      .eq('table_schema', 'public');

    if (columnError) {
      console.error('Error checking table structure:', columnError);
    } else {
      console.log('Entries table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEntriesTable().catch(console.error); 