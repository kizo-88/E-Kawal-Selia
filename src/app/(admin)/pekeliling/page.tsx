import { queryCirculars } from './query'
import { PekelilingView } from '../../../components/pekeliling/pekeliling-view'

export const dynamic = 'force-dynamic'

export default async function PekelilingPage() {
  const circulars = await queryCirculars('1')

  return <PekelilingView initialCirculars={circulars} />
}
