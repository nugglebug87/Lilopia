package com.lilopia.game;
import android.app.Activity;
import android.webkit.WebView;
final class StoreFactory {
    static StoreBridge create(Activity activity, WebView web) { return new PlayStore(activity, web); }
}
