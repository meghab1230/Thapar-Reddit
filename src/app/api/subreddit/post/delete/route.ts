import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { postId } = body;

    // Fetch the user from the database to check the role
    const user = await db.user.findFirst({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Determine query condition based on the user's role
    const postCondition =
      user.role === "admin"
        ? { id: postId } // Admins can delete any post
        : { id: postId, authorId: session.user.id }; // Non-admins can only delete their posts

    // Fetch the post to ensure it meets the condition
    const post = await db.post.findFirst({
      where: postCondition,
    });

    if (!post) {
      return new Response('Post not found or unauthorized', { status: 404 });
    }

    // Delete the post
    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return new Response(JSON.stringify({ status: 200, message: 'Post deleted successfully' }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new Response('Could not delete post at this time. Please try again later.', { status: 500 });
  }
}
