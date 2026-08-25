import { queryIssuedLicences } from './query'
import { PelesenanView } from '../../../components/pelesenan/pelesenan-view'

export const dynamic = 'force-dynamic'

export default async function PelesenanPage() {
  const licences = await queryIssuedLicences('1')

  return <PelesenanView initialLicences={licences} />
}
