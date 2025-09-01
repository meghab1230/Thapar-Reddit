'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js router for redirection
import { Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import Output from 'editorjs-react-renderer';

const AdminFlaggedPosts = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    // Fetch the current user's role
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('/api/checkuser');
        if (response.data.success) {
          setUserRole('admin');
        } else {
          setUserRole('user');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('guest'); // Default to guest on error
      }
    };

    fetchUserRole();
  }, []);

  // Redirect if the user is not an admin
  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      router.push('/');
    }
  }, [userRole, router]);

  // Fetch flagged posts using react-query
  const { data: flaggedPosts, isLoading } = useQuery({
    queryKey: ['flaggedPosts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/subreddit/post/flag');
      return data;
    },
    enabled: userRole === 'admin', // Ensure query only runs for admins
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to load flagged posts',
        variant: 'destructive',
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await fetch('/api/subreddit/post/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['flaggedPosts']);
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    },
  });

  // Custom renderer styles for Editor.js content
  const rendererConfig = {
    code: {
      className: 'bg-gray-100 rounded-md p-2 font-mono text-sm',
    },
    paragraph: {
      className: 'text-gray-700 leading-normal',
    },
    header: {
      className: 'font-bold text-gray-900',
    },
  };

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flagged posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flagged Posts</h1>
            <p className="mt-2 text-gray-600">
              {flaggedPosts?.length ?? 0} posts flagged for review
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Requires Attention
          </div>
        </div>

        {(!flaggedPosts || flaggedPosts.length === 0) ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-400">✓</div>
                <h3 className="text-lg font-semibold">All Clear</h3>
                <p>No flagged posts to review</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {flaggedPosts.map((post: any) => (
              <Card key={post.id} className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={post.author?.image} />
                      <AvatarFallback>
                        {post.author?.name?.[0] ?? 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>by {post.author?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                      </CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Post
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer"
                        onClick={() => deletePostMutation.mutate(post.id)}
                      >
                        Confirm Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent>
                  <div className="mt-4">
                    {post.content && (
                      <div className="prose prose-sm max-w-none">
                        <Output data={post.content} style={rendererConfig} />
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                        Reason: {post.flagType}
                      </div>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        Flagged {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlaggedPosts;
