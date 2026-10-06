// Check release time in the database on every request; never trust client time.
export const publicEpisodeQuery = `SELECT id,title,body,asset_url,public_at
FROM dll.content WHERE id=$1 AND kind='episode' AND approved_at IS NOT NULL
AND member_at<=now() AND public_at IS NOT NULL AND public_at<=now()
AND asset_url IS NOT NULL`;

// List only deliberately published library content; never household video requests.
export const publicStoryVaultQuery = `SELECT id,title,kind,body
FROM dll.content WHERE approved_at IS NOT NULL AND member_at<=now()
AND public_at IS NOT NULL AND public_at<=now()
AND (kind='story' OR (kind='episode' AND asset_url IS NOT NULL))
ORDER BY title,id`;
