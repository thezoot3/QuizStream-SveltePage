<script lang="ts">
    import RoomIcon from '../static/RoomIcon.svelte';

    export let setId: string;
    export let nickname: string;
    export let onConfirm: () => void;
</script>

<div class="flex flex-col items-center gap-4 p-6 bg-[#1e1e1e] rounded-xl border border-gray-700 drop-shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-300">
    <div class="flex items-center justify-center w-12 h-12 bg-[#4080FF]/20 rounded-full">
        <RoomIcon class="text-[#4080FF] w-6 h-6" />
    </div>
    
    <div class="text-center">
        <h3 class="text-lg font-semibold text-white">최근 접속 기록이 있습니다</h3>
        <p class="text-sm text-gray-400 mt-1">이전 정보로 다시 접속할까요?</p>
    </div>

    <div class="w-full bg-[#2e2e2e] rounded-lg p-4 space-y-2">
        <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500 uppercase tracking-wider">닉네임</span>
            <span class="text-sm font-medium text-gray-200">{nickname}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500 uppercase tracking-wider">참여 코드</span>
            <span class="text-sm font-mono font-medium text-[#4080FF]">{setId}</span>
        </div>
    </div>

    <button 
        class="w-full py-3 bg-[#4080FF] hover:bg-[#3366CC] text-white font-bold rounded-lg transition-colors duration-200 shadow-lg shadow-[#4080FF]/20"
        on:click={onConfirm}
    >
        이 정보로 바로 참가
    </button>
</div>
