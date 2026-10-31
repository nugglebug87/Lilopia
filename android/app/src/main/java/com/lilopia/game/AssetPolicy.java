package com.lilopia.game;

import java.net.URI;
import java.net.URISyntaxException;

/** The JavaScript purchase bridge must only be exposed to bundled game documents. */
final class AssetPolicy {
    static boolean allows(String value) {
        try {
            URI uri = new URI(value);
            String path = uri.getPath();
            return "https".equals(uri.getScheme())
                && "appassets.androidplatform.net".equals(uri.getHost())
                && uri.getRawUserInfo() == null && (uri.getPort() == -1 || uri.getPort() == 443)
                && path != null && path.startsWith("/assets/game/")
                && !path.contains("\\") && !path.contains("/../") && !path.contains("/./")
                && !path.endsWith("/..") && !path.endsWith("/.") && !path.contains("%");
        } catch (URISyntaxException | NullPointerException ignored) { return false; }
    }
}
