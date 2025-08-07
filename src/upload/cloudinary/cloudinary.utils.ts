// src/upload/cloudinary/cloudinary.utils.ts
export function getUploadFolder(type: 'avatar' | 'post', id: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  return `${type}s/${id}/${yyyy}/${mm}/${dd}`;
}
