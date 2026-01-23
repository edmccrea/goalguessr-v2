<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
	<div class="text-center">
		<h1 class="text-5xl md:text-6xl font-bold text-primary mb-4">Goal Guessr</h1>
		<p class="text-xl text-text-muted mb-10">Guess the goal from the animated diagram</p>

		<button
			onclick={() => goto('/play')}
			class="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg"
		>
			Play Today's Game
		</button>

		<div class="mt-12 flex gap-8 justify-center">
			<a href="/leaderboard" class="text-text-muted hover:text-primary transition-colors">Leaderboard</a>
			<a href="/editor" class="text-text-muted hover:text-primary transition-colors">Create a Goal</a>
		</div>
	</div>
</div>
