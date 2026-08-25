import { queryReviewQueue } from './query'
import { SemakanQueueView } from '../../../components/semakan/semakan-queue-view'

export const dynamic = 'force-dynamic'

export default async function OfficerReviewQueuePage() {
  const queue = await queryReviewQueue('1')

  return <SemakanQueueView initialQueue={queue} />
}
