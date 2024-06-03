export const generateInitials = (name?: string): string => {
  if (!name || name.trim().length === 0) return "";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  } else if (words.length >= 2) {
    return `${words[0][0].toUpperCase()}${words[1][0].toUpperCase()}`;
  }

  return "";
};
