// utils/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Alternative simple version if you don't have clsx and tailwind-merge:
// export function cn(...classes) {
//   return classes.filter(Boolean).join(' ');
// }