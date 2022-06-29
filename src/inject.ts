export function injectHead() {
  injectMeta();
  injectStyle();
}

function injectMeta() {
  const metatags: HTMLElement[] = [];

  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  metatags.push(viewport);

  const monetization = document.createElement('meta');
  monetization.name = 'monetization';
  monetization.content = '$ilp.uphold.com/g64DLNdpidDy';
  metatags.push(monetization);

  metatags.forEach((t) => document.head.appendChild(t));
}

function injectStyle() {
  const style = document.createElement('style');
  style.innerText = `
    body,
        html {
          padding: 0;
          margin: 0;
        }
  
        body {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
  
        canvas {
          width: 100%;
          height: 100%;
        }
        
        .no-aa {
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-crisp-edges;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
  
        .aa {
          image-rendering: auto;
        }
    `;
  document.head.appendChild(style);
}
