package com.lilopia.game;
import org.junit.Test;
import static org.junit.Assert.*;
public class AssetPolicyTest {
    @Test public void bundledPagesAndResourcesAreAllowed() {
        for (String path : new String[]{"index.html", "src/game.js", "privacy-policy.html", "fonts/fonts.css"})
            assertTrue(AssetPolicy.allows("https://appassets.androidplatform.net/assets/game/" + path));
    }
    @Test public void externalAndTraversalUrlsCannotReachBridge() {
        for (String url : new String[]{null, "javascript:alert(1)", "file:///assets/game/index.html",
            "http://appassets.androidplatform.net/assets/game/index.html",
            "https://appassets.androidplatform.net.evil.example/assets/game/index.html",
            "https://user@appassets.androidplatform.net/assets/game/index.html",
            "https://appassets.androidplatform.net:8443/assets/game/index.html",
            "https://appassets.androidplatform.net/assets/game/../secret",
            "https://appassets.androidplatform.net/assets/game/%2e%2e/secret",
            "https://appassets.androidplatform.net/assets/game/%252e%252e/secret",
            "https://appassets.androidplatform.net/assets/other/index.html"}) assertFalse(String.valueOf(url), AssetPolicy.allows(url));
    }
}
