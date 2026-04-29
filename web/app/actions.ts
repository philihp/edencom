'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugifyCharacterName } from '@edencom/character-slug'

const serviceHandleDomains = process.env.PDS_SERVICE_HANDLE_DOMAINS?.replace(/^\./, '')

export const startBinding = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw new Error(`Anonymous sign-in failed: ${error.message}`)
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('No session after anonymous sign-in')

  const pdsUrl = process.env.PDS_API_URL
  if (!pdsUrl) throw new Error('PDS_API_URL not configured')

  const res = await fetch(`${pdsUrl}/eve/start-binding`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to start EVE binding: ${text}`)
  }

  const { url } = (await res.json()) as { url: string }
  redirect(url)
}

export const cancelBinding = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export const finishBinding = async (formData: FormData) => {
  const password = (formData.get('password') as string) ?? ''

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/')

  const pdsUrl = process.env.PDS_API_URL
  if (!pdsUrl) throw new Error('PDS_API_URL not configured')

  const accountRes = await fetch(`${pdsUrl}/api/account`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  })
  if (!accountRes.ok) {
    redirect('/?account_error=Could+not+verify+EVE+binding')
  }
  const account = (await accountRes.json()) as {
    bound: boolean
    characterId?: number
    characterName?: string
  }

  console.log({ user, session, pdsUrl, account })

  if (!account.bound || !account.characterId || !account.characterName) {
    redirect('/?account_error=Link+your+EVE+character+first')
  }

  const handle = slugifyCharacterName(account.characterName)
  const email = `${handle}@${serviceHandleDomains}`

  const admin = createAdminClient()
  const { data: existingUser, ...adminRes } = await admin.rpc('get_user_id_by_email', {
    user_email: email,
  })

  console.log({ email, data: existingUser, ...adminRes })

  if (existingUser) {
    const { error } = await admin.auth.admin.updateUserById(existingUser, { password })
    console.error(error)
    if (error) {
      redirect(`/?account_error=${encodeURIComponent(error.message)}`)
    }
  } else {
    const { error } = await supabase.auth.updateUser({ email, password })
    if (error) {
      redirect(`/?account_error=${encodeURIComponent(error.message)}`)
    }
  }

  redirect('/')
}
