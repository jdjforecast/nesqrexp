import { locales } from '@/middleware';
import enDictionary from './en.json';
import esDictionary from './es.json';

export interface Dictionary {
  common: {
    appName: string;
    loading: string;
    error: string;
    success: string;
  };
  homepage: {
    title: string;
    subtitle: string;
    welcome: string;
    registerPrompt: string;
    register: string;
    loginPrompt: string;
  };
  auth: {
    register: string;
    registerTitle: string;
    login: string;
    signIn: string;
    name: string;
    company: string;
    email: string;
    password: string;
    profilePhoto: string;
    uploadPhoto: string;
    continue: string;
    processing: string;
    requiredFields: string;
  };
  verification: {
    title: string;
    description: string;
    code: string;
    codePlaceholder: string;
    verify: string;
    verifying: string;
  };
  dashboard: {
    greeting: string;
    welcome: string;
    coins: string;
    scanQR: string;
    scanDescription: string;
    viewCart: string;
    cartDescription: string;
    featuredProducts: string;
    scanToEarn: string;
    home: string;
    scan: string;
    cart: string;
    profile: string;
  };
  scanner: {
    title: string;
    instruction: string;
    permissionDenied: string;
    enableCamera: string;
  };
  cart: {
    title: string;
    empty: string;
    startShopping: string;
    itemCount: string;
    totalCoins: string;
    checkout: string;
  };
  checkout: {
    title: string;
    summary: string;
    items: string;
    totalCoins: string;
    confirm: string;
    processing: string;
  };
  success: {
    title: string;
    message: string;
    orderNumber: string;
    earnedCoins: string;
    viewOrders: string;
    continueShopping: string;
  };
  profile: {
    title: string;
    personalInfo: string;
    name: string;
    company: string;
    email: string;
    totalCoins: string;
    update: string;
    orders: string;
    logout: string;
  };
  nav: {
    home: string;
    scanner: string;
    cart: string;
    profile: string;
  };
  footer: {
    allRightsReserved: string;
  };
  [key: string]: any;
}

const dictionaries: Record<string, Dictionary> = {
  en: enDictionary as unknown as Dictionary,
  es: esDictionary as unknown as Dictionary,
};

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  // Make sure locale is one of the supported ones, or fall back to default
  if (!locales.includes(locale)) {
    locale = 'es'; // Default to Spanish
  }
  return dictionaries[locale];
}; 