import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const f = createUploadthing()

const handleAuth = async (req: NextRequest) => {
    const { userId } = getAuth(req)
    if (!userId) throw new Error('Unauthorized')
    return { userId }
}

export const ourFileRouter = {
    bookImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const { userId } = getAuth(req)
            if (!userId) throw new Error('Unauthorized')
            return { userId }
        })
        .onUploadError(async ({ error }) => {
            console.log('Upload error:', error)
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Upload complete for userId:', metadata.userId)
            console.log('file url', file.url)
        }),

    memberImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const { userId } = getAuth(req)
            if (!userId) throw new Error('Unauthorized')
            return { userId }
        })
        .onUploadError(async ({ error }) => {
            console.log('Upload error:', error)
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Upload complete for userId:', metadata.userId)
            console.log('file url', file.url)
        }),

    dataUploader: f({
        'application/octet-stream': { maxFileSize: '32MB', maxFileCount: 10 },
        'application/pdf': { maxFileSize: '32MB', maxFileCount: 10 },
        'text/plain': { maxFileSize: '32MB', maxFileCount: 10 },
        'image/png': { maxFileSize: '32MB', maxFileCount: 10 },
        'image/jpeg': { maxFileSize: '32MB', maxFileCount: 10 },
        'image/webp': { maxFileSize: '32MB', maxFileCount: 10 },
        'video/mp4': { maxFileSize: '32MB', maxFileCount: 10 },
        'audio/mpeg': { maxFileSize: '32MB', maxFileCount: 10 },
        'audio/ogg': { maxFileSize: '32MB', maxFileCount: 10 }
    })
        .middleware(async ({ req }) => {
            return handleAuth(req)
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Upload complete for userId:', metadata.userId)
            console.log('File URL:', file.url)
        })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
