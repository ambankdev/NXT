/**
 * Validation rules shared by the client forms and re-applied server-side in
 * api/. The client copy exists for fast feedback only — the API never trusts it
 * and revalidates everything, because anything running in a browser can be
 * bypassed with a single curl command.
 */

/** Max CV size. Vercel caps a serverless request body at 4.5 MB and base64
 *  encoding inflates a file by ~33%, so 3 MB of PDF is the practical ceiling. */
export const MAX_CV_BYTES = 3 * 1024 * 1024;

export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;

export function validateFullName(v: string): string | undefined {
  if (v.trim().length < 2) return 'Please enter your full name';
  if (v.trim().length > 100) return 'Please keep this under 100 characters';
}

export function validateMobile(v: string): string | undefined {
  const t = v.trim();
  if (!/^[\d+\-()\s]{6,20}$/.test(t)) return 'Please enter a valid mobile number';
}

export function validateEmail(v: string): string | undefined {
  const t = v.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Please enter a valid email address';
  if (t.length > 254) return 'Please enter a valid email address';
}

export function validateSubject(v: string): string | undefined {
  if (v.trim().length < 2) return 'Please enter a subject';
  if (v.trim().length > 150) return 'Please keep the subject under 150 characters';
}

export function validateMessage(v: string): string | undefined {
  if (v.trim().length < 10) return 'Please tell us a bit more (at least 10 characters)';
  if (v.trim().length > 5000) return 'Please keep your message under 5000 characters';
}

export function validateCvFile(file: File | null): string | undefined {
  if (!file) return 'Please attach your CV';
  if (file.size === 0) return 'That file appears to be empty';
  if (file.size > MAX_CV_BYTES) return 'Your CV must be 3 MB or smaller';
  const name = file.name.toLowerCase();
  const extOk = ALLOWED_CV_EXTENSIONS.some((e) => name.endsWith(e));
  if (!extOk) return 'Please attach a PDF, DOC or DOCX file';
}

/** Reads a File as a bare base64 string (no data: prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
