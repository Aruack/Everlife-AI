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

const BASE_URL = '/api';

export const api = {
  // System
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${BASE_URL}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/system/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getAwsStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/system/aws/status`);
    if (!res.ok) throw new Error('Failed to fetch AWS status');
    return res.json();
  },

  // Bee Wearable AI
  async getBeeStatus(): Promise<BeeStatus> {
    const res = await fetch(`${BASE_URL}/bee/status`);
    if (!res.ok) throw new Error('Failed to fetch Bee status');
    return res.json();
  },

  async beeLogin(token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/bee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to authenticate Bee CLI');
    }
    return res.json();
  },

  async getBeeNow(): Promise<any> {
    const res = await fetch(`${BASE_URL}/bee/now`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to fetch live Bee record');
    }
    return res.json();
  },

  async getBeeConversations(limit: number = 10): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/bee/conversations?limit=${limit}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to fetch Bee conversations');
    }
    return res.json();
  },

  async triggerBeeSync(recentDays: number = 7): Promise<any> {
    const res = await fetch(`${BASE_URL}/bee/sync?recent_days=${recentDays}`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Bee sync failed');
    }
    return res.json();
  },

  async importBeeRecord(payload: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/bee/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to ingest record');
    }
    return res.json();
  },

  // Evermind Memory
  async listMemories(status?: string, memType?: string): Promise<MemoryItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (memType) params.append('mem_type', memType);
    const res = await fetch(`${BASE_URL}/memories?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },

  async reviewMemory(memoryId: string, status: 'approved' | 'rejected', content?: string): Promise<MemoryItem> {
    const res = await fetch(`${BASE_URL}/memories/${memoryId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, content }),
    });
    if (!res.ok) throw new Error('Failed to review memory');
    return res.json();
  },

  async queryMemories(query: string, topK: number = 5, onlyApproved: boolean = true): Promise<MemoryQueryResult> {
    const res = await fetch(`${BASE_URL}/memories/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK, only_approved: onlyApproved }),
    });
    if (!res.ok) throw new Error('Query failed');
    return res.json();
  },

  async deleteMemory(memoryId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/memories/${memoryId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete memory');
    return res.json();
  },

  async exportData(): Promise<any> {
    const res = await fetch(`${BASE_URL}/memories/data/export`);
    if (!res.ok) throw new Error('Failed to export data');
    return res.json();
  },

  async wipeData(): Promise<any> {
    const res = await fetch(`${BASE_URL}/memories/data/wipe`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to wipe data');
    return res.json();
  },

  // LooseEnds Commitments
  async listCommitments(approvalStatus?: string, resolutionStatus?: string): Promise<CommitmentItem[]> {
    const params = new URLSearchParams();
    if (approvalStatus) params.append('approval_status', approvalStatus);
    if (resolutionStatus) params.append('resolution_status', resolutionStatus);
    const res = await fetch(`${BASE_URL}/commitments?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch commitments');
    return res.json();
  },

  async createCommitment(data: any): Promise<CommitmentItem> {
    const res = await fetch(`${BASE_URL}/commitments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create commitment');
    return res.json();
  },

  async updateCommitment(id: string, data: any): Promise<CommitmentItem> {
    const res = await fetch(`${BASE_URL}/commitments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update commitment');
    return res.json();
  },

  async draftFollowup(id: string): Promise<CommitmentItem> {
    const res = await fetch(`${BASE_URL}/commitments/${id}/draft-followup`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to draft followup');
    return res.json();
  },

  async confirmSendFollowup(id: string): Promise<CommitmentItem> {
    const res = await fetch(`${BASE_URL}/commitments/${id}/confirm-send`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to confirm followup');
    return res.json();
  },

  async deleteCommitment(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/commitments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete commitment');
    return res.json();
  },

  // DoorstepOps Ring Incidents
  async getRingStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/incidents/status`);
    if (!res.ok) throw new Error('Failed to fetch Ring status');
    return res.json();
  },

  async listIncidents(status?: string, priority?: string): Promise<IncidentItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const res = await fetch(`${BASE_URL}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async createIncident(data: any): Promise<IncidentItem> {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  async updateIncident(id: string, data: any): Promise<IncidentItem> {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update incident');
    return res.json();
  },

  // FormShift Fire TV Workouts
  async getFireTvStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/workouts/firetv/status`);
    if (!res.ok) throw new Error('Failed to fetch Fire TV status');
    return res.json();
  },

  async getActiveWorkout(): Promise<WorkoutItem | null> {
    const res = await fetch(`${BASE_URL}/workouts/active`);
    if (!res.ok) return null;
    return res.json();
  },

  async startWorkout(category: string = 'strength', difficulty: string = 'intermediate'): Promise<WorkoutItem> {
    const res = await fetch(`${BASE_URL}/workouts/start?category=${category}&difficulty=${difficulty}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start workout');
    return res.json();
  },

  async adaptWorkout(id: string, action: string, feedback?: string): Promise<WorkoutItem> {
    const res = await fetch(`${BASE_URL}/workouts/${id}/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, feedback_reason: feedback }),
    });
    if (!res.ok) throw new Error('Failed to adapt workout');
    return res.json();
  },

  async advanceWorkout(id: string): Promise<WorkoutItem> {
    const res = await fetch(`${BASE_URL}/workouts/${id}/advance`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to advance workout');
    return res.json();
  },

  async completeWorkout(id: string): Promise<WorkoutItem> {
    const res = await fetch(`${BASE_URL}/workouts/${id}/complete`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to complete workout');
    return res.json();
  },

  // Alexa+ Integration
  async getAlexaStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/alexa/status`);
    if (!res.ok) throw new Error('Failed to fetch Alexa status');
    return res.json();
  },

  async getAlexaInteractionModel(): Promise<any> {
    const res = await fetch(`${BASE_URL}/alexa/interaction-model`);
    if (!res.ok) throw new Error('Failed to fetch interaction model');
    return res.json();
  },

  async sendAlexaVoiceQuery(query: string): Promise<any> {
    const payload = {
      version: '1.0',
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'GetEvermindMemoryIntent',
          slots: {
            Query: { name: 'Query', value: query }
          }
        }
      }
    };
    const res = await fetch(`${BASE_URL}/alexa/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Alexa request failed');
    return res.json();
  }
};
