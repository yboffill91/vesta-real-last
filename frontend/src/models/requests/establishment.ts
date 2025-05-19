// Tipado para crear establecimiento
import { Establishment } from '../establishment';

export type EstablishmentCreateInput = Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>;
