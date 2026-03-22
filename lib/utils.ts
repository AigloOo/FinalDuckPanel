export function getTimeParts(): { label: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { label: 'Bonjour', emoji: '🌅' };
  if (hour >= 12 && hour < 18) return { label: 'Bon après-midi', emoji: '☀️' };
  if (hour >= 18 && hour < 22) return { label: 'Bonsoir', emoji: '🌆' };
  return { label: 'Bonne nuit', emoji: '🌙' };
}

export function getGreeting(name: string): string {
  const { emoji, label } = getTimeParts();
  return `${emoji} ${label} ${name} !`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
