import Menstruation from '@/components/pages/mesnstruation/menstruation'
import React from 'react'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
    title: `${APP_NAME} - Cycle`,
    description: "Track your menstrual cycle",
}

function MenstruationPage() {
  return (
    <Menstruation/>
  )
}

export default MenstruationPage