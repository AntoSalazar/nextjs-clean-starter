import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(accessToken, secret);
      redirect('/dashboard');
    } catch {
      // Token invalid, redirect to login
      redirect('/login');
    }
  }

  redirect('/login');
}
