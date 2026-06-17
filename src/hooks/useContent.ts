import { useQuery } from '@tanstack/react-query';
import { getProjects, getServices, getSettings, getTestimonials } from '../services/contentService';

export function useSiteSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: getSettings });
}

export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: getServices });
}

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects });
}

export function useTestimonials() {
  return useQuery({ queryKey: ['testimonials'], queryFn: getTestimonials });
}
