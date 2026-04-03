export interface Argument {
  id: string;
  text: string;
  category: string;
}

export interface EssayPart {
  id: string;
  title: string;
  subParts: {
    id: string;
    content: string;
    references?: string;
    argumentId?: string;
  }[];
}

export interface EssayPlan {
  subject: string;
  introduction: {
    accroche: string;
    problematique: string;
    annoncePlan: string;
  };
  development: EssayPart[];
  conclusion: {
    synthese: string;
    reponse: string;
    ouverture: string;
  };
}

export const CATEGORIES = ['Littérature', 'Art', 'Société', 'Philosophie', 'Langue'];
