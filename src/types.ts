export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  review: string;
  verified: boolean;
}

export interface VideoReview {
  id: string;
  name: string;
  role: string;
  thumbnail: string;
  videoUrl: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ScreenshotSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}
