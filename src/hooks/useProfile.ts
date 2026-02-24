import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SeniorProfile {
  prenom: string;
  age: string;
  enfants: string;
  interets: string;
  profession: string;
  ville: string;
}

const STORAGE_KEY = 'senior_profile';

const defaultProfile: SeniorProfile = {
  prenom: '',
  age: '',
  enfants: '',
  interets: '',
  profession: '',
  ville: '',
};

export function useProfile() {
  const [profile, setProfile] = useState<SeniorProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setProfile(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  const saveProfile = async (newProfile: SeniorProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  };

  return { profile, saveProfile, loaded };
}