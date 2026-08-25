import { queryApplications } from './query'
import { PermohonanListView } from '../../../components/permohonan/permohonan-list-view'

export const dynamic = 'force-dynamic'

export default async function PermohonanListPage() {
  const applications = await queryApplications('1')

  return <PermohonanListView initialApplications={applications} />
}
