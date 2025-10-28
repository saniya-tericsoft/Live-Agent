# Supabase Setup Guide

## ✅ Installation Complete

Supabase has been successfully integrated into your live-agent project!

## 📁 Files Created

1. **`.env.local`** - Environment variables with your Supabase credentials
2. **`utils/supabase.ts`** - Supabase client configuration
3. **`vite-env.d.ts`** - TypeScript definitions for environment variables

## 🔑 Environment Variables

Your Supabase credentials are stored in `.env.local`:

```
VITE_SUPABASE_URL=https://pzztdgjtqzzpqkzxgwrx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Important:** 
- In Vite projects, use `VITE_` prefix (not `REACT_APP_`)
- The `.env.local` file is git-ignored by default
- Restart your dev server after changing environment variables

## 📝 Usage Examples

### Basic Import

```typescript
import { supabase } from './utils/supabase';
```

### Example: Fetching Data

```typescript
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('your_table')
          .select('*');
        
        if (error) throw error;
        
        setData(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Example: Inserting Data

```typescript
async function saveInterview(interviewData) {
  const { data, error } = await supabase
    .from('interviews')
    .insert([
      {
        candidate_name: interviewData.candidateName,
        job_role: interviewData.jobRole,
        company: interviewData.company,
        overall_score: interviewData.overallScore,
        evaluation_summary: interviewData.evaluationSummary,
        created_at: new Date().toISOString(),
      }
    ])
    .select();

  if (error) {
    console.error('Error saving interview:', error);
    return null;
  }

  return data;
}
```

### Example: Real-time Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('interviews')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'interviews' },
      (payload) => {
        console.log('Change received!', payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## 🗄️ Suggested Database Tables

### For saving interview data:

```sql
-- Create interviews table
create table interviews (
  id uuid default uuid_generate_v4() primary key,
  candidate_name text,
  job_role text not null,
  company text not null,
  overall_score decimal(3,1),
  evaluation_summary text,
  transcripts jsonb,
  recording_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table interviews enable row level security;

-- Create policy for public access (adjust based on your needs)
create policy "Enable read access for all users" on interviews
  for select using (true);

create policy "Enable insert access for all users" on interviews
  for insert with check (true);
```

### For saving agent configurations:

```sql
-- Create agent_configs table
create table agent_configs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  company text not null,
  job_role text not null,
  custom_questions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table agent_configs enable row level security;

create policy "Enable all access for agent_configs" on agent_configs
  for all using (true);
```

## 🔗 Integration with Existing Features

### Save Interview Reports to Supabase

Update `handleEndSession` in `LiveAgentPlugin.tsx`:

```typescript
const handleEndSession = async () => {
  endSession();
  stopRecording();
  
  setIsGeneratingReport(true);
  
  try {
    const report = await generateInterviewEvaluation(
      transcripts,
      company || 'Company',
      jobRole || 'Position'
    );
    
    // Save to Supabase
    const { error } = await supabase
      .from('interviews')
      .insert([{
        candidate_name: report.candidateName,
        job_role: report.jobRole,
        company: report.company,
        overall_score: report.overallScore,
        evaluation_summary: report.evaluationSummary,
        transcripts: transcripts,
      }]);
    
    if (error) console.error('Error saving interview:', error);
    
    setInterviewReport(report);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsGeneratingReport(false);
  }
};
```

### Save Agent Configs to Supabase

Update Dashboard.tsx to persist agent configurations:

```typescript
const handleCreateAgent = async (agentData) => {
  const { data, error } = await supabase
    .from('agent_configs')
    .insert([agentData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating agent:', error);
    return;
  }
  
  setAgents(prev => [...prev, data]);
  setSelectedAgentId(data.id);
};
```

## 🚀 Next Steps

1. Create the database tables in your Supabase dashboard
2. Adjust Row Level Security policies based on your authentication needs
3. Test the integration with sample data
4. Consider adding authentication with Supabase Auth

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)

