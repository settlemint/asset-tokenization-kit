import { z } from 'zod';

const PIN_CODE_REGEX = /^\d+$/;

export const pinCodeSchema = z
  .string()
  .length(6, { message: 'PIN code must be exactly 6 digits' })
  .regex(PIN_CODE_REGEX, 'PIN code must contain only numbers');
