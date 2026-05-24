const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using the service role key on the backend when available.
// This is required if row-level security (RLS) is enabled for server-side inserts/updates.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables: SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: Server is using SUPABASE_ANON_KEY instead of SUPABASE_SERVICE_ROLE_KEY. Backend writes and authenticated row access may fail under row-level security.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
