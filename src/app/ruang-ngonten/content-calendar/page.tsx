import React, { Suspense } from 'react';
import ContentCalendarClient from './ContentCalendarClient';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export default async function ContentCalendarPage() {
  const session = await auth();
  let initialData: any = {};
  
  if (session?.user?.id) {
    const cal = await prisma.contentCalendar.findFirst({
      where: { userId: session.user.id }
    });
    if (cal) {
      initialData = cal.data;
    }
  }

  return <Suspense fallback={<div>Loading calendar...</div>}><ContentCalendarClient initialData={initialData} /></Suspense>;
}
