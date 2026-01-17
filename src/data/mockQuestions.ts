import { Question } from "@/Contracts/Question";
import { Subject } from "@/Contracts/Subject";

export const mockSubjects: Subject[] = [
    { id: '1', name: 'Cálculo I', color: 'bg-blue-500' },
    { id: '2', name: 'Algoritmos e Programação', color: 'bg-green-500' },
    { id: '3', name: 'Física I', color: 'bg-red-500' },
    { id: '4', name: 'Português', color: 'bg-yellow-500' },
    { id: '5', name: 'Inglês', color: 'bg-purple-500' },
    { id: '6', name: 'Ética e Cidadania', color: 'bg-pink-500' },
];

export const mockQuestions: Question[] = [
    {
        id: '1',
        title: 'Limite de uma função',
        text: 'Calcule o limite de f(x) = (x^2 - 1) / (x - 1) quando x tende a 1.',
        subjectId: '1',
        subjectName: 'Cálculo I',
        week: 'Semana 2',
        createdAt: new Date('2023-10-25T10:00:00Z'),
        userId: 'user1',
        userName: 'João Silva',
        views: 120,
        isVerified: true,
        alternatives: [
            { id: 'a', text: '0', votes: 2, percentage: 5 },
            { id: 'b', text: '1', votes: 5, percentage: 12 },
            { id: 'c', text: '2', votes: 35, percentage: 83, isCorrect: true },
            { id: 'd', text: 'Infinito', votes: 0, percentage: 0 },
            { id: 'e', text: 'Indeterminado', votes: 0, percentage: 0 },
        ],
        comments: [
            { id: 'c1', userId: 'user2', userName: 'Maria', text: 'Basta fatorar o numerador: (x-1)(x+1). Corta o (x-1) e sobra x+1. 1+1=2.', createdAt: new Date('2023-10-25T11:00:00Z'), votes: [] }
        ]
    },
    {
        id: '2',
        title: 'Complexidade de Algoritmos',
        text: 'Qual a complexidade do algoritmo de busca binária?',
        subjectId: '2',
        subjectName: 'Algoritmos e Programação',
        week: 'Semana 4',
        createdAt: new Date('2023-10-26T14:30:00Z'),
        userId: 'user3',
        userName: 'Carlos Souza',
        views: 85,
        isVerified: false,
        alternatives: [
            { id: 'a', text: 'O(n)', votes: 2, percentage: 10 },
            { id: 'b', text: 'O(log n)', votes: 18, percentage: 90 },
            { id: 'c', text: 'O(n^2)', votes: 0, percentage: 0 },
            { id: 'd', text: 'O(1)', votes: 0, percentage: 0 },
            { id: 'e', text: 'O(n log n)', votes: 0, percentage: 0 },
        ],
        comments: []
    }
];
