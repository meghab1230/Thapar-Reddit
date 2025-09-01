import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Comment, CommentVote, User } from '@prisma/client'
import CreateComment from './CreateComment'
import PostComment from './comments/PostComment'

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
  replies: ReplyComment[]
}

type ReplyComment = Comment & {
  votes: CommentVote[]
  author: User
}

interface CommentsSectionProps {
  postId: string
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession()
  
  // Fetch all comments for the post
  const comments = await db.comment.findMany({
    where: {
      postId: postId,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Organize comments into a hierarchy
  const topLevelComments = comments.filter(comment => !comment.replyToId)
  const replies = comments.filter(comment => comment.replyToId)

  // Create a map of replies for each parent comment
  const replyMap = new Map()
  replies.forEach(reply => {
    if (!replyMap.has(reply.replyToId)) {
      replyMap.set(reply.replyToId, [])
    }
    replyMap.get(reply.replyToId).push(reply)
  })

  if (!comments.length) {
    return (
      <div className="flex flex-col gap-y-4 mt-4">
        <hr className="w-full h-px my-6" />
        <CreateComment postId={postId} />
        <p className="text-center text-gray-500">No comments yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />
      <CreateComment postId={postId} />
      
      <div className="flex flex-col gap-y-6 mt-4">
        {topLevelComments.map((topLevelComment) => {
          const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
            (acc, vote) => {
              if (vote.type === 'UP') return acc + 1
              if (vote.type === 'DOWN') return acc - 1
              return acc
            },
            0
          )

          const topLevelCommentVote = topLevelComment.votes.find(
            (vote) => vote.userId === session?.user.id
          )

          // Get replies for this comment
          const commentReplies = replyMap.get(topLevelComment.id) || []

          return (
            <div key={topLevelComment.id} className="flex flex-col">
              <div className="mb-2">
                <PostComment
                  comment={topLevelComment}
                  currentVote={topLevelCommentVote}
                  votesAmt={topLevelCommentVotesAmt}
                  postId={postId}
                />
              </div>

              {/* Render replies */}
              {commentReplies
                .sort((a: any, b: any) => b.votes.length - a.votes.length)
                .map((reply: any) => {
                  const replyVotesAmt = reply.votes.reduce((acc: any, vote: any) => {
                    if (vote.type === 'UP') return acc + 1
                    if (vote.type === 'DOWN') return acc - 1
                    return acc
                  }, 0)

                  const replyVote = reply.votes.find(
                    (vote: any) => vote.userId === session?.user.id
                  )

                  return (
                    <div
                      key={reply.id}
                      className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                    >
                      <PostComment
                        comment={reply}
                        currentVote={replyVote}
                        votesAmt={replyVotesAmt}
                        postId={postId}
                      />
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CommentsSection