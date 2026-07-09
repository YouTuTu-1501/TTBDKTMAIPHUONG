export interface Student {
  id: string;
  name: string;
  dob: string;
  subject: string;
  classRoom: string;
  present: boolean;
  absencesCount?: number;
  tags: string[];
  tuition?: Record<string, { method: 'cash' | 'transfer', date: string }>;
  tuitionNote?: string;
  grades?: Record<string, string>;
}
