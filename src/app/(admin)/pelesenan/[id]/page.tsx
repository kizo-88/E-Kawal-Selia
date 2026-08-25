import { queryLicenceDetail } from './query'
import { LicenceCertificateView } from '../../../../components/pelesenan/licence-certificate-view'

export const dynamic = 'force-dynamic'

interface LicenceCertificatePageProps {
  params: Promise<{ id: string }>
}

export default async function LicenceCertificatePage({ params }: LicenceCertificatePageProps) {
  const { id } = await params
  const licence = await queryLicenceDetail('1', id)

  return <LicenceCertificateView initialLicence={licence} />
}
