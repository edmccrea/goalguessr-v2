<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut, elasticOut } from 'svelte/easing';
	import { Spring } from 'svelte/motion';
	import { inView } from 'motion';
	import { PUBLIC_FEATURE_LEADERBOARD } from '$env/static/public';
	import GoalAnimation from '$lib/components/animation/GoalAnimation.svelte';
	import { sampleAnimation } from '$lib/sample-animation';
	import favicon from '$lib/assets/favicon.svg';

	const showLeaderboard = PUBLIC_FEATURE_LEADERBOARD === 'true';

	let mounted = $state(false);
	let howItWorksVisible = $state(false);
	let featuresVisible = $state(false);
	let statsVisible = $state(false);

	// Spring values for interactive card tilt
	let cardRotateX = new Spring(0, { stiffness: 0.1, damping: 0.4 });
	let cardRotateY = new Spring(0, { stiffness: 0.1, damping: 0.4 });
	let cardScale = new Spring(1, { stiffness: 0.2, damping: 0.5 });

	// Stats counter animation
	let goalsCount = $state(0);
	let playersCount = $state(0);
	let daysCount = $state(0);

	function handleCardMouseMove(e: MouseEvent) {
		const card = e.currentTarget as HTMLElement;
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		cardRotateX.target = (y - centerY) / 20;
		cardRotateY.target = (centerX - x) / 20;
		cardScale.target = 1.02;
	}

	function handleCardMouseLeave() {
		cardRotateX.target = 0;
		cardRotateY.target = 0;
		cardScale.target = 1;
	}

	function animateCounter(target: number, setter: (n: number) => void, duration = 2000) {
		const start = performance.now();
		const step = (now: number) => {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setter(Math.floor(eased * target));
			if (progress < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}

	onMount(() => {
		mounted = true;

		// Setup scroll-triggered animations
		inView('.how-it-works-section', () => {
			howItWorksVisible = true;
		}, { margin: '-100px' });

		inView('.features-section', () => {
			featuresVisible = true;
		}, { margin: '-100px' });

		inView('.stats-section', () => {
			if (!statsVisible) {
				statsVisible = true;
				animateCounter(500, (n) => goalsCount = n);
				animateCounter(2500, (n) => playersCount = n);
				animateCounter(365, (n) => daysCount = n);
			}
		}, { margin: '-100px' });
	});
</script>

<svelte:head>
	<title>Goal Guessr - The Daily Football Challenge</title>
</svelte:head>

<!-- Hero Section -->
<div class="relative min-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full"></div>
	</div>

	<div class="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 py-12 max-w-6xl mx-auto w-full relative z-10">
		<!-- Left: Text Content -->
		<div class="flex-1 text-center lg:text-left max-w-xl">
			{#if mounted}
				<div in:fly={{ y: 20, duration: 600, delay: 0, easing: cubicOut }}>
					<span class="inline-flex items-center gap-2 text-primary font-medium text-sm mb-4 px-3 py-1.5 bg-primary/10 rounded-full">
						<span class="relative flex h-2 w-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
							<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
						</span>
						New goals every day
					</span>
				</div>

				<h1
					class="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight"
					in:fly={{ y: 30, duration: 700, delay: 100, easing: cubicOut }}
				>
					Think you know
					<span class="text-primary relative">
						football?
						<svg class="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
							<path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
						</svg>
					</span>
				</h1>

				<p
					class="text-text-muted text-lg mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
					in:fly={{ y: 30, duration: 700, delay: 200, easing: cubicOut }}
				>
					Iconic goals, animated. Name them if you can.
				</p>

				<div
					class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
					in:fly={{ y: 30, duration: 700, delay: 300, easing: cubicOut }}
				>
					<button
						onclick={() => goto('/play/1')}
						class="group relative bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
					>
						<span class="relative z-10 flex items-center justify-center gap-2">
							Play Today's Game
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
								<path d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</span>
					</button>
					<button
						onclick={() => goto('/editor')}
						class="group bg-surface hover:bg-surface-dim border border-border px-8 py-4 rounded-xl font-medium transition-all hover:border-primary/30"
					>
						<span class="flex items-center justify-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted group-hover:text-primary transition-colors">
								<path d="M12 20h9"/>
								<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
							</svg>
							Create a Goal
						</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- Right: Animation Preview -->
		{#if mounted}
			<div
				class="flex-1 w-full max-w-lg perspective-1000"
				in:scale={{ start: 0.9, duration: 800, delay: 400, easing: backOut }}
			>
				<div
					class="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden transition-shadow hover:shadow-3xl"
					style="transform: rotateX({cardRotateX.current}deg) rotateY({cardRotateY.current}deg) scale({cardScale.current}); transform-style: preserve-3d;"
					onmousemove={handleCardMouseMove}
					onmouseleave={handleCardMouseLeave}
					role="presentation"
				>
					<!-- Window chrome -->
					<div class="bg-gradient-to-b from-surface-dim to-surface px-4 py-3 border-b border-border flex items-center gap-3">
						<div class="flex gap-2">
							<div class="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer"></div>
							<div class="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
							<div class="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer"></div>
						</div>
						<div class="flex-1 flex justify-center">
							<span class="text-xs text-text-muted bg-surface-dim px-3 py-1 rounded-md">Round 1 of 3</span>
						</div>
						<div class="w-14"></div>
					</div>

					<!-- Animation area -->
					<div class="aspect-[100/65] bg-gradient-to-b from-surface to-surface-dim/30">
						<GoalAnimation animation={sampleAnimation} autoPlay={true} />
					</div>

					<!-- Input preview -->
					<div class="p-4 border-t border-border bg-surface">
						<div class="flex gap-2">
							<div class="flex-1 h-11 bg-surface-dim rounded-lg flex items-center px-3 text-text-muted text-sm border border-transparent hover:border-primary/20 transition-colors cursor-pointer">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 opacity-50">
									<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
									<line x1="4" y1="22" x2="4" y2="15"/>
								</svg>
								Team?
							</div>
							<div class="flex-1 h-11 bg-surface-dim rounded-lg flex items-center px-3 text-text-muted text-sm border border-transparent hover:border-primary/20 transition-colors cursor-pointer">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 opacity-50">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
								Year?
							</div>
							<div class="flex-1 h-11 bg-surface-dim rounded-lg flex items-center px-3 text-text-muted text-sm border border-transparent hover:border-primary/20 transition-colors cursor-pointer">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 opacity-50">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
									<circle cx="12" cy="7" r="4"/>
								</svg>
								Scorer?
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

</div>

<!-- How It Works -->
<section class="how-it-works-section py-24 px-6 bg-surface border-y border-border relative overflow-hidden">
	<!-- Decorative grid pattern -->
	<div class="absolute inset-0 opacity-[0.02]" style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><g fill=%22none%22 stroke=%22%23000%22 stroke-width=%221%22><path d=%22M0 0h60v60H0z%22/></g></svg>');"></div>

	<div class="max-w-5xl mx-auto relative">
		{#if howItWorksVisible}
			<div in:fly={{ y: 30, duration: 600, easing: cubicOut }}>
				<h2 class="text-3xl sm:text-4xl font-bold text-center mb-4">How It Works</h2>
				<p class="text-text-muted text-center mb-16 max-w-2xl mx-auto text-lg">Three simple steps to test your football knowledge every day</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8 lg:gap-12">
				{#each [
					{ icon: 'play', title: 'Watch', desc: 'Watch the animated diagram showing player movements and passes leading to an iconic goal', delay: 100 },
					{ icon: 'question', title: 'Guess', desc: 'Identify the team, year, and goalscorer. The faster you answer, the more bonus points you earn', delay: 200 },
					{ icon: 'trophy', title: 'Compete', desc: 'Compare your scores on the leaderboard and track your improvement over time', delay: 300 }
				] as step, i (step.title)}
					<div
						class="group text-center"
						in:fly={{ y: 40, duration: 600, delay: step.delay, easing: cubicOut }}
					>
						<div class="relative mb-6">
							<div class="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:rotate-3">
								{#if step.icon === 'play'}
									<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
										<circle cx="12" cy="12" r="10"/>
										<polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
									</svg>
								{:else if step.icon === 'question'}
									<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
										<circle cx="12" cy="12" r="10"/>
										<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
										<path d="M12 17h.01"/>
									</svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
										<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
										<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
										<path d="M4 22h16"/>
										<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
										<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
										<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
									</svg>
								{/if}
							</div>
							<span class="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">{i + 1}</span>
						</div>
						<h3 class="font-bold text-xl mb-3">{step.title}</h3>
						<p class="text-text-muted leading-relaxed">{step.desc}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Stats Section -->
<section class="stats-section py-20 px-6 bg-gradient-to-b from-background to-surface-dim/30">
	<div class="max-w-4xl mx-auto">
		{#if statsVisible}
			<div class="grid grid-cols-3 gap-8" in:fade={{ duration: 400 }}>
				<div class="text-center" in:fly={{ y: 30, duration: 600, delay: 0, easing: cubicOut }}>
					<div class="text-4xl sm:text-5xl font-bold text-primary mb-2">{goalsCount}+</div>
					<div class="text-text-muted text-sm uppercase tracking-wide">Goals Created</div>
				</div>
				<div class="text-center" in:fly={{ y: 30, duration: 600, delay: 100, easing: cubicOut }}>
					<div class="text-4xl sm:text-5xl font-bold text-primary mb-2">{playersCount}+</div>
					<div class="text-text-muted text-sm uppercase tracking-wide">Players</div>
				</div>
				<div class="text-center" in:fly={{ y: 30, duration: 600, delay: 200, easing: cubicOut }}>
					<div class="text-4xl sm:text-5xl font-bold text-primary mb-2">{daysCount}</div>
					<div class="text-text-muted text-sm uppercase tracking-wide">Days Running</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Features -->
<section class="features-section py-24 px-6">
	<div class="max-w-5xl mx-auto">
		{#if featuresVisible}
			<div in:fly={{ y: 30, duration: 600, easing: cubicOut }}>
				<h2 class="text-3xl sm:text-4xl font-bold text-center mb-4">Why You'll Love It</h2>
				<p class="text-text-muted text-center mb-16 max-w-2xl mx-auto text-lg">Everything you need for the ultimate football trivia experience</p>
			</div>

			<div class="grid sm:grid-cols-2 gap-6">
				{#each [
					{ emoji: '🎯', title: 'Daily Challenge', desc: 'New goals every day. Come back daily to test your knowledge and climb the leaderboard.', delay: 100 },
					{ emoji: '⚡', title: 'Speed Bonus', desc: 'Quick thinking pays off. Answer faster to earn bonus points on top of your correct guesses.', delay: 200 },
					{ emoji: '🏟️', title: 'Iconic Moments', desc: 'From World Cup finals to last-minute winners, relive the greatest goals in football history.', delay: 300 },
					{ emoji: '✏️', title: 'Community Created', desc: 'Create and submit your own goal animations. Share memorable moments with the community.', delay: 400 }
				] as feature (feature.title)}
					<div
						class="group bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
						in:fly={{ y: 40, duration: 600, delay: feature.delay, easing: cubicOut }}
					>
						<div class="w-12 h-12 flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110">{feature.emoji}</div>
						<h3 class="font-bold text-lg mb-2">{feature.title}</h3>
						<p class="text-text-muted leading-relaxed">{feature.desc}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- CTA -->
<section class="py-24 px-6 bg-gradient-to-br from-primary via-primary to-primary-hover text-white relative overflow-hidden">
	<!-- Decorative elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>

		<!-- Football pattern -->
		<svg class="absolute top-10 left-10 w-20 h-20 text-white/10" viewBox="0 0 100 100">
			<circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2" fill="none"/>
			<path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" stroke-width="1"/>
		</svg>
		<svg class="absolute bottom-10 right-10 w-16 h-16 text-white/10" viewBox="0 0 100 100">
			<circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2" fill="none"/>
			<path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" stroke-width="1"/>
		</svg>
	</div>

	<div class="max-w-3xl mx-auto text-center relative z-10">
		<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Ready to play?</h2>
		<p class="text-white/80 mb-10 text-lg max-w-xl mx-auto">Today's game is waiting. Three goals, three chances to prove your football expertise.</p>
		<button
			onclick={() => goto('/play/1')}
			class="group bg-white text-primary hover:bg-white/95 px-12 py-5 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1"
		>
			<span class="flex items-center gap-3">
				Start Playing
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</span>
		</button>
	</div>
</section>

<!-- Footer -->
<footer class="py-12 px-6 border-t border-border bg-surface">
	<div class="max-w-5xl mx-auto">
		<div class="flex flex-col sm:flex-row items-center justify-between gap-6">
			<div class="flex items-center gap-3">
				<img src={favicon} alt="Goal Guessr" class="w-10 h-10" />
				<span class="font-bold text-lg">Goal Guessr</span>
			</div>

			<div class="flex gap-8 text-sm">
				<a href="/play" class="text-text-muted hover:text-primary transition-colors">Play</a>
				{#if showLeaderboard}
					<a href="/leaderboard" class="text-text-muted hover:text-primary transition-colors">Leaderboard</a>
				{/if}
				<a href="/editor" class="text-text-muted hover:text-primary transition-colors">Create</a>
				<a href="/profile" class="text-text-muted hover:text-primary transition-colors">Profile</a>
			</div>
		</div>

		<div class="mt-8 pt-8 border-t border-border text-center text-text-muted text-sm">
			Test your football knowledge, one goal at a time.
		</div>
	</div>
</footer>

<style>
	.perspective-1000 {
		perspective: 1000px;
	}

	.bg-gradient-radial {
		background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
	}

	/* Global styles for Tailwind hover utilities */
	:global(.shadow-3xl) {
		box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.2);
	}
</style>
