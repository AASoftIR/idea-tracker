<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { fade, slide } from 'svelte/transition';
    import { auth } from '../../stores/auth';
    import { user } from '../../stores/user';

    // jsdoc
    const API = "http://localhost:5000";

    // jsdoc
    let isLogin = true;

    // jsdoc
    let email = '';

    // jsdoc
    let password = '';

    // jsdoc
    let username = '';

    // jsdoc
    let errorMessage = '';

    // jsdoc
    let isLoading = false;

    // jsdoc
    let pageLoading = true;

    // jsdoc
    let success = false;

    // jsdoc
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // jsdoc
    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // jsdoc
    const validateUsername = (username) => {
        return username.trim().length > 0;
    };

    // jsdoc
    const handleLogin = async () => {
        if (!email || !password) {
            errorMessage = 'Please fill in all fields';
            return;
        }
        if (!validateEmail(email)) {
            errorMessage = 'Invalid email format';
            return;
        }
        if (!validatePassword(password)) {
            errorMessage = 'Password must be at least 6 characters';
            return;
        }

        try {
            const response = await fetch(`${API}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.error) {
                errorMessage = data.error;
                return;
            }

            success = true;
            localStorage.setItem("token", data.token);
            auth.set(true);
            user.set({
                token: data.token,
                user: data.user
            });

            setTimeout(() => goto("/dashboard"), 2000);
        } catch (error) {
            errorMessage = "An error occurred during login";
            console.error("Login error:", error);
        }
    };

    // jsdoc
    const handleRegister = async () => {
        if (!email || !password || !username) {
            errorMessage = 'Please fill in all fields';
            return;
        }
        if (!validateEmail(email)) {
            errorMessage = 'Invalid email format';
            return;
        }
        if (!validatePassword(password)) {
            errorMessage = 'Password must be at least 6 characters';
            return;
        }
        if (!validateUsername(username)) {
            errorMessage = 'Username cannot be empty';
            return;
        }

        try {
            const response = await fetch(`${API}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password, username })
            });

            const data = await response.json();

            if (data.error) {
                errorMessage = data.error;
                return;
            }

            success = true;
            localStorage.setItem("token", data.token);
            auth.set(true);
            user.set({
                token: data.token,
                user: data.user
            });

            setTimeout(() => goto("/dashboard"), 2000);
        } catch (error) {
            errorMessage = "An error occurred during registration";
            console.error("Registration error:", error);
        }
    };

    // jsdoc
    const handleSubmit = async () => {
        isLoading = true;
        errorMessage = '';

        try {
            if (isLogin) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } catch (error) {
            errorMessage = "An unexpected error occurred";
            console.error("Form submission error:", error);
        } finally {
            isLoading = false;
        }
    };

    onMount(() => {
        auth.subscribe((value) => {
            if (value === true) {
                goto('/dashboard');
            }
        });
        
        pageLoading = false;
    });
</script>

{#if pageLoading}
    <div class="flex items-center justify-center min-h-screen">
        <span class="loading loading-dots loading-lg"></span>
        </div>
{:else}
    <div class="flex flex-col items-center justify-center min-h-screen" in:fade>
        {#if success}
        <div role="alert" class="alert alert-success max-w-[50%]" in:fade> 
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Your Authentication Was Successful!</span>
          </div>

        {/if}
        <div class="w-full max-w-md p-8 space-y-6 bg-zinc-950 shadow-md justify-center rounded-xl border-black border-[1px]">
            <h2 class="text-2xl font-bold text-center">{isLogin ? 'Login' : 'Register'}</h2>
            
            <div class="form-control" in:slide>
                <label class="label" for="email">
                    <span class="label-text text-2xl">Email</span>
                </label>
                <input type="email" placeholder="Type here" class="input input-bordered input-lg block w-full max-w-xs" 
                    bind:value={email} name="email" disabled={isLoading} />
            </div>

            {#if !isLogin}
                <div class="form-control" transition:slide>
                    <label class="label" for="username">
                        <span class="label-text text-2xl">Username</span>
                    </label>
                    <input type="text" placeholder="Type here" class="input input-bordered input-lg block w-full max-w-xs" 
                        bind:value={username} name="username" disabled={isLoading}/>
                </div>
            {/if}

            <div class="form-control" in:slide>
                <label class="label" for="password">
                    <span class="label-text text-2xl">Password</span>
                </label>
                <input type="password" placeholder="Type here" class="input input-bordered input-lg block w-full max-w-xs" 
                    bind:value={password} name="password" disabled={isLoading}/>
            </div>

            {#if errorMessage}
                <div class="text-red-500" transition:fade>{errorMessage}</div>
            {/if}

            <button class="btn btn-primary w-full" on:click={handleSubmit} disabled={isLoading}>
                {#if isLoading}
                    <span class="loading loading-spinner"></span>
                {:else}
                    {isLogin ? 'Login' : 'Register'}
                {/if}
            </button>

            <button class="btn btn-secondary w-full" on:click={() => isLogin = !isLogin} disabled={isLoading}>
                {isLogin ? 'Switch to Register' : 'Switch to Login'}
            </button>
        </div>
    </div>
{/if}