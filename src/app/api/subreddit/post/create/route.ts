import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostValidator } from '@/lib/validators/post'
import { z } from 'zod'

import vulgarWords from '../../../../../../random/vulgular.json'
console.log(vulgarWords)
const checkForVulgarWords = (sentence: any) => {
  const words = vulgarWords.map((item) => item.Word);
  const regex = new RegExp(`\\b(${words.join("|")})\\b`, "i");
  return regex.test(sentence);
};


// const vulgularWords = ['chutiya', 'mkc', 'bhosdike']

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { title, content, subredditId } = PostValidator.parse(body)

    const textToCheck = content.blocks[0].data.text

    if(checkForVulgarWords(textToCheck)) {
      return new Response('Your Post contains banned words', {status: 403})
    }else{
      const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // verify user is subscribed to passed subreddit id
    const subscription = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscription) {
      return new Response('Subscribe to post', { status: 403 })
    }

    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      },
    })

    return new Response('OK')
    }
    
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
