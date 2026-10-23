import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, PageId } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { EvermindPage } from './pages/EvermindPage';
import { LooseEndsPage } from './pages/LooseEndsPage';
import { DoorstepOpsPage } from './pages/DoorstepOpsPage';
import { FormShiftPage } from './pages/FormShiftPage';
import { AssistantPage } from './pages/AssistantPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api/client';
import {
  SystemStatus,
  BeeStatus,
  MemoryItem,
  CommitmentItem,
  IncidentItem,
  WorkoutItem
} from './types';

const validPages: PageId[] = [
  'overview',
  'memory',
  'commitments',
  'incidents',
  'workouts',
  'assistant',
  'integrations',
  'activity',
  'settings'
];

const getInitialPage = (): PageId => {
  const hash = window.location.hash.replace('#', '') as PageId;
  return validPages.includes(hash) ? hash : 'overview';
};

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [beeStatus, setBeeStatus] = useState<BeeStatus | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [commitments, setCommitments] = useState<CommitmentItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeAssistantQuery, setActiveAssistantQuery] = useState('');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToPage = (page: PageId) => {
    window.location.hash = page;
    setCurrentPage(page);
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      const [sys, bee, mems, comms, incs, wout] = await Promise.all([
        api.getSystemStatus().catch(() => null),
        api.getBeeStatus().catch(() => null),
        api.listMemories().catch(() => []),
        api.listCommitments().catch(() => []),
        api.listIncidents().catch(() => []),
        api.getActiveWorkout().catch(() => null)
      ]);

      if (sys) setSystemStatus(sys);
      if (bee) setBeeStatus(bee);
      setMemories(mems);
      setCommitments(comms);
      setIncidents(incs);
      setActiveWorkout(wout);
    } catch (err) {
      console.error('Error refreshing state:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleGlobalSearch = (query: string) => {
    setActiveAssistantQuery(query);
    navigateToPage('assistant');
  };

  const pendingMemoriesCount = memories.filter((m) => m.approval_status === 'pending').length;
  const openCommitmentsCount = commitments.filter((c) => c.resolution_status === 'open').length;
  const activeIncidentsCount = incidents.filter((i) => i.resolution_status === 'open').length;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col font-sans">
      <Header
        systemStatus={systemStatus}
        beeStatus={beeStatus}
        onRefresh={refreshAllData}
        isRefreshing={isRefreshing}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={navigateToPage}
          pendingMemoriesCount={pendingMemoriesCount}
          openCommitmentsCount={openCommitmentsCount}
          activeIncidentsCount={activeIncidentsCount}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'overview' && (
              <OverviewPage
                onNavigate={navigateToPage}
                memories={memories}
                commitments={commitments}
                incidents={incidents}
                activeWorkout={activeWorkout}
                beeStatus={beeStatus}
                onSearch={handleGlobalSearch}
              />
            )}

            {currentPage === 'memory' && (
              <EvermindPage
                memories={memories}
                beeStatus={beeStatus}
                onRefresh={refreshAllData}
              />
            )}

            {currentPage === 'commitments' && (
              <LooseEndsPage
                commitments={commitments}
                onRefresh={refreshAllData}
              />
            )}

            {currentPage === 'incidents' && (
              <DoorstepOpsPage
                incidents={incidents}
                onRefresh={refreshAllData}
              />
            )}

            {currentPage === 'workouts' && (
              <FormShiftPage
                activeWorkout={activeWorkout}
                onRefresh={refreshAllData}
              />
            )}

            {currentPage === 'assistant' && (
              <AssistantPage initialQuery={activeAssistantQuery} />
            )}

            {currentPage === 'integrations' && (
              <IntegrationsPage
                beeStatus={beeStatus}
                onRefresh={refreshAllData}
              />
            )}

            {currentPage === 'activity' && <ActivityPage />}

            {currentPage === 'settings' && (
              <SettingsPage
                systemStatus={systemStatus}
                onRefresh={refreshAllData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
