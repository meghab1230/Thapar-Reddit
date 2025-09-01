import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
    try {
      const session = await getAuthSession()
        
      const user = await db.user.findFirst({
        where:{
            id: session?.user.id
        }
      })

      if(user?.role === 'admin') {
        return new Response(JSON.stringify({ success: true }))
      }
      else{
        throw new Error
      }
      
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'You are not an admin' 
        }), 
        { status: 500 }
      )
    }
  }