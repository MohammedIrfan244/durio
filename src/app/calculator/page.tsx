import React from 'react'
import Calculator from '@/components/pages/calculator/calculator'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
    title: `${APP_NAME} - Calculator`,
    description: "Get those numbers right",
}

function CalculatorPage() {
  return (
    <Calculator />
  )
}

export default CalculatorPage