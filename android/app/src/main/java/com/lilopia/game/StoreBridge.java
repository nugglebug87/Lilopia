package com.lilopia.game;
import android.webkit.JavascriptInterface;
interface StoreBridge {
    @JavascriptInterface boolean owns(String id);
    @JavascriptInterface String price(String id);
    @JavascriptInterface boolean available(String id);
    @JavascriptInterface void buy(String id);
    @JavascriptInterface void restore();
    @JavascriptInterface String storeName();
    void refresh();
    void close();
}
