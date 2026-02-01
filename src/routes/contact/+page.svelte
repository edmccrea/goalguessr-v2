<script lang="ts">
  import { fly, scale } from "svelte/transition";
  import { cubicOut, backOut } from "svelte/easing";
  import { onMount } from "svelte";

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let submitted = $state(false);
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>Contact | Top Bins Daily</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden">
  <!-- Animated background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 1s"
    ></div>
  </div>

  <div
    class="relative z-10 py-12 px-6 flex items-center justify-center min-h-screen"
  >
    <div class="w-full max-w-md">
      {#if submitted}
        <!-- Success state -->
        {#if mounted}
          <div
            class="text-center"
            in:scale={{ start: 0.9, duration: 500, easing: backOut }}
          >
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25 mx-auto mb-6"
            >
              <svg
                class="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 class="text-3xl sm:text-4xl font-bold mb-2">Message sent!</h1>
            <p class="text-text-muted text-lg">
              Thanks for reaching out. We'll get back to you if needed.
            </p>
            <a
              href="/"
              class="inline-flex items-center gap-2 mt-8 text-primary hover:text-primary-hover font-medium transition-colors group"
            >
              <svg
                class="w-4 h-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </a>
          </div>
        {/if}
      {:else}
        <!-- Header -->
        {#if mounted}
          <div
            class="mb-8 text-center"
            in:fly={{ y: -20, duration: 500, easing: cubicOut }}
          >
            <div
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25 mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 class="text-3xl sm:text-4xl font-bold">Get in touch</h1>
            <p class="text-text-muted mt-2">
              Got feedback, a bug report, or just want to say hi?
            </p>
          </div>

          <!-- Form Card -->
          <form
            action="https://formsubmit.co/84bd9ad28cfefa04042ff8b401dbb824"
            method="POST"
            class="bg-surface border border-border rounded-2xl p-6 shadow-lg space-y-5"
            in:fly={{ y: 20, duration: 500, delay: 100, easing: cubicOut }}
            onsubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
              });
              submitted = true;
            }}
          >
            <input type="hidden" name="_captcha" value="false" />
            <input type="text" name="_honey" class="hidden" />

            <div
              in:fly={{ y: 10, duration: 400, delay: 150, easing: cubicOut }}
            >
              <label for="name" class="block text-sm font-medium mb-2"
                >Name</label
              >
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="w-5 h-5 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  bind:value={name}
                  required
                  class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div
              in:fly={{ y: 10, duration: 400, delay: 200, easing: cubicOut }}
            >
              <label for="email" class="block text-sm font-medium mb-2"
                >Email</label
              >
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                >
                  <svg
                    class="w-5 h-5 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  bind:value={email}
                  required
                  class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div
              in:fly={{ y: 10, duration: 400, delay: 250, easing: cubicOut }}
            >
              <label for="message" class="block text-sm font-medium mb-2"
                >Message</label
              >
              <div class="relative">
                <div class="absolute top-3.5 left-0 pl-3.5 pointer-events-none">
                  <svg
                    class="w-5 h-5 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <textarea
                  id="message"
                  name="message"
                  bind:value={message}
                  required
                  rows="5"
                  class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y"
                  placeholder="What's on your mind?"
                ></textarea>
              </div>
            </div>

            <div
              in:scale={{
                start: 0.95,
                duration: 400,
                delay: 300,
                easing: backOut,
              }}
            >
              <button
                type="submit"
                class="group w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Send Message
                <svg
                  class="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </form>

          <!-- Back link -->
          <div
            class="mt-8 text-center"
            in:fly={{ y: 10, duration: 400, delay: 350, easing: cubicOut }}
          >
            <a
              href="/"
              class="text-text-muted hover:text-primary transition-colors font-medium inline-flex items-center gap-1 group"
            >
              <svg
                class="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </a>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
