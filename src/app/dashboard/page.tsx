'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

import { useToast } from '@/hooks/use-toast';
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

const UserDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's posts using react-query
  const { data: userPosts, isLoading } = useQuery({
    queryKey: ['userPosts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/subreddit/post/userposts');
      return data;
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to load your posts',
        variant: 'destructive',
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
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
      queryClient.invalidateQueries(['userPosts']);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Posts</h1>
          <p className="mt-2 text-gray-600">
            {userPosts?.length ?? 0} posts created
          </p>
        </div>

        {(!userPosts || userPosts.length === 0) ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-400">📝</div>
                <h3 className="text-lg font-semibold">No Posts Yet</h3>
                <p>You haven't created any posts yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {userPosts.map((post: any) => (
              <Card key={post.id} className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={post.author?.image} />
                      <AvatarFallback>
                        {post.author?.name?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>Posted in r/{post.subreddit.name}</span>
                        <span>•</span>
                        <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                      </CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
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

                    {post.flag && (
                      <div className="mt-4">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                          Flagged: {post.flagType}
                        </div>
                      </div>
                    )}
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

export default UserDashboard;