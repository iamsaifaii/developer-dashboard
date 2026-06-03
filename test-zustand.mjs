import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const mockStorage = {
  getItem: (name) => {
    console.log('GET', name);
    return JSON.stringify({ state: { tasks: [{ id: 1, title: 'Test' }] }, version: 0 });
  },
  setItem: (name, value) => {
    console.log('SET', name, value);
  },
  removeItem: (name) => {
    console.log('REMOVE', name);
  }
};

const useStore = create()(
  persist(
    (set) => ({
      tasks: [],
      columns: [{ id: 'todo', title: 'Todo' }],
      addTask: () => set((state) => ({ tasks: [...state.tasks, { id: 2, title: 'New' }] }))
    }),
    {
      name: 'test-store',
      storage: createJSONStorage(() => mockStorage),
      partialize: (state) => ({ tasks: state.tasks })
    }
  )
);

console.log("INITIAL STATE AFTER HYDRATION:", useStore.getState());
useStore.getState().addTask();
console.log("STATE AFTER ADD:", useStore.getState());
