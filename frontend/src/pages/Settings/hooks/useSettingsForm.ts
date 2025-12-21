import { useState, useEffect, useCallback } from 'react';
import type { Workspace, OpeningHour, MealSchedules } from '@/types';

export function useSettingsForm(
  workspace: Workspace | null,
  onUpdate: (data: Partial<Workspace>) => Promise<void>
) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    timezone: 'UTC',
    currency: 'USD',
    logoUrl: '',
    coverUrl: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    primaryColor: '#007AFF',
    defaultLanguage: 'en',
    defaultTaxRate: '0.00',
    contactEmail: '',
    contactPhone: '',
    openingHours: [
      { day: 'mon', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'tue', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'wed', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'thu', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'fri', isOpen: true, openTime: '09:00', closeTime: '23:00' },
      { day: 'sat', isOpen: true, openTime: '10:00', closeTime: '23:00' },
      { day: 'sun', isOpen: false, openTime: '10:00', closeTime: '22:00' },
    ] as OpeningHour[],
    mealSchedules: {
      breakfast: { enabled: true, startTime: '08:00', endTime: '11:00' },
      brunch: { enabled: false, startTime: '11:00', endTime: '13:00' },
      lunch: { enabled: true, startTime: '13:00', endTime: '16:00' },
      merienda: { enabled: false, startTime: '17:00', endTime: '19:00' },
      dinner: { enabled: true, startTime: '20:00', endTime: '23:00' },
    } as MealSchedules,
  });

  useEffect(() => {
    if (workspace) {
      const timeout = setTimeout(() => {
        setFormData(prev => {
          const newData = {
            name: workspace.name || '',
            slug: workspace.slug || '',
            description: workspace.description || '',
            timezone: workspace.timezone || 'UTC',
            currency: workspace.currency || 'USD',
            logoUrl: workspace.logoUrl || '',
            coverUrl: workspace.coverUrl || '',
            address: workspace.address || '',
            city: workspace.city || '',
            state: workspace.state || '',
            postalCode: workspace.postalCode || '',
            country: workspace.country || '',
            websiteUrl: workspace.websiteUrl || '',
            instagramUrl: workspace.instagramUrl || '',
            facebookUrl: workspace.facebookUrl || '',
            primaryColor: workspace.primaryColor || '#007AFF',
            defaultLanguage: workspace.defaultLanguage || 'en',
            defaultTaxRate: String(workspace.defaultTaxRate || '0.00'),
            contactEmail: workspace.contactEmail || '',
            contactPhone: workspace.contactPhone || '',
            openingHours: workspace.settings?.openingHours || prev.openingHours,
            mealSchedules: workspace.settings?.mealSchedules || prev.mealSchedules,
          };
          
          // Simple equality check to prevent unnecessary updates
          if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
          return newData;
        });
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [workspace]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked !== undefined ? checked : value 
    }));
  }, []);

  const handleScheduleChange = useCallback((day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      openingHours: prev.openingHours.map(h => 
        h.day === day ? { ...h, [field]: value } : h
      )
    }));
  }, []);

  const handleMealChange = useCallback((meal: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      mealSchedules: {
        ...prev.mealSchedules,
        [meal]: {
          ...prev.mealSchedules[meal as keyof MealSchedules],
          [field]: value
        }
      }
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    await onUpdate({
      id: workspace.id,
      ...formData,
      defaultTaxRate: parseFloat(formData.defaultTaxRate) || 0
    } as Partial<Workspace>);
  }, [workspace, formData, onUpdate]);

  return {
    formData,
    handleChange,
    handleScheduleChange,
    handleMealChange,
    handleSubmit,
  };
}

