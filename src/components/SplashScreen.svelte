<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import logo from '../assets/icon.png';
  
    export let onFinish;
  
    onMount(() => {
      setTimeout(() => {
        onFinish();
      }, 1500);
    });
  </script>
  
  <div class="splash-screen" transition:fade>
    <div class="splash-content">
      <img src={logo} alt="Request Rocket Logo" />
      <h1>Request Rocket</h1>

    </div>
  </div>
  
  <style>
    .splash-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--background);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
  
    .splash-content {
      text-align: center;
    }
  
    .splash-content img {
      width: 600px;
      height: auto;
      margin-bottom: 20px;
    }
  
    h1 {
      font-size: 2em;
      margin-bottom: 10px;
    }
  
  </style>