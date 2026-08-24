import Script from 'next/script';

const STRIP_EXTENSION_ATTRS = `
(function () {
  var EXTENSION_ATTRS = ['bis_skin_checked', 'bis_register'];
  var observer = null;

  function stripExtensionAttributes() {
    var nodes = document.querySelectorAll('*');

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];

      for (var j = 0; j < EXTENSION_ATTRS.length; j++) {
        el.removeAttribute(EXTENSION_ATTRS[j]);
      }

      var names = el.getAttributeNames();
      for (var k = 0; k < names.length; k++) {
        if (names[k].indexOf('__processed_') === 0) {
          el.removeAttribute(names[k]);
        }
      }
    }
  }

  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function finalize() {
    stripExtensionAttributes();
    stopObserving();
  }

  stripExtensionAttributes();

  observer = new MutationObserver(stripExtensionAttributes);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
  });

  document.addEventListener(
    'DOMContentLoaded',
    function () {
      stripExtensionAttributes();
      requestAnimationFrame(function () {
        stripExtensionAttributes();
        requestAnimationFrame(finalize);
      });
    },
    { once: true }
  );
})();
`;

export function StripExtensionAttrs() {
  return (
    <Script id="strip-extension-attrs" strategy="beforeInteractive">
      {STRIP_EXTENSION_ATTRS}
    </Script>
  );
}
