export interface Argument {
  id: string;
  text: string;
  argument?:string,
  category: string;
}

export interface EssayArgument {
  id: string;
  content: string;
  references?: string;
}

export interface EssaySubPart {
  id: string;
  title: string;
  arguments: EssayArgument[];
}

export interface EssayPart {
  id: string;
  title: string;
  subParts: EssaySubPart[];
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

export const CATEGORIES = ['Littérature', 'Art', 'Société', 'Philosophie', 'Langue','Animaux'];
