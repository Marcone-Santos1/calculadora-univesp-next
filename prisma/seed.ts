import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    const subjects = [
        { name: 'Cálculo I', color: 'bg-blue-500', icon: '📐' },
        { name: 'Algoritmos e Programação', color: 'bg-green-500', icon: '💻' },
        { name: 'Física I', color: 'bg-red-500', icon: '⚛️' },
        { name: 'Português', color: 'bg-yellow-500', icon: '📚' },
        { name: 'Inglês', color: 'bg-purple-500', icon: '🌍' },
        { name: 'Ética e Cidadania', color: 'bg-pink-500', icon: '⚖️' },
    ]

    for (const subject of subjects) {
        await prisma.subject.upsert({
            where: { name: subject.name },
            update: {},
            create: subject,
        })
        console.log(`✅ Created/Updated subject: ${subject.name}`)
    }

    console.log('✨ Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
