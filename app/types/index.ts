export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Step {
  title: string;
  description: string;
}

export interface Testimonial {
  content: string;
  name: string;
  title: string;
  avatar: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  buttonText: string;
  link: string;
}

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}
