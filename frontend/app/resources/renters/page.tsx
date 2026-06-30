import type { Metadata } from 'next'
import ResourceGuidePage from '@/components/resources/ResourceGuidePage'

export const metadata: Metadata = {
  title: 'Renter Resources',
  description:
    'Guides for renters on Rhentify in Budapest — browse listings, post rent requests, book safely, and leave reviews.',
}

export default function RenterResourcesPage() {
  return <ResourceGuidePage theme="renter" />
}
