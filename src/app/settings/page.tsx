import Settings from '@/components/pages/settings/settings'
import React from 'react'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
    title: `${APP_NAME} - Settings`,
    description: "User Settings",
}

function SettingPage() {
  return (
    <Settings />
  )
}

export default SettingPage