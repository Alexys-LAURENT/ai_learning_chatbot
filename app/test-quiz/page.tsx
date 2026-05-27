'use client';

import QuizComponent from '@/components/QuizComponent';
import type { QuizQuestion } from '@/app/tools/displayQuizTool';

const testQuestions: QuizQuestion[] = [
  {
    question:
      'Quelle est la capital de la France et quel est le nom complet de cette ville magnifique qui est connue mondialement pour la tour Eiffel ?',
    choices: [
      'Paris, la Ville Lumière, capitale de la France depuis des siècles et centre culturel mondial reconnu',
      'Marseille, la deuxième plus grande ville de France avec un port stratégique important en Méditerranée',
      'Lyon, un important centre urbain situé dans la région Auvergne-Rhône-Alpes connu pour ses industries et son architecture',
      'Toulouse, ville du sud-ouest, capital de la région Occitanie et centre aéronautique européen majeur',
    ],
    correctAnswerIndex: 0,
    explanation:
      'Paris est la capitale de la France depuis des siècles. Elle est le cœur politique, culturel et économique du pays, accueillant le gouvernement français, le Parlement et de nombreuses institutions culturelles mondialement célèbres. Son architecture distinctive et ses monuments iconiques en font une destination touristique incontournable.',
  },
  {
    question:
      'Lequel de ces énoncés décrit correctement le processus de photosynthèse et son importance pour la vie sur Terre ?',
    choices: [
      'La photosynthèse est le processus par lequel les plantes convertissent la lumière solaire en énergie chimique, produisant de l\'oxygène et du glucose qui sont essentiels pour la vie sur Terre',
      'La photosynthèse est le processus par lequel les animaux transforment la nourriture en énergie utilisable pour le mouvement et les fonctions biologiques',
      'La photosynthèse est un processus qui se produit uniquement chez les animaux aquatiques pour adapter leur métabolisme à l\'environnement',
      'La photosynthèse est le processus de décomposition des matières organiques mortes en nutriments simples',
    ],
    correctAnswerIndex: 0,
    explanation:
      'La photosynthèse est un processus fondamental chez les plantes et les algues. Elle utilise l\'énergie lumineuse du soleil pour convertir le dioxyde de carbone et l\'eau en glucose (sucre) et oxygène. Le glucose fournit l\'énergie et les matériaux de construction pour la croissance des plantes, tandis que l\'oxygène produit est essentiel pour la respiration de la plupart des organismes vivants, y compris les humains.',
  },
  {
    question:
      'Dans le contexte de la Révolution française, quels étaient les trois états généraux et comment étaient-ils organisés dans la hiérarchie sociale de l\'époque ?',
    choices: [
      'Le clergé, la noblesse et le tiers état, représentant respectivement l\'église, l\'aristocratie et la population générale incluant paysans, bourgeois et travailleurs',
      'Le roi, les ministres et les généraux militaires constituant le pouvoir exécutif et les forces de défense du royaume',
      'Les propriétaires terriens, les marchands et les artisans formant les trois classes économiques principales de la société',
      'L\'armée, la police et la magistrature organisant le contrôle administratif et judiciaire du territoire',
    ],
    correctAnswerIndex: 0,
    explanation:
      'Les trois états généraux de la société française d\'avant la Révolution étaient le Clergé (premier état), la Noblesse (deuxième état) et le Tiers État (troisième état). Le Tiers État représentait la grande majorité de la population, y compris les paysans, les bourgeois, les artisans et autres travailleurs. Cette organisation inégale, où le Tiers État supportait la majorité des impôts sans représentation politique adéquate, a contribué aux tensions qui ont conduit à la Révolution française de 1789.',
  },
];

export default function TestQuizPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <QuizComponent subject="Histoire & Sciences Générales (Textes longs)" questions={testQuestions} />
    </div>
  );
}
