<script setup lang="ts">
import { onMounted } from "vue";

withDefaults(defineProps<{ device?: string }>(), { device: "pi4" });

// The element needs a browser: import it once the component is on the page, never while a server renders it.
onMounted(() => {
  void import("@johnmorrisdotca/hako-devices/element");
});
</script>

<template>
  <hako-device :device="device" drawing-style="thick"></hako-device>
</template>
