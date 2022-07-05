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
        html, body {
          margin: 0;
          background-color: black;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
  
        canvas {
          width: 100vw;
          outline: 0;
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

        @media (min-aspect-ratio: 16/9) {
          canvas {
            height: 100vh;
            width: auto;
          }
        }
    `;
  document.head.appendChild(style);
}
