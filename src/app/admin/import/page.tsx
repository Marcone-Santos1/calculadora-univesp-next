import { prisma } from "@/lib/prisma"
import ImportClient from "./import-client"

export default async function ImportPage() {
    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })

    return <ImportClient subjects={subjects} />
}
