import { buildMetadata } from '@/lib/metadata'
import { fetchLiveClass } from '@/lib/seo/publicApi'
import { toDescription } from '@/lib/seo/site'
import LiveClassEntry from './LiveClassEntry'

interface PageProps {
  params: Promise<{ id: string }>
}

// Share previews (WhatsApp, X, LinkedIn) read these tags. noindex: live
// classes are short-lived, so search engines get /classes instead.
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const { liveClass } = await fetchLiveClass(id)
  const isPublic = !!liveClass && liveClass.privacy !== 'private'
  return buildMetadata({
    title: isPublic ? liveClass.title : 'Live class',
    description: isPublic
      ? toDescription(liveClass.description) || `Join ${liveClass.title}, a live class on Hallos`
      : 'Join a live class on Hallos',
    thumbnail: isPublic ? liveClass.thumbnailUrl : null,
    path: `/live/${id}`,
    noIndex: true,
  })
}

export default async function LiveClassPage({ params }: PageProps) {
  const { id } = await params
  // Same cached request as generateMetadata. Only public fields of PUBLIC
  // classes reach the client; a private class sends nothing.
  const { liveClass } = await fetchLiveClass(id)
  const preview = liveClass && liveClass.privacy !== 'private' ? liveClass : null
  return <LiveClassEntry id={id} preview={preview} />
}
