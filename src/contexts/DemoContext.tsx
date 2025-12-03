import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Fillial, Zayavka, Merchant, Agent, Admin } from 'types/api';

export interface DemoData {
  users: User[];
  fillials: Fillial[];
  applications: Zayavka[];
  merchants: Merchant[];
  agents: Agent[];
  admins: Admin[];
}

interface DemoContextValue {
  demoData: DemoData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

interface DemoProviderProps {
  children: React.ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemoData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading demo data from JSON file...');
      
      // Fetch data from public JSON file
      const response = await fetch('/data/demoData.json');
      
      if (!response.ok) {
        throw new Error('Demo data faylini yuklashda xatolik');
      }
      
      const jsonData = await response.json();
      
      const data: DemoData = {
        users: jsonData.users || [],
        fillials: jsonData.fillials || [],
        applications: jsonData.applications || [],
        merchants: jsonData.merchants || [],
        agents: jsonData.agents || [],
        admins: jsonData.admins || [],
      };

      console.log('Demo data loaded successfully from JSON:', {
        users: data.users.length,
        fillials: data.fillials.length,
        applications: data.applications.length,
        merchants: data.merchants.length,
        agents: data.agents.length,
        admins: data.admins.length,
      });

      setDemoData(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading demo data from JSON:', err);
      setError(err.message || 'Demo ma\'lumotlarni yuklashda xatolik');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoData();
  }, []);

  const value = {
    demoData,
    isLoading,
    error,
    refetch: fetchDemoData,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};
