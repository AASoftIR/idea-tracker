<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { fade, slide } from 'svelte/transition';
    import { auth } from '../../stores/auth';
    import { user } from '../../stores/user';

    /**
     * @constant {string} API - The base API URL for authentication endpoints
     */
    const API = "http://localhost:5000";

    /**
     * @type {boolean} isLogin - Toggle between login and register forms
     */
    let isLogin = true;

    /**
     * @type {string} email - User's email input
     */
    let email = '';

    /**
     * @type {string} password - User's password input
     */
    let password = '';

    /**
     * @type {string} username - User's username input
     */
    let username = '';

    /**
     * @type {string} errorMessage - Error message to display to user
     */
    let errorMessage = '';

    /**
     * @type {boolean} isLoading - Loading state for form submission
     */
    let isLoading = false;

    /**
     * @type {boolean} pageLoading - Initial page loading state
     */
    let pageLoading = true;

    /**
     * @type {boolean} success - Success state after authentication
     */
    let success = false;

    /**
     * Validates an email address format
     * @param {string} email - The email address to validate
     * @returns {boolean} True if email format is valid
     */
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    /**
     * Validates password length
     * @param {string} password - The password to validate
     * @returns {boolean} True if password meets length requirement
     */
    const validatePassword = (password) => {
        return password.length >= 6;
    };

    /**
     * Validates username is not empty
     * @param {string} username - The username to validate
     * @returns {boolean} True if username is not empty
     */
    const validateUsername = (username) => {
        return username.trim().length > 0;
    };

    /**
     * Handles the login process
     * @async
     * @returns {Promise<void>}
     * @throws {Error} When API request fails
     */
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

    /**
     * Handles the registration process
     * @async
     * @returns {Promise<void>}
     * @throws {Error} When API request fails
     */
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

    /**
     * Handles form submission for both login and register
     * @async
     * @returns {Promise<void>}
     */
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