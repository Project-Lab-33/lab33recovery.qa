import { getCountryByIso, COUNTRIES } from "@/lib/countries";

export const getCountryByName = (name: string) => {
    if (!name) return null;
    return COUNTRIES.find(c =>
        c.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(c.name.toLowerCase())
    );
};

export const formatNationality = (str: string): string => {
    if (!str) return 'N/A';
    // If it's a 2-letter ISO code, look it up
    if (str.length === 2) {
        const country = getCountryByIso(str);
        if (country) return country.name;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const calculateAge = (birthdate: string): number | null => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

export const AGE_RANGES = [
    { id: '18-24', label: '18–24', min: 18, max: 24 },
    { id: '25-34', label: '25–34', min: 25, max: 34 },
    { id: '35-44', label: '35–44', min: 35, max: 44 },
    { id: '45-54', label: '45–54', min: 45, max: 54 },
    { id: '55+', label: '55+', min: 55, max: 200 },
];

export const ageMatchesRange = (age: number | null, range: string): boolean => {
    if (age === null) return false;
    const bucket = AGE_RANGES.find(r => r.id === range);
    if (!bucket) return false;
    return age >= bucket.min && age <= bucket.max;
};
