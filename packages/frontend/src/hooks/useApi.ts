import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useFetch<T>(key: QueryKey, url: string, params?: Record<string, any>) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get(url, { params });
      return response.data.data;
    },
  });
}

export function useMutate<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys?: QueryKey[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}
