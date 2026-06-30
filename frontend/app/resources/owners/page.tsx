import type { Metadata } from 'next'
import ResourceGuidePage from '@/components/resources/ResourceGuidePage'

export const metadata: Metadata = {
  title: 'Owner Resources',
  description:
    'Guides for owners on Rhentify in Budapest — list items, price in HUF, handle bookings, and grow with reviews.',
}

export default function OwnerResourcesPage() {
  return <ResourceGuidePage theme="owner" />
}
