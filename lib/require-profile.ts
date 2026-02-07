import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function requireProfile() {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    redirect('/auth/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  });

  if (!profile) {
    redirect('/onboarding');
  }
}
