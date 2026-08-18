import Album from '@/components/pages/album/album'
import { APP_NAME } from '@/lib/brand'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Photo Album - ${APP_NAME}`,
  description: "Upload, organize, and revisit your personal photo and video library.",
}

function AlbumPage() {
  return <Album />
}

export default AlbumPage
