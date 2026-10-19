/** Every released guardian tier has its own film. Unknown cards never borrow another beast. */
export function guardianFilmPath(id?: string): string | undefined {
  if (id === 'tidefin:0') return 'tidefin-mini-v2.mp4';
  const match = /^(tidefin|stoneback|emberwing|steel-eagle|bramblefang):([0-3])$/.exec(id || '');
  return match ? `${match[1]}-${match[2]}-v1.mp4` : undefined;
}
