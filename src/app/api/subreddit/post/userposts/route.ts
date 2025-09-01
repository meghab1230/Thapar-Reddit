import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Fetch all posts by the current user
    const userPosts = await db.post.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        subreddit: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return new Response(JSON.stringify(userPosts))
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Could not fetch your posts at this time. Please try again later.'
      }),
      { status: 500 }
    )
  }
}