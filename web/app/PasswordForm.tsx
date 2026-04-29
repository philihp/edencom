'use client'

import { useFormStatus } from 'react-dom'
import { finishBinding } from './actions'

const SubmitButton = () => {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      Set
    </button>
  )
}

export const PasswordForm = () => (
  <form action={finishBinding}>
    <label htmlFor="password">
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={8}
      />
    </label>{' '}
    <SubmitButton />
  </form>
)
