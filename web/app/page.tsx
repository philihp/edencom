import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { startBinding, cancelBinding, finishBinding } from './actions'

interface AccountData {
  bound: boolean
  characterId?: number
  handle?: string
  did?: string
}

const fetchAccount = async (accessToken: string): Promise<AccountData> => {
  const pdsUrl = process.env.PDS_API_URL
  if (!pdsUrl) return { bound: false }

  try {
    const res = await fetch(`${pdsUrl}/api/account`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    if (!res.ok) return { bound: false }
    return res.json() as Promise<AccountData>
  } catch (err) {
    console.error('fetchAccount failed:', err)
    return { bound: false }
  }
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ eve_bound?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pdsUrl = process.env.PDS_API_URL
  if (!pdsUrl) throw new Error('PDS_API_URL not configured')

  const account = session && (await fetchAccount(session.access_token))

  const { eve_bound: eveHandle } = await searchParams
  let passwordPreviouslySet = false
  if (eveHandle) {
    const email = eveHandle.replace('.', '@')
    const admin = createAdminClient()
    const { data: existingUserId } = await admin.rpc('get_user_id_by_email', {
      user_email: email,
    })
    passwordPreviouslySet = !!existingUserId
  }

  return (
    <main>
      <h1>Edencom Social Link</h1>

      <p>
        New Eden citizens with Edencom social credentials may use this PDS to connect to
        <a href="https://overreacted.io/open-social/">open social</a> clients over like
        BlueSky.
      </p>

      {!user && (
        <form action={startBinding}>
          <button type="submit">Connect</button>
        </form>
      )}

      {user && user.is_anonymous && (
        <>
          <fieldset>
            <legend>Link</legend>
            <Image
              src={`https://images.evetech.net/characters/${account!.characterId}/portrait?size=256`}
              alt={account?.handle ?? 'Character portrait'}
              width={128}
              height={128}
            />
            <dl>
              <dt>Host</dt>
              <dd>
                <code>{pdsUrl}</code>
              </dd>
              <dt>Username</dt>
              <dd>
                <Link href={`https://bsky.app/profile/${account?.handle}`}>
                  {account?.handle}
                </Link>
              </dd>
              <dt>Password</dt>
              <dd>
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
                  <button type="submit">Set</button>
                </form>
              </dd>
            </dl>
          </fieldset>
        </>
      )}

      {user && !user.is_anonymous && (
        <>
          <fieldset>
            <legend>Link</legend>
            <Image
              src={`https://images.evetech.net/characters/${account!.characterId}/portrait?size=256`}
              alt={account?.handle ?? 'Character portrait'}
              width={128}
              height={128}
            />
            <dl>
              <dt>Host</dt>
              <dd>
                <code>{pdsUrl}</code>
              </dd>
              <dt>Username</dt>
              <dd>
                <Link href={`https://bsky.app/profile/${account?.handle}`}>
                  {account?.handle}
                </Link>
              </dd>
              <dt>Password</dt>
              <dd>
                <var>************</var>
              </dd>
            </dl>
          </fieldset>
          <p>
            You can now connect with these credentials. You might need to specify the host
            as your hosting provider.
          </p>
        </>
      )}

      <p></p>

      {user && (
        <form action={cancelBinding}>
          <button type="submit">Disconnect</button>
        </form>
      )}

      {/* <pre>{JSON.stringify({ user, session, account }, undefined, 2)}</pre> */}
    </main>
  )
}
