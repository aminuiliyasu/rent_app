import type { Metadata } from 'next'
import ResourcesHub from '@/components/resources/ResourcesHub'
import { LAUNCH_REGION_LABEL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Resources',
  description: `Help for renters and owners on Rhentify in ${LAUNCH_REGION_LABEL}. Choose the guide that matches what you want to do.`,
}

export default function ResourcesHubPage() {
  return <ResourcesHub />
}
