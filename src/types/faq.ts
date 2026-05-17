export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  description: string;
  faqs: FAQ[];
}
