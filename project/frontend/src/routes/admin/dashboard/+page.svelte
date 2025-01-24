<script>
    import { onMount } from 'svelte';
    import {slide} from 'svelte/transition';
    let userStats = { totalUsers: 0, totalAdmins: 0 };
    let ideaStats = { totalIdeas: 0, ideasByStatus: [] };
    let statusStats = { approvedCount: 0, pendingCount: 0 };
    let loading = true;

    async function fetchStats() {
        try {
            const [userResponse, ideaResponse, statusResponse] = await Promise.all([
                fetch('http://localhost:5000/api/admin/stats/users',{
                    headers: {
                        "Authorization": `Bearer ${localStorage.token}`
                    }

                }),
                fetch('http://localhost:5000/api/admin/stats/ideas',{
                    headers: {
                     "Authorization": `Bearer ${localStorage.token}`
                    }   
                }),
                fetch('http://localhost:5000/api/admin/stats/ideas-status',{
                    headers: {
                     "Authorization": `Bearer ${localStorage.token}`
                    }   
                })
            ]);

            userStats = await userResponse.json();
            ideaStats = await ideaResponse.json();
            statusStats = await statusResponse.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchStats();
    });
</script>
<main class="w-full flex justify-center items-start mt-12 overflow-x-scroll" in:slide out:slide>
<div class="p-4 w-fit text-center">
    <h1 class="text-4xl font-bold mb-6">Admin Dashboard</h1>

    {#if loading}
        <div class="flex justify-center">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- User Statistics -->
            <div class="stats shadow">
                <div class="stat">
                    <div class="stat-title">Total Users</div>
                    <div class="stat-value">{userStats.totalUsers}</div>
                </div>
                <div class="stat">
                    <div class="stat-title">Admins</div>
                    <div class="stat-value">{userStats.totalAdmins}</div>
                </div>
            </div>

            <!-- Idea Statistics -->
            <div class="stats shadow">
                <div class="stat">
                    <div class="stat-title">Total Ideas</div>
                    <div class="stat-value">{ideaStats.totalIdeas}</div>
                </div>
            </div>

            <!-- Status Statistics -->
            <div class="stats shadow">
                <div class="stat">
                    <div class="stat-title">Approved Ideas</div>
                    <div class="stat-value text-success">{statusStats.approvedCount}</div>
                </div>
                <div class="stat">
                    <div class="stat-title">Pending Ideas</div>
                    <div class="stat-value text-warning">{statusStats.pendingCount}</div>
                </div>
            </div>
        </div>

        <!-- Ideas by Status Breakdown -->
        {#if ideaStats.ideasByStatus && ideaStats.ideasByStatus.length > 0}
            <div class="mt-16">
                <h2 class="text-2xl font-bold mb-4">Ideas by Status</h2>
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each ideaStats.ideasByStatus as status}
                                <tr>
                                    <td>{status.status}</td>
                                    <td>{status.count}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    {/if}
</div>
</main>