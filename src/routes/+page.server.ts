import type { PageServerLoad } from './$types';
export const load = (async () => {
	const patterns = import.meta.glob('/static/patterns/*.gcode' );

	const patternNames = Object.keys(patterns).map((filePath) =>
		filePath.replace('/static/patterns/', '')
	);

    console.log(patternNames);

	return { patterns: patternNames };
}) satisfies PageServerLoad;
