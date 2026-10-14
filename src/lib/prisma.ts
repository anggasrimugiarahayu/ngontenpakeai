import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const getPrismaClient = () => {
  if (globalThis.prismaGlobal && 'instagramAccount' in globalThis.prismaGlobal) {
    return globalThis.prismaGlobal
  }
  const client = prismaClientSingleton()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = client
  }
  return client
}

const prisma = getPrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
