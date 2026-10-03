// Check release time in the database on every request; never trust client time.
export const publicEpisodeQuery = `SELECT id,title,body,asset_url,public_at
FROM dll.content WHERE id=$1 AND kind='episode' AND approved_at IS NOT NULL
AND member_at<=now() AND public_at IS NOT NULL AND public_at<=now()
AND asset_url IS NOT NULL`;
