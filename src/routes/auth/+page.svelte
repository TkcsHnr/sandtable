<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1 class="text-3xl">Sandtable login:</h1>
<form action="/auth" method="POST" class="flex gap-2 mt-4">
	<div>
        <label class="input input-bordered flex items-center gap-2">
            <i class="fa-solid fa-key"></i>
            <input type="password" name="password" class="grow" />
        </label>
        {#if form?.incorrect}
            <div class="label">
                <span class="label-text text-error">Wrong password</span>
            </div>
        {/if}
    </div>
    <button type="submit" class="btn btn-success" aria-label="submit">
        <i class="fa-solid fa-paper-plane"></i>
    </button>

</form>
