"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppState,
  Game,
  GameResult,
  PointEntry,
  Tournament,
  TournamentStatus,
  User,
} from "./types";
import { seedState } from "./seed";
import { DEFAULT_POINTS, pickColor, uid } from "./utils";

type Actions = {
  reset: () => void;

  // user
  signUp: (name: string) => User;
  updateProfile: (patch: Partial<Pick<User, "name" | "color" | "avatar">>) => void;
  setCurrentUser: (id: string | null) => void;

  // tournament
  createTournament: (
    data: Omit<
      Tournament,
      "id" | "createdAt" | "players" | "status" | "createdBy"
    >
  ) => Tournament;
  updateTournament: (id: string, patch: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;

  joinTournament: (id: string, userId?: string) => void;
  leaveTournament: (id: string, userId?: string) => void;

  addOrganizer: (tid: string, uid: string) => void;
  removeOrganizer: (tid: string, uid: string) => void;

  // games
  addGame: (tid: string, name: string, emoji: string) => void;
  updateGame: (
    tid: string,
    gid: string,
    patch: Partial<Pick<Game, "name" | "emoji" | "pointsSystem">>
  ) => void;
  removeGame: (tid: string, gid: string) => void;

  // results
  saveResults: (tid: string, gid: string, results: GameResult[]) => void;
};

type Store = AppState & Actions;

const initialState: AppState = seedState();

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      reset: () => set({ ...seedState() }),

      signUp: (name) => {
        const u: User = {
          id: uid("u"),
          name,
          avatar: name.charAt(0).toUpperCase() || "?",
          color: pickColor(),
          joinedAt: Date.now(),
        };
        set((s) => ({ users: [...s.users, u], currentUserId: u.id }));
        return u;
      },

      updateProfile: (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        }));
      },

      setCurrentUser: (id) => set({ currentUserId: id }),

      createTournament: (data) => {
        const me = get().currentUserId;
        if (!me) throw new Error("not_signed_in");
        const t: Tournament = {
          id: uid("t"),
          createdBy: me,
          status: "open",
          players: [me],
          createdAt: Date.now(),
          ...data,
        };
        set((s) => ({ tournaments: [t, ...s.tournaments] }));
        return t;
      },

      updateTournament: (id, patch) => {
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        }));
      },

      deleteTournament: (id) =>
        set((s) => ({
          tournaments: s.tournaments.filter((t) => t.id !== id),
        })),

      joinTournament: (id, userId) => {
        const u = userId ?? get().currentUserId;
        if (!u) return;
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === id && !t.players.includes(u)
              ? { ...t, players: [...t.players, u] }
              : t
          ),
        }));
      },

      leaveTournament: (id, userId) => {
        const u = userId ?? get().currentUserId;
        if (!u) return;
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== id) return t;
            return {
              ...t,
              players: t.players.filter((p) => p !== u),
              games: t.games.map((g) => ({
                ...g,
                results: g.results.filter((r) => r.playerId !== u),
              })),
            };
          }),
        }));
      },

      addOrganizer: (tid, uId) =>
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tid) return t;
            const organizers = t.organizers.includes(uId)
              ? t.organizers
              : [...t.organizers, uId];
            const players = t.players.includes(uId)
              ? t.players
              : [...t.players, uId];
            return { ...t, organizers, players };
          }),
        })),

      removeOrganizer: (tid, uId) =>
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tid) return t;
            if (uId === t.createdBy) return t;
            return {
              ...t,
              organizers: t.organizers.filter((o) => o !== uId),
            };
          }),
        })),

      addGame: (tid, name, emoji) => {
        const g: Game = {
          id: uid("g"),
          name,
          emoji: emoji || "🎮",
          pointsSystem: [...DEFAULT_POINTS],
          results: [],
        };
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === tid ? { ...t, games: [...t.games, g] } : t
          ),
        }));
      },

      updateGame: (tid, gid, patch) =>
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tid) return t;
            return {
              ...t,
              games: t.games.map((g) =>
                g.id === gid ? { ...g, ...patch } : g
              ),
            };
          }),
        })),

      removeGame: (tid, gid) =>
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === tid
              ? { ...t, games: t.games.filter((g) => g.id !== gid) }
              : t
          ),
        })),

      saveResults: (tid, gid, results) =>
        set((s) => ({
          tournaments: s.tournaments.map((t) => {
            if (t.id !== tid) return t;
            return {
              ...t,
              games: t.games.map((g) =>
                g.id === gid ? { ...g, results } : g
              ),
            };
          }),
        })),
    }),
    {
      name: "olympgame_v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// helpers
export const useUser = (id: string | null | undefined) =>
  useStore((s) => (id ? s.users.find((u) => u.id === id) ?? null : null));

export const useTournament = (id: string | undefined) =>
  useStore((s) => (id ? s.tournaments.find((t) => t.id === id) ?? null : null));

// SSR-safe hook to know if store is hydrated
import { useEffect, useState } from "react";
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

// toast system (separate but lives near store)
type Toast = { id: string; msg: string; type?: "success" | "error" | "" };
type ToastStore = {
  toasts: Toast[];
  push: (msg: string, type?: Toast["type"]) => void;
  dismiss: (id: string) => void;
};
export const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  push: (msg, type = "") => {
    const id = uid("toast");
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2800);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(msg: string, type?: Toast["type"]) {
  useToasts.getState().push(msg, type);
}
