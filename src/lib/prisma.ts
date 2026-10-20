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
  globalThis.prismaGlobal = client
  return client
}

const prisma = getPrismaClient()

export default prisma

globalThis.prismaGlobal = prisma
