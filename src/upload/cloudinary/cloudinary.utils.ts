export function getUploadFolder(type: 'avatar' | 'post', id?: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const datePath = `${yyyy}/${mm}/${dd}`;

  if (id) {
    return `${type}s/${id}/${datePath}`;
  }

  return `${type}s/${datePath}`;
}
