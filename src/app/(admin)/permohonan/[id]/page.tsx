import { queryApplicationDetail } from './query'
import { ApplicationDetailView } from '../../../../components/permohonan/permohonan-detail-view'

export const dynamic = 'force-dynamic'

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params
  const data = await queryApplicationDetail('1', id)

  return <ApplicationDetailView initialData={data} />
}
