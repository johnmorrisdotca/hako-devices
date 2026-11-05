<script lang="ts">
  import { onMount } from "svelte";

  let { device = "pi4" }: { device?: string } = $props();

  // The element needs a browser: onMount never runs on the server.
  onMount(() => {
    void import("@johnmorrisdotca/hako-devices/element");
  });
</script>

<hako-device {device} drawing-style="thick"></hako-device>
