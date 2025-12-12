export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  coins: number;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    coins: 10,
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    coins: 10,
  },
  {
    id: 3,
    question: "What is 7 × 8?",
    options: ["54", "56", "64", "72"],
    correctAnswer: 1,
    coins: 10,
  },
  {
    id: 4,
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
    coins: 15,
  },
  {
    id: 5,
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3,
    coins: 10,
  },
  {
    id: 6,
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    coins: 10,
  },
  {
    id: 7,
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: 2,
    coins: 15,
  },
  {
    id: 8,
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Silver", "Iron"],
    correctAnswer: 1,
    coins: 10,
  },
  {
    id: 9,
    question: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    coins: 15,
  },
  {
    id: 10,
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Tiger"],
    correctAnswer: 1,
    coins: 10,
  },
];
