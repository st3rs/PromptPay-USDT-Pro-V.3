import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "THB") {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatNumber(amount: number, decimals: number = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string = "th") {
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
    case "AWAITING_PAYMENT":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "PAYMENT_UPLOADED":
    case "UNDER_REVIEW":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "APPROVED":
    case "USDT_SENT":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "REJECTED":
    case "EXPIRED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
