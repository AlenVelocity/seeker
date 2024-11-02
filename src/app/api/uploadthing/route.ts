import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'
import { NextRequest } from 'next/server'

// Export routes for Next App Router
export const { GET, POST: utPost } = createRouteHandler({
    router: ourFileRouter

    // Apply an (optional) custom config:
    // config: { ... },
})

export const POST = (req: NextRequest) => {
    console.log('POST', req)
    return utPost(req)
}
