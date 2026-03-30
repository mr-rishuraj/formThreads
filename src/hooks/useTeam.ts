import { useState, useCallback } from 'react';
import {
  getAllTeams,
  createTeam as dbCreateTeam,
  getTeamByCode,
  joinTeam as dbJoinTeam,
  getFormTeams,
  assignFormToTeam,
  unassignFormFromTeam,
  deleteTeam as dbDeleteTeam,
} from '../queries/forms';
import type { Team } from '../types';

export function useTeam() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTeams();
      setTeams(data);
    } catch (e) {
      console.error('loadTeams failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (name: string): Promise<Team | null> => {
    try {
      const team = await dbCreateTeam(name);
      setTeams((prev) => [team, ...prev]);
      return team;
    } catch (e) {
      console.error('createTeam failed:', e);
      return null;
    }
  }, []);

  const joinTeamByCode = useCallback(async (code: string): Promise<Team | null> => {
    try {
      const team = await getTeamByCode(code);
      if (!team) return null;
      await dbJoinTeam(team.id);
      return team;
    } catch (e) {
      console.error('joinTeamByCode failed:', e);
      return null;
    }
  }, []);

  const getAssignedTeams = useCallback(async (formId: string): Promise<string[]> => {
    try {
      return await getFormTeams(formId);
    } catch {
      return [];
    }
  }, []);

  const setFormTeam = useCallback(async (
    formId: string,
    teamId: string,
    assign: boolean
  ): Promise<void> => {
    try {
      if (assign) {
        await assignFormToTeam(formId, teamId);
      } else {
        await unassignFormFromTeam(formId, teamId);
      }
    } catch (e) {
      console.error('setFormTeam failed:', e);
    }
  }, []);

  const removeTeam = useCallback(async (teamId: string): Promise<boolean> => {
    if (!window.confirm('Delete this team? All members will lose access to assigned forms.')) return false;
    try {
      await dbDeleteTeam(teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      return true;
    } catch (e) {
      console.error('deleteTeam failed:', e);
      alert('Failed to delete team.');
      return false;
    }
  }, []);

  return {
    teams,
    loading,
    loadTeams,
    createTeam,
    joinTeamByCode,
    getAssignedTeams,
    setFormTeam,
    removeTeam,
  };
}