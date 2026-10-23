export interface MemoryItem {
  id: string;
  type: 'fact' | 'task' | 'decision' | 'commitment' | 'observation';
  content: string;
  evidence?: string;
  source_type: string;
  source_id?: string;
  timestamp: string;
  confidence: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MemoryQueryResult {
  query: string;
  answer: string;
  evidence_items: MemoryItem[];
  confidence: number;
  missing_context?: string;
}

export interface CommitmentItem {
  id: string;
  description: string;
  responsible_person?: string;
  deadline?: string;
  project_topic?: string;
  source_record_id?: string;
  source_timestamp?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  resolution_status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  draft_followup_message?: string;
  followup_status: 'none' | 'drafted' | 'confirmed' | 'sent';
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentItem {
  id: string;
  event_type: 'motion' | 'doorbell_ring' | 'package_delivery' | 'access_attempt' | 'unauthorized_entry';
  timestamp: string;
  source_device: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  assigned_owner?: string;
  actions_taken: Array<{ action: string; timestamp: string; by: string }>;
  resolution_status: 'open' | 'investigating' | 'remediated' | 'closed';
  source_references: Record<string, any>;
  audit_history: Array<{ action: string; timestamp: string; actor: string; details: string }>;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  name: string;
  instructions: string;
  duration_seconds: number;
  target_reps?: number;
  difficulty: string;
}

export interface WorkoutItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration_seconds: number;
  exercises: WorkoutExercise[];
  session_state: 'idle' | 'in_progress' | 'paused' | 'completed';
  current_exercise_index: number;
  time_elapsed: number;
  adaptations_applied: Array<{ action: string; exercise_index: number; timestamp: string; note?: string; feedback?: string }>;
  summary: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BeeStatus {
  cli_installed: boolean;
  version?: string;
  logged_in: boolean;
  api_endpoint: string;
  account_info?: any;
  error_message?: string;
  instructions: string;
}

export interface SystemStatus {
  app_name: string;
  engine_name: string;
  team_name: string;
  tagline: string;
  event: string;
  primary_track: string;
  version: string;
  database_status: string;
  aws_status: string;
  bee_status: string;
  ring_status: string;
  firetv_status: string;
  alexa_status: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: string;
  timestamp: string;
}
