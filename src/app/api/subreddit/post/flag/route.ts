import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401 }
      )
    }

    const body = await req.json()
    const { postId, flagType } = body

    // Update the post's flagged status
    const post = await db.post.update({
      where: {
        id: postId,
      },
      data: {
        flag: true,
        flagType: flagType, // You might want to store the flag type as well
      },
    })

    return new Response(JSON.stringify({ success: true }))
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Could not flag post at this time. Please try again later.' 
      }), 
      { status: 500 }
    )
  }
}

export async function GET() {
    try {
      const session = await getAuthSession()
  
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { status: 401 }
        )
      }
  
      // Fetch all flagged posts
      const flaggedPosts = await db.post.findMany({
        where: {
          flag: true,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
  
      return new Response(JSON.stringify(flaggedPosts))
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not fetch flagged posts at this time. Please try again later.' 
        }), 
        { status: 500 }
      )
    }
  }