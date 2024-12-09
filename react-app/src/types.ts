export interface Submission {
  id: number;
  form_id: number;
  form_name?: string;
  submission_data: Record<string, string | string[]>;
  submitted_at: string;
}
