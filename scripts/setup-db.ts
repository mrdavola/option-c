import { neon } from "@neondatabase/serverless"
import "dotenv/config"

const sql = neon(process.env.DATABASE_URL!)

async function setup() {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS student_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      standard_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'unlocked')),
      unlocked_at TIMESTAMPTZ,
      chat_history JSONB DEFAULT '[]',
      criteria_met JSONB DEFAULT '{"playable": false, "authentic": false, "essential": false}',
      game_submission TEXT,
      UNIQUE(student_id, standard_id)
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id)
  `

  console.log("Database schema created successfully")
}

setup().catch(console.error)
