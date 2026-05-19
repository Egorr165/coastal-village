declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: any[]) => void;
  }
}


export const loadYandexMetrika = (counterId: number = 109018163) => {
  if (window.ym) {
    console.log('Yandex Metrika already loaded');
    return;
  }

  console.log('Loading Yandex Metrika...');

  (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(counterId, "init", {
       clickmap:true,
       trackLinks:true,
       accurateTrackBounce:true,
       webvisor:true 
  });
};

export default loadYandexMetrika;