export interface FormField {
  locator: string;
  value: string;
  name: string;
}

export interface KycData {
  firstName: string;
  lastName: string;
  dateOfBirth: { year: string; month: string; day: string };
  countryOfResidence: string;
  residencyStatus: string;
  nationalId: string;
}
