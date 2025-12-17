import Login from '@/components/auth/login/login'
import { APP_NAME } from '@/lib/brand'
import React from 'react'

export const metadata = {
  title: `Login - ${APP_NAME}`,
  description: `Login to your ${APP_NAME} account to manage your daily tasks and stay organized.`,
}

function LoginPage() {
  return (
    <Login />
  )
}

export default LoginPage