import React from 'react'
import Settings from '@/components/pages/settings/settings'
import { APP_NAME } from '@/lib/brand'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Settings - ${APP_NAME}`,
  description:
    "Customize your DURIO experience. Manage themes, enabled modules, fancy mode, and personal preferences.",
  openGraph: {
    title: `Settings - ${APP_NAME}`,
    description: "Personalize your DURIO app — themes, modules, and more.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Settings - ${APP_NAME}`,
    description: "Personalize your DURIO app — themes, modules, and more.",
  },
}


function SettingPage() {
  return (
    <Settings />
  )
}

export default SettingPage