import type { PageServerLoad } from './$types';
import { WEBSOCKET_PASSWORD } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
export const load = (async ({ cookies }) => {
	const websocket_password = cookies.get('websocket_password') || '';
	if (websocket_password != WEBSOCKET_PASSWORD) {
		throw redirect(302, '/auth');
	}

	const patterns = import.meta.glob('/static/patterns/*.gcode');

	const patternNames = Object.keys(patterns).map((filePath) =>
		filePath.replace('/static/patterns/', '')
	);

	return { patterns: patternNames, websocket_password };
}) satisfies PageServerLoad;
