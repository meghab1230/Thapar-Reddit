'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function useDeletePost() {
  const router = useRouter()

  const { mutate: deletePost, isLoading } = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch('/api/subreddit/post/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      return response.json()
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: 'Could not delete post. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        description: 'Post deleted successfully',
      })
      router.refresh()
      router.push('/')  // Or wherever you want to redirect after deletion
    },
  })

  return { deletePost, isLoading }
}