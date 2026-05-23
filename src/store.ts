import { create } from 'zustand';

interface GameState {
    isGameStarted: boolean;
    setGameStarted: (started: boolean) => void;
    checkpoint: number;
    setCheckpoint: (cp: number) => void;
    stolenElements: string[];
    addStolenElement: (id: string) => void;
    resetStolenElements: () => void;
    isTerminalOpen: boolean;
    setTerminalOpen: (open: boolean) => void;
    damageLevel: number;
    increaseDamage: () => void;
}

const useGameStore = create<GameState>((set) => ({
    isGameStarted: false,
    setGameStarted: (started) => set({ isGameStarted: started }),
    checkpoint: 0,
    setCheckpoint: (cp) => set({ checkpoint: cp }),
    stolenElements: [],
    addStolenElement: (id) => set((state) => ({ stolenElements: [...state.stolenElements, id] })),
    resetStolenElements: () => set({ stolenElements: [] }),
    isTerminalOpen: false,
    setTerminalOpen: (open) => set({ isTerminalOpen: open }),
    damageLevel: 0,
    increaseDamage: () => set((state) => ({ damageLevel: state.damageLevel + 1 })),
}));

export default useGameStore;
