export const countryCodes = [
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
]

export const formatPhoneNumber = (countryCode: string, localNumber: string) => {
  let cleaned = localNumber.trim().replace(/\D/g, '');
  // If user entered number starting with 0 (common in some countries), remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return `${countryCode}${cleaned}`;
}
