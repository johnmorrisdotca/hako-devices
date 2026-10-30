# Security

This package runs in your page or on your server. Beyond loading its own files, the `.svg` and `.glb` of a device from the address you give it, it makes no network requests and keeps nothing outside the page it is on.

Text you give it (a `print`, a screen's words) is treated as text: it is escaped in a drawing and painted on a canvas in a 3D view. The `build` attribute is read as JSON and checked against the part table, so an unknown part is refused by name. The element works under a strict content security policy: it needs `img-src 'self'` (or wherever the assets are) and `connect-src` for the `.glb` and for a drawing at real scale, and no inline script or style.

If you find a way to make it do something it should not, such as text that gets out of a drawing into the page, please write to john@johnmorris.ca rather than opening a public issue. Reports are read and kept confidential, and a fix is released as soon as there is one.

Only the latest version is supported. It needs Node 22 or later on a server; in a browser, any current one.
