<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-background flex flex-col lg:flex-row">
    <div
      class="flex-1 flex items-center justify-center p-4 lg:p-8 order-2 lg:order-1"
    >
      <div
        class="gradient-preview w-full aspect-square max-w-md lg:max-w-none lg:h-screen lg:aspect-auto"
      >
        <slot />
      </div>
    </div>

    <SidebarComponent />
  </div>
</template>
