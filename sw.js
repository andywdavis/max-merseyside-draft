/* R&J Merseyside — lean launch worker, 1 November 2026.
   The previous worker downloaded and rewrote the entire ~19.5 MB
   catalogue on every navigation, delaying Android home-screen launch.
   Max's Open/Save, Index Search and Quote now live in index.html.
   This worker deliberately does not intercept catalogue navigation,
   add duplicate buttons, or delete caches shared with other divisions.
*/
'use strict';
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
