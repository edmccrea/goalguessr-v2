<script lang="ts">
	import { goto } from '$app/navigation';
	import GoalAnimation from '$lib/components/animation/GoalAnimation.svelte';
	import { sampleAnimation } from '$lib/sample-animation';
</script>

<!-- Hero Section -->
<div class="min-h-[calc(100vh-3.5rem)] flex flex-col">
	<div class="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 py-12 max-w-6xl mx-auto w-full">
		<!-- Left: Text Content -->
		<div class="flex-1 text-center lg:text-left max-w-xl">
			<p class="text-primary font-medium text-sm mb-4">The daily football challenge</p>
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-4">
				Can you guess the goal?
			</h1>
			<p class="text-text-muted mb-6 max-w-md mx-auto lg:mx-0">
				Watch animated diagrams of iconic goals and guess the team, year, and scorer. Three rounds daily.
			</p>

			<div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
				<button
					onclick={() => goto('/play/1')}
					class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
				>
					Play Today's Game
				</button>
				<button
					onclick={() => goto('/editor')}
					class="bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-lg font-medium transition-all"
				>
					Create a Goal
				</button>
			</div>
		</div>

		<!-- Right: Animation Preview -->
		<div class="flex-1 w-full max-w-lg">
			<div class="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
				<div class="bg-surface-dim px-4 py-2 border-b border-border flex items-center gap-2">
					<div class="w-3 h-3 rounded-full bg-red-400"></div>
					<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
					<div class="w-3 h-3 rounded-full bg-green-400"></div>
					<span class="text-xs text-text-muted ml-2">Round 1 of 3</span>
				</div>
				<div class="aspect-[100/65]">
					<GoalAnimation animation={sampleAnimation} autoPlay={true} />
				</div>
				<div class="p-4 border-t border-border">
					<div class="flex gap-2">
						<div class="flex-1 h-10 bg-surface-dim rounded-lg flex items-center px-3 text-text-muted text-sm">Which team?</div>
						<div class="flex-1 h-10 bg-surface-dim rounded-lg flex items-center px-3 text-text-muted text-sm">Year?</div>
						<div class="flex-1 h-10 bg-surface-dim rounded-lg flex items-center px-3 text-text-muted text-sm">Scorer?</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div class="pb-8 flex justify-center">
		<div class="animate-bounce text-text-muted">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 5v14M5 12l7 7 7-7"/>
			</svg>
		</div>
	</div>
</div>

<!-- How It Works -->
<section class="py-20 px-6 bg-surface border-y border-border">
	<div class="max-w-5xl mx-auto">
		<h2 class="text-3xl font-bold text-center mb-4">How It Works</h2>
		<p class="text-text-muted text-center mb-12 max-w-2xl mx-auto">Three simple steps to test your football knowledge every day</p>

		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<circle cx="12" cy="12" r="10"/>
						<polygon points="10 8 16 12 10 16 10 8"/>
					</svg>
				</div>
				<h3 class="font-bold text-lg mb-2">1. Watch</h3>
				<p class="text-text-muted text-sm leading-relaxed">Watch the animated diagram showing player movements and passes leading to a goal</p>
			</div>

			<div class="text-center">
				<div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<circle cx="12" cy="12" r="10"/>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
						<path d="M12 17h.01"/>
					</svg>
				</div>
				<h3 class="font-bold text-lg mb-2">2. Guess</h3>
				<p class="text-text-muted text-sm leading-relaxed">Identify the team, year, and goalscorer. The faster you answer, the more points you earn</p>
			</div>

			<div class="text-center">
				<div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
						<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
						<path d="M4 22h16"/>
						<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
						<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
						<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
					</svg>
				</div>
				<h3 class="font-bold text-lg mb-2">3. Compete</h3>
				<p class="text-text-muted text-sm leading-relaxed">Compare your scores on the leaderboard and track your stats over time</p>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="py-20 px-6">
	<div class="max-w-5xl mx-auto">
		<h2 class="text-3xl font-bold text-center mb-12">Why You'll Love It</h2>

		<div class="grid sm:grid-cols-2 gap-6">
			<div class="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
				<div class="text-2xl mb-3">🎯</div>
				<h3 class="font-bold mb-2">Daily Challenge</h3>
				<p class="text-text-muted text-sm">New goals every day. Come back daily to test your knowledge and climb the leaderboard.</p>
			</div>

			<div class="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
				<div class="text-2xl mb-3">⚡</div>
				<h3 class="font-bold mb-2">Speed Bonus</h3>
				<p class="text-text-muted text-sm">Quick thinking pays off. Answer faster to earn bonus points on top of your correct guesses.</p>
			</div>

			<div class="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
				<div class="text-2xl mb-3">🏟️</div>
				<h3 class="font-bold mb-2">Iconic Moments</h3>
				<p class="text-text-muted text-sm">From World Cup finals to last-minute winners, relive the greatest goals in football history.</p>
			</div>

			<div class="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
				<div class="text-2xl mb-3">✏️</div>
				<h3 class="font-bold mb-2">Community Created</h3>
				<p class="text-text-muted text-sm">Create and submit your own goal animations. Share memorable moments with the community.</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="py-16 px-6 bg-primary text-white">
	<div class="max-w-3xl mx-auto text-center">
		<h2 class="text-3xl font-bold mb-4">Ready to play?</h2>
		<p class="text-white/80 mb-8">Today's game is waiting. Three goals, three chances to prove your football expertise.</p>
		<button
			onclick={() => goto('/play/1')}
			class="bg-white text-primary hover:bg-white/90 px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
		>
			Start Playing
		</button>
	</div>
</section>

<!-- Footer -->
<footer class="py-8 px-6 border-t border-border">
	<div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
		<div class="text-text-muted text-sm">Goal Guessr</div>
		<div class="flex gap-6 text-sm">
			<a href="/leaderboard" class="text-text-muted hover:text-primary transition-colors">Leaderboard</a>
			<a href="/editor" class="text-text-muted hover:text-primary transition-colors">Create</a>
			<a href="/profile" class="text-text-muted hover:text-primary transition-colors">Profile</a>
		</div>
	</div>
</footer>
