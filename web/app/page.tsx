import Link from 'next/link'

export default function LandingPage() {
  return (
    <main>
      <h1>Edencom Social</h1>
      <p>Capsuleer identity registry. Secured under EDENCOM authority.</p>
      <p>
        Register your identity on the decentralized web. Link your EVE Online pilot and operate
        under verified EDENCOM credentials.
      </p>
      <p>
        <Link href="/signup">Create Account</Link> | <Link href="/login">Sign In</Link>
      </p>

      <hr />

      <ol>
        <li>
          <strong>Create an account</strong> &mdash; Sign up with your email and a password. Takes
          seconds.
        </li>
        <li>
          <strong>Bind your pilot</strong> &mdash; Authorize via EVE Online SSO to link your
          character. Your AT Protocol handle is generated from your character&apos;s name.
        </li>
        <li>
          <strong>Join the network</strong> &mdash; Your data lives on your own PDS. Use any AT
          Protocol client to post, connect, and explore.
        </li>
      </ol>
    </main>
  )
}
