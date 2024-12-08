export interface Submission {
  id: number;
  form_id: number;
  submission_data: Record<string, string | string[]>;
  submitted_at: string;
}
