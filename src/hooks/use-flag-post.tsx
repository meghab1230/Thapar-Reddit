'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function useFlagPost() {
  const router = useRouter()

  const { mutate: flagPost, isLoading } = useMutation({
    mutationFn: async ({ postId, flagType }: { postId: string, flagType: string }) => {
      const response = await fetch('/api/subreddit/post/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, flagType }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to flag post')
      }

      return response.json()
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not flag post. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        description: 'Post has been flagged for review',
      })
      router.refresh()
    },
  })

  return { flagPost, isLoading }
}