import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { WEBSOCKET_PASSWORD } from '$env/static/private';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const password = data.get('password') as string;

		if (password != WEBSOCKET_PASSWORD) {
			return fail(400, { password, incorrect: true});
		}

		cookies.set('websocket_password', password, {
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 30, // 1 month
			path: '/'
		});
		throw redirect(302, '/');
	}
} satisfies Actions;
