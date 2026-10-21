package com.lilopia.game;

import android.app.Activity;
import android.app.AlertDialog;
import android.text.InputType;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.EditText;
import com.android.billingclient.api.*;
import org.json.JSONObject;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/** Native Play billing. Only a positive response from the configured verifier grants access. */
public final class PlayStore implements PurchasesUpdatedListener {
    private static final Set<String> PRODUCTS = new HashSet<>(Arrays.asList(
        "com.lilopia.expansion.dream_mansion", "com.lilopia.expansion.beach_vacation",
        "com.lilopia.expansion.city_life"));
    private final Activity activity;
    private final WebView web;
    private final BillingClient client;
    private final Map<String, ProductDetails> details = new ConcurrentHashMap<>();
    private final Set<String> owned = ConcurrentHashMap.newKeySet();
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private volatile boolean closed;

    PlayStore(Activity activity, WebView web) {
        this.activity = activity; this.web = web;
        client = BillingClient.newBuilder(activity).setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection().build();
        // No verifier configured: do not offer a payment that cannot be fulfilled.
        if (!BuildConfig.VERIFICATION_URL.isEmpty()) client.startConnection(new BillingClientStateListener() {
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) { catalog(); refresh(); }
            }
            public void onBillingServiceDisconnected() { details.clear(); notifyWeb("Store disconnected. Please try again."); }
        });
    }
    @JavascriptInterface public boolean owns(String id) { return owned.contains(id); }
    @JavascriptInterface public String price(String id) {
        ProductDetails d = details.get(id);
        return d != null && d.getOneTimePurchaseOfferDetails() != null
            ? d.getOneTimePurchaseOfferDetails().getFormattedPrice() : "";
    }
    @JavascriptInterface public boolean available(String id) {
        return !closed && client.isReady() && details.containsKey(id) && !BuildConfig.VERIFICATION_URL.isEmpty();
    }
    @JavascriptInterface public void buy(String id) {
        if (!PRODUCTS.contains(id) || !available(id)) { notifyWeb("Purchases are unavailable. No payment was started."); return; }
        activity.runOnUiThread(() -> {
            // Native parent gate prevents web code from launching a payment directly.
            int a = 12 + new java.security.SecureRandom().nextInt(8), b = 7;
            EditText answer = new EditText(activity); answer.setInputType(InputType.TYPE_CLASS_NUMBER);
            new AlertDialog.Builder(activity).setTitle("Grown-ups only: " + a + " × " + b + " = ?")
                .setView(answer).setNegativeButton("Cancel", null).setPositiveButton("Continue", (dialog, which) -> {
                    if (!String.valueOf(a * b).equals(answer.getText().toString().trim())) return;
                    ProductDetails d = details.get(id);
                    if (d == null || !client.isReady()) { notifyWeb("Store unavailable. Please try again."); return; }
                    BillingFlowParams.ProductDetailsParams product = BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(d).build();
                    BillingResult result = client.launchBillingFlow(activity, BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(Collections.singletonList(product)).build());
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) notifyWeb("Payment could not start. Please try again.");
                }).show();
        });
    }
    @JavascriptInterface public void restore() { activity.runOnUiThread(this::refresh); }
    private void catalog() {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (String id : PRODUCTS) products.add(QueryProductDetailsParams.Product.newBuilder()
            .setProductId(id).setProductType(BillingClient.ProductType.INAPP).build());
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(products).build(), (result, response) -> {
            details.clear();
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK)
                for (ProductDetails d : response.getProductDetailsList()) details.put(d.getProductId(), d);
            notifyWeb("");
        });
    }
    void refresh() {
        if (!client.isReady()) { notifyWeb("Store is unavailable. Connect to Google Play and try again."); return; }
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) { notifyWeb("Could not restore purchases. Please try again."); return; }
                // Serial verification avoids an older query overwriting a newer purchase result.
                worker.execute(() -> {
                    Set<String> verified = new HashSet<>();
                    for (Purchase p : purchases) verified.addAll(verify(p));
                    owned.clear(); owned.addAll(verified);
                    notifyWeb("Purchase check complete.");
                });
            });
    }
    @Override public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            worker.execute(() -> {
                for (Purchase p : purchases) owned.addAll(verify(p));
                notifyWeb("Purchase check complete.");
            });
        } else if (result.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) refresh();
        else notifyWeb(result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED
            ? "Purchase canceled." : "Purchase unavailable. Please try again.");
    }
    private Set<String> verify(Purchase purchase) {
        Set<String> verified = new HashSet<>();
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            notifyWeb("Payment is pending. Packs stay locked until payment is complete."); return verified;
        }
        for (String id : purchase.getProducts()) {
            if (!PRODUCTS.contains(id)) continue;
            HttpsURLConnection connection = null;
            try {
                JSONObject body = new JSONObject().put("productId", id).put("purchaseToken", purchase.getPurchaseToken());
                connection = (HttpsURLConnection) new URL(BuildConfig.VERIFICATION_URL).openConnection();
                connection.setInstanceFollowRedirects(false);
                connection.setConnectTimeout(15000); connection.setReadTimeout(15000);
                connection.setRequestMethod("POST"); connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                try (java.io.OutputStream out = connection.getOutputStream()) { out.write(body.toString().getBytes(StandardCharsets.UTF_8)); }
                if (connection.getResponseCode() != 200) throw new IllegalStateException("Verification rejected");
                byte[] bytes;
                try (java.io.InputStream input = connection.getInputStream(); java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream()) {
                    byte[] chunk = new byte[1024]; int count;
                    while ((count = input.read(chunk)) != -1) {
                        buffer.write(chunk, 0, count);
                        if (buffer.size() > 8192) throw new IllegalStateException("Invalid verification response");
                    }
                    bytes = buffer.toByteArray();
                }
                if (bytes.length > 8192) throw new IllegalStateException("Invalid verification response");
                JSONObject response = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
                if (response.optBoolean("verified") && id.equals(response.optString("productId"))) verified.add(id);
            } catch (Exception e) { notifyWeb("Could not verify payment. Connect and use Restore purchases; do not buy again."); }
            finally { if (connection != null) connection.disconnect(); }
        }
        return verified;
    }
    private void notifyWeb(String message) {
        activity.runOnUiThread(() -> {
            if (!closed) web.evaluateJavascript("window.lilopiaStoreChanged && window.lilopiaStoreChanged(" + JSONObject.quote(message) + ")", null);
        });
    }
    void close() { closed = true; client.endConnection(); worker.shutdownNow(); }
}
