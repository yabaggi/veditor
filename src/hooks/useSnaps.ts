import { useSnapsContext } from '../store/SnapsContext';

export const useSnaps = () => {
  return useSnapsContext();
};
