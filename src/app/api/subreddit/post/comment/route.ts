import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentValidator } from '@/lib/validators/comment'
import { z } from 'zod'

// Create an array of vulgar words to filter
const VULGAR_WORDS = ['ass', 'bitch'] // Add more words as needed

// Function to check if text contains vulgar words
const checkForVulgularWords = (sentence : any, words : any) => {
  const regex = new RegExp(`\\b(${words.join("|")})\\b`, "i");
  return regex.test(sentence);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { postId, text, replyToId } = CommentValidator.parse(body)
    
    const session = await getAuthSession()
    
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check for vulgar words
    if (checkForVulgularWords(text, VULGAR_WORDS)) {
      return new Response('Comment contains inappropriate language', { 
        status: 400 
      })
    }

    // If no vulgar words found, create the comment
    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not post to subreddit at this time. Please try later',
      { status: 500 }
    )
  }
}