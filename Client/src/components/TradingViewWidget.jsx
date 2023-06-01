import React, { useEffect } from 'react';

const TradingViewWidget = ({ symbol, width, height }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = `
      {
        "interval": "1h",
        "width": ${width},
        "isTransparent": true,
        "height": "${height}",
        "symbol": "BITSTAMP:${symbol}USD",
        "showIntervalTabs": true,
        "locale": "en",
        "colorTheme": "dark"
      }
    `;
    let doc = document.getElementsByClassName('tradingview-widget-container__widget')
    if(doc)
    {
      doc[0].appendChild(script);
    }

    return () => {
      let htm =  document.getElementsByClassName('tradingview-widget-container__widget')[0]
      if(htm){
      htm.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default TradingViewWidget;