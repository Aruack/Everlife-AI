import {
  SystemStatus,
  BeeStatus,
  MemoryItem,
  MemoryQueryResult,
  CommitmentItem,
  IncidentItem,
  WorkoutItem,
  AuditLog
} from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Initial fallback mock data for GitHub Pages static hosting
const FALLBACK_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-seed-1',
    type: 'commitment',
    content: 'I will deliver the complete architecture diagram and README by Friday 5 PM.',
    evidence: '"I will deliver the complete architecture diagram and README by Friday 5 PM."',
    source_type: 'bee_wearable',
    source_id: 'conv-test-9901',
    timestamp: '2026-10-23T14:30:00Z',
    confidence: 0.95,
    approval_status: 'approved',
    approved_at: '2026-10-23T14:35:00Z',
    tags: ['extracted', 'commitment'],
    metadata: { source: 'Bee Audio Transcript' },
    created_at: '2026-10-23T14:30:00Z',
    updated_at: '2026-10-23T14:35:00Z'
  },
  {
    id: 'mem-seed-2',
    type: 'decision',
    content: 'We decided to submit Everlife AI for the Amazon Developer Hackathon 2026 under the Bee Wearable AI track.',
    evidence: '"We decided to submit Everlife AI for the Amazon Developer Hackathon 2026 under the Bee Wearable AI track."',
    source_type: 'bee_wearable',
    source_id: 'conv-test-9901',
    timestamp: '2026-10-23T14:30:00Z',
    confidence: 0.94,
    approval_status: 'approved',
    approved_at: '2026-10-23T14:35:00Z',
    tags: ['extracted', 'decision'],
    metadata: { source: 'Bee Audio Transcript' },
    created_at: '2026-10-23T14:30:00Z',
    updated_at: '2026-10-23T14:35:00Z'
  },
  {
    id: 'mem-seed-3',
    type: 'fact',
    content: 'The budget is allocated at 500 dollars for AWS credits.',
    evidence: '"The budget is allocated at 500 dollars for AWS credits."',
    source_type: 'bee_wearable',
    source_id: 'conv-test-9901',
    timestamp: '2026-10-23T14:30:00Z',
    confidence: 0.91,
    approval_status: 'pending',
    tags: ['extracted', 'fact'],
    metadata: { source: 'Bee Audio Transcript' },
    created_at: '2026-10-23T14:30:00Z',
    updated_at: '2026-10-23T14:30:00Z'
  }
];

const FALLBACK_COMMITMENTS: CommitmentItem[] = [
  {
    id: 'com-seed-1',
    description: 'Deliver the complete architecture diagram and README by Friday 5 PM.',
    responsible_person: 'Aryan Kumar',
    deadline: '2026-10-25',
    project_topic: 'Hackathon Submission',
    source_record_id: 'mem-seed-1',
    source_timestamp: '2026-10-23T14:30:00Z',
    approval_status: 'approved',
    resolution_status: 'open',
    draft_followup_message: null,
    followup_status: 'none',
    is_overdue: false,
    created_at: '2026-10-23T14:35:00Z',
    updated_at: '2026-10-23T14:35:00Z'
  },
  {
    id: 'com-seed-2',
    description: 'Verify Ring DoorstepOps camera webhook ingestion protocol.',
    responsible_person: 'Operations Team',
    deadline: '2026-10-27',
    project_topic: 'DoorstepOps',
    source_record_id: null,
    source_timestamp: '2026-10-23T15:00:00Z',
    approval_status: 'approved',
    resolution_status: 'in_progress',
    draft_followup_message: null,
    followup_status: 'none',
    is_overdue: false,
    created_at: '2026-10-23T15:00:00Z',
    updated_at: '2026-10-23T15:00:00Z'
  }
];

const FALLBACK_INCIDENTS: IncidentItem[] = [
  {
    id: 'inc-seed-1',
    event_type: 'package_delivery',
    timestamp: new Date().toISOString(),
    source_device: 'Ring Video Doorbell Pro (Front Entrance)',
    description: 'High-value hardware delivery detected at main office threshold. Requires verified custody handover.',
    priority: 'high',
    assigned_owner: 'Aryan Kumar (Operations Lead)',
    actions_taken: [
      { action: 'Motion alert triggered on front doorstep threshold', timestamp: new Date().toISOString(), by: 'Ring Telemetry Engine' }
    ],
    resolution_status: 'open',
    source_references: { camera_resolution: '1080p HDR', detection_confidence: 0.98 },
    audit_history: [
      { action: 'CASE_CREATED', timestamp: new Date().toISOString(), actor: 'DoorstepOps Engine', details: 'High-priority delivery flagged' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(`everlife_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStore<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`everlife_${key}`, JSON.stringify(val));
  } catch {}
}

export const api = {
  // System
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${BASE_URL}/system/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      app_name: 'Everlife AI',
      engine_name: 'Evermind',
      team_name: 'TEAM ORYVAN',
      tagline: 'Your life, connected. Your context, remembered.',
      event: 'Amazon Developer Hackathon 2026',
      primary_track: 'Bee Wearable AI',
      version: '1.0.0',
      database_status: 'Operational (SQLite Local Engine / Client Storage)',
      aws_status: 'Not Configured (Client Mode)',
      bee_status: 'Authentication Required',
      ring_status: 'Not Configured',
      firetv_status: 'Ready (Leanback Compliant)',
      alexa_status: 'Available'
    };
  },

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${BASE_URL}/system/audit-logs?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      {
        id: 'log-1',
        action: 'PLATFORM_INITIALIZED',
        entity_type: 'system',
        entity_id: 'everlife-core',
        details: JSON.stringify({ mode: 'Online Client UI', engine: 'Evermind' }),
        timestamp: new Date().toISOString()
      }
    ];
  },

  async getAwsStatus(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/system/aws/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      active_storage: 'SQLite (Primary Engine)',
      cloud_persistence: 'Not Configured',
      dynamodb_connected: false,
      s3_connected: false,
      region: 'us-east-1',
      message: 'Local SQLite engine is active. Configure AWS credentials in .env to enable DynamoDB mirroring.'
    };
  },

  // Bee Wearable AI
  async getBeeStatus(): Promise<BeeStatus> {
    try {
      const res = await fetch(`${BASE_URL}/bee/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      cli_installed: true,
      version: '@beeai/cli 0.9.0',
      logged_in: false,
      api_endpoint: 'https://app-api-developer.ce.bee.amazon.dev',
      instructions: 'To connect your physical Bee Wearable or Apple Watch:\n1. Open the Bee Wearable App.\n2. Navigate to Settings -> Tap version number 5 times to unlock Developer Mode.\n3. Run `bee login --qr` in your terminal or paste your developer token below.'
    };
  },

  async beeLogin(token: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/bee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, message: 'Developer session token saved.' };
  },

  async getBeeNow(): Promise<any> {
    const res = await fetch(`${BASE_URL}/bee/now`);
    if (!res.ok) throw new Error('Live Bee device not connected. Run `bee login` first.');
    return res.json();
  },

  async getBeeConversations(limit: number = 10): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/bee/conversations?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async triggerBeeSync(recentDays: number = 7): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/bee/sync?recent_days=${recentDays}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { output_dir: 'bee_data', exit_code: 0 };
  },

  async importBeeRecord(payload: any): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/bee/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {}
    // Client-side parser fallback for standalone demo
    const text = typeof payload === 'string' ? payload : (payload.utterances?.[0]?.text || payload.title || JSON.stringify(payload));
    const newCand: MemoryItem = {
      id: `mem-${Date.now()}`,
      type: text.toLowerCase().includes('will') ? 'commitment' : 'fact',
      content: text,
      evidence: `"${text}"`,
      source_type: 'bee_wearable',
      source_id: 'imported-context',
      timestamp: new Date().toISOString(),
      confidence: 0.92,
      approval_status: 'pending',
      tags: ['extracted'],
      metadata: { imported: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const current = getLocalStore<MemoryItem[]>('memories', FALLBACK_MEMORIES);
    setLocalStore('memories', [newCand, ...current]);
    return { success: true, candidates_extracted: 1, candidates: [newCand] };
  },

  // Evermind Memory
  async listMemories(status?: string, memType?: string): Promise<MemoryItem[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (memType) params.append('mem_type', memType);
      const res = await fetch(`${BASE_URL}/memories?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<MemoryItem[]>('memories', FALLBACK_MEMORIES);
    return items.filter(m => (!status || m.approval_status === status) && (!memType || m.type === memType));
  },

  async reviewMemory(memoryId: string, status: 'approved' | 'rejected', content?: string): Promise<MemoryItem> {
    try {
      const res = await fetch(`${BASE_URL}/memories/${memoryId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, content }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<MemoryItem[]>('memories', FALLBACK_MEMORIES);
    const target = items.find(m => m.id === memoryId);
    if (target) {
      target.approval_status = status;
      if (content) target.content = content;
      target.approved_at = status === 'approved' ? new Date().toISOString() : undefined;
      setLocalStore('memories', items);

      // If commitment approved, push to commitments store
      if (status === 'approved' && (target.type === 'commitment' || target.type === 'task')) {
        const coms = getLocalStore<CommitmentItem[]>('commitments', FALLBACK_COMMITMENTS);
        coms.unshift({
          id: `com-${Date.now()}`,
          description: target.content,
          project_topic: 'Bee Context',
          source_record_id: target.id,
          source_timestamp: target.timestamp,
          approval_status: 'approved',
          resolution_status: 'open',
          followup_status: 'none',
          is_overdue: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setLocalStore('commitments', coms);
      }
      return target;
    }
    throw new Error('Memory not found');
  },

  async queryMemories(query: string, topK: number = 5, onlyApproved: boolean = true): Promise<MemoryQueryResult> {
    try {
      const res = await fetch(`${BASE_URL}/memories/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: topK, only_approved: onlyApproved }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<MemoryItem[]>('memories', FALLBACK_MEMORIES).filter(m => !onlyApproved || m.approval_status === 'approved');
    const matched = items.filter(m => query.toLowerCase().split(' ').some(w => m.content.toLowerCase().includes(w)));
    const ev = matched.slice(0, topK);
    return {
      query,
      answer: ev.length > 0
        ? `Based on ${ev.length} verified evidence record(s) in Evermind:\n\n` + ev.map(m => `• ${m.content}`).join('\n') + `\n\nEvidence Citations:\n` + ev.map((m, i) => `[${i+1}] ${m.type.toUpperCase()}: ${m.content} (Source: ${m.source_type}, Recorded: ${m.timestamp})`).join('\n')
        : `I searched Evermind for '${query}', but found no verified memories matching your inquiry.`,
      evidence_items: ev,
      confidence: ev.length > 0 ? 0.9 : 0.1
    };
  },

  async deleteMemory(memoryId: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/memories/${memoryId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<MemoryItem[]>('memories', FALLBACK_MEMORIES).filter(m => m.id !== memoryId);
    setLocalStore('memories', items);
    return { success: true };
  },

  async exportData(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/memories/data/export`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      memories: getLocalStore('memories', FALLBACK_MEMORIES),
      commitments: getLocalStore('commitments', FALLBACK_COMMITMENTS),
      incidents: getLocalStore('incidents', FALLBACK_INCIDENTS),
      exported_at: new Date().toISOString()
    };
  },

  async wipeData(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/memories/data/wipe`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    localStorage.clear();
    return { deleted_memories: 3, deleted_commitments: 2 };
  },

  // LooseEnds Commitments
  async listCommitments(approvalStatus?: string, resolutionStatus?: string): Promise<CommitmentItem[]> {
    try {
      const params = new URLSearchParams();
      if (approvalStatus) params.append('approval_status', approvalStatus);
      if (resolutionStatus) params.append('resolution_status', resolutionStatus);
      const res = await fetch(`${BASE_URL}/commitments?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<CommitmentItem[]>('commitments', FALLBACK_COMMITMENTS);
    return items.filter(c => (!approvalStatus || c.approval_status === approvalStatus) && (!resolutionStatus || c.resolution_status === resolutionStatus));
  },

  async createCommitment(data: any): Promise<CommitmentItem> {
    try {
      const res = await fetch(`${BASE_URL}/commitments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}
    const newItem: CommitmentItem = {
      id: `com-${Date.now()}`,
      description: data.description,
      responsible_person: data.responsible_person,
      deadline: data.deadline,
      project_topic: data.project_topic || 'General',
      approval_status: 'approved',
      resolution_status: 'open',
      followup_status: 'none',
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const items = getLocalStore<CommitmentItem[]>('commitments', FALLBACK_COMMITMENTS);
    setLocalStore('commitments', [newItem, ...items]);
    return newItem;
  },

  async updateCommitment(id: string, data: any): Promise<CommitmentItem> {
    try {
      const res = await fetch(`${BASE_URL}/commitments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<CommitmentItem[]>('commitments', FALLBACK_COMMITMENTS);
    const item = items.find(c => c.id === id);
    if (item) {
      Object.assign(item, data);
      setLocalStore('commitments', items);
      return item;
    }
    throw new Error('Commitment not found');
  },

  async draftFollowup(id: string): Promise<CommitmentItem> {
    try {
      const res = await fetch(`${BASE_URL}/commitments/${id}/draft-followup`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return this.updateCommitment(id, {
      draft_followup_message: `Hi there,\n\nI wanted to follow up on our agreed commitment regarding your pending milestone. Could you provide a quick update on current progress?\n\nBest regards,\nEverlife AI / TEAM ORYVAN`,
      followup_status: 'drafted'
    });
  },

  async confirmSendFollowup(id: string): Promise<CommitmentItem> {
    try {
      const res = await fetch(`${BASE_URL}/commitments/${id}/confirm-send`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return this.updateCommitment(id, { followup_status: 'confirmed' });
  },

  async deleteCommitment(id: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/commitments/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<CommitmentItem[]>('commitments', FALLBACK_COMMITMENTS).filter(c => c.id !== id);
    setLocalStore('commitments', items);
    return { success: true };
  },

  // DoorstepOps Ring Incidents
  async getRingStatus(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/incidents/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      status: 'Not Configured',
      message: 'Ring Developer access requires an approved Amazon Ring Partner OAuth token. Configure RING_AUTH_TOKEN in environment to stream live device telemetry.',
      supported_events: ['motion', 'doorbell_ring', 'package_delivery', 'access_attempt', 'unauthorized_entry']
    };
  },

  async listIncidents(status?: string, priority?: string): Promise<IncidentItem[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      const res = await fetch(`${BASE_URL}/incidents?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<IncidentItem[]>('incidents', FALLBACK_INCIDENTS);
    return items.filter(i => (!status || i.resolution_status === status) && (!priority || i.priority === priority));
  },

  async createIncident(data: any): Promise<IncidentItem> {
    try {
      const res = await fetch(`${BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}
    const newItem: IncidentItem = {
      id: `inc-${Date.now()}`,
      event_type: data.event_type || 'motion',
      source_device: data.source_device,
      description: data.description,
      priority: data.priority || 'medium',
      assigned_owner: data.assigned_owner || 'Unassigned',
      timestamp: new Date().toISOString(),
      actions_taken: [],
      resolution_status: 'open',
      source_references: data.source_references || {},
      audit_history: [{ action: 'CASE_CREATED', timestamp: new Date().toISOString(), actor: 'DoorstepOps', details: data.description }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const items = getLocalStore<IncidentItem[]>('incidents', FALLBACK_INCIDENTS);
    setLocalStore('incidents', [newItem, ...items]);
    return newItem;
  },

  async updateIncident(id: string, data: any): Promise<IncidentItem> {
    try {
      const res = await fetch(`${BASE_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}
    const items = getLocalStore<IncidentItem[]>('incidents', FALLBACK_INCIDENTS);
    const item = items.find(i => i.id === id);
    if (item) {
      if (data.resolution_status) item.resolution_status = data.resolution_status;
      if (data.add_action) {
        item.actions_taken.push({
          action: data.add_action,
          timestamp: new Date().toISOString(),
          by: item.assigned_owner || 'Operator'
        });
      }
      setLocalStore('incidents', items);
      return item;
    }
    throw new Error('Incident not found');
  },

  // FormShift Fire TV Workouts
  async getFireTvStatus(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/workouts/firetv/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      platform: 'Amazon Fire TV (Fire OS / Leanback UI)',
      remote_compatible: true,
      supported_inputs: ['D-Pad Up', 'D-Pad Down', 'D-Pad Left', 'D-Pad Right', 'Select', 'Back', 'Play/Pause'],
      controller_profile: 'Standard Fire TV Voice Remote (Gen 3)',
      deployment_notice: 'FormShift is rendered with a high-contrast 10-foot Leanback interface optimized for Fire TV web app containers and browser packaging.'
    };
  },

  async getActiveWorkout(): Promise<WorkoutItem | null> {
    try {
      const res = await fetch(`${BASE_URL}/workouts/active`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async startWorkout(category: string = 'strength', difficulty: string = 'intermediate'): Promise<WorkoutItem> {
    try {
      const res = await fetch(`${BASE_URL}/workouts/start?category=${category}&difficulty=${difficulty}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return {
      id: `w-${Date.now()}`,
      title: `Adaptive ${category.toUpperCase()} Routine`,
      category,
      difficulty,
      duration_seconds: 180,
      exercises: [
        { name: 'Tempo Bodyweight Squats', instructions: '3s down, 1s hold at depth, explode up with glute engagement.', duration_seconds: 45, target_reps: 15, difficulty: 'intermediate' },
        { name: 'Controlled Push-Ups', instructions: 'Lower with full range of motion, elbows tracking at 45 degrees.', duration_seconds: 45, target_reps: 12, difficulty: 'intermediate' },
        { name: 'Hollow Body Isometric Hold', instructions: 'Press lower back into floor, extend arms and legs outward.', duration_seconds: 45, difficulty: 'intermediate' }
      ],
      session_state: 'in_progress',
      current_exercise_index: 0,
      time_elapsed: 0,
      adaptations_applied: [],
      summary: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  async adaptWorkout(id: string, action: string, feedback?: string): Promise<WorkoutItem> {
    try {
      const res = await fetch(`${BASE_URL}/workouts/${id}/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feedback_reason: feedback }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return this.startWorkout();
  },

  async advanceWorkout(id: string): Promise<WorkoutItem> {
    try {
      const res = await fetch(`${BASE_URL}/workouts/${id}/advance`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return this.startWorkout();
  },

  async completeWorkout(id: string): Promise<WorkoutItem> {
    try {
      const res = await fetch(`${BASE_URL}/workouts/${id}/complete`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    const w = await this.startWorkout();
    w.session_state = 'completed';
    w.summary = { estimated_calories: 135, exercises_completed: 3 };
    return w;
  },

  // Alexa+ Voice Integration
  async getAlexaStatus(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/alexa/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      status: 'Available',
      ready_for_voice_requests: true,
      supported_intents: ['GetEvermindMemoryIntent', 'SummarizeCommitmentsIntent', 'ReviewIncidentsIntent', 'StartFormShiftWorkoutIntent'],
      requirements: 'To link with your Amazon Echo or Alexa+ device:\n1. Register a Custom Skill in the Alexa Developer Console.\n2. Upload the Everlife AI Interaction Model JSON.\n3. Set HTTPS endpoint to your deployed webhook URL.'
    };
  },

  async getAlexaInteractionModel(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/alexa/interaction-model`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      interactionModel: {
        languageModel: {
          invocationName: 'everlife',
          intents: [
            { name: 'AMAZON.HelpIntent', samples: ['help'] },
            { name: 'GetEvermindMemoryIntent', slots: [{ name: 'Query', type: 'AMAZON.SearchQuery' }], samples: ['what did we decide about {Query}'] }
          ]
        }
      }
    };
  }
};
