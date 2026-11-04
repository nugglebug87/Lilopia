package com.lilopia.game;

import android.app.Activity;
import android.app.AlertDialog;
import android.text.InputType;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.EditText;
import com.samsung.android.sdk.iap.lib.helper.IapHelper;
import com.samsung.android.sdk.iap.lib.constants.HelperDefine;
import com.samsung.android.sdk.iap.lib.vo.ProductVo;
import com.samsung.android.sdk.iap.lib.vo.OwnedProductVo;
import org.json.JSONObject;
import javax.net.ssl.HttpsURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/** Galaxy-only adapter. No tokens, prices or ownership from JavaScript/local saves are trusted. */
public final class SamsungStore implements StoreBridge {
    private final Activity activity;
    private final WebView web;
    private final IapHelper iap;
    private final Map<String, ProductVo> catalog = new ConcurrentHashMap<>();
    private volatile Set<String> owned = Collections.emptySet();
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicInteger generation = new AtomicInteger();
    private final AtomicBoolean paymentOpen = new AtomicBoolean();
    private volatile boolean closed;
    private volatile boolean ownershipReady;
    private volatile boolean verificationHealthy = true;

    SamsungStore(Activity activity, WebView web) {
        this.activity = activity; this.web = web;
        iap = IapHelper.getInstance(activity);
        iap.setOperationMode(BuildConfig.GALAXY_TEST ? HelperDefine.OperationMode.OPERATION_MODE_TEST
            : HelperDefine.OperationMode.OPERATION_MODE_PRODUCTION);
        iap.setShowErrorDialog(false);
    }
    @JavascriptInterface public String storeName() { return "Galaxy Store"; }
    @JavascriptInterface public boolean owns(String id) { return !closed && owned.contains(id); }
    @JavascriptInterface public String price(String id) {
        ProductVo product = catalog.get(id);
        return product == null || product.getItemPriceString() == null ? "" : product.getItemPriceString();
    }
    @JavascriptInterface public boolean available(String id) {
        return !closed && ownershipReady && verificationHealthy && !paymentOpen.get()
            && SamsungReceiptPolicy.PRODUCTS.contains(id) && catalog.containsKey(id) && !price(id).isEmpty();
    }
    @JavascriptInterface public void restore() { activity.runOnUiThread(this::refresh); }
    @JavascriptInterface public void buy(String id) {
        if (!available(id) || owned.contains(id) || !paymentOpen.compareAndSet(false, true)) {
            notifyWeb("Purchase unavailable. Restore existing purchases before trying again."); return;
        }
        activity.runOnUiThread(() -> {
            if (closed || activity.isFinishing()) { paymentOpen.set(false); return; }
            int a = 12 + new java.security.SecureRandom().nextInt(8), b = 7;
            EditText answer = new EditText(activity); answer.setInputType(InputType.TYPE_CLASS_NUMBER);
            new AlertDialog.Builder(activity).setTitle("Grown-ups only: " + a + " × " + b + " = ?")
                .setView(answer).setNegativeButton("Cancel", (d, w) -> paymentOpen.set(false))
                .setOnCancelListener(d -> paymentOpen.set(false))
                .setPositiveButton("Continue", (dialog, which) -> {
                    if (!String.valueOf(a * b).equals(answer.getText().toString().trim()) || closed) {
                        paymentOpen.set(false); return;
                    }
                    try {
                        boolean started = iap.startPayment(id, "", "", (error, purchase) -> {
                            paymentOpen.set(false);
                            if (closed) return;
                            if (error == null || error.getErrorCode() != IapHelper.IAP_ERROR_NONE || purchase == null) {
                                notifyWeb("Purchase canceled, pending or unavailable. No new pack was unlocked."); return;
                            }
                            // Requery Samsung-owned items. Never grant from the payment callback alone.
                            refresh();
                        });
                        if (!started) { paymentOpen.set(false); notifyWeb("Samsung checkout could not start."); }
                    } catch (RuntimeException error) {
                        paymentOpen.set(false); notifyWeb("Samsung checkout is unavailable.");
                    }
                }).show();
        });
    }
    public void refresh() {
        if (closed || paymentOpen.get()) return;
        final int current = generation.incrementAndGet();
        owned = Collections.emptySet(); ownershipReady = false;
        notifyWeb("");
        try {
            iap.getProductsDetails(String.join(",", SamsungReceiptPolicy.PRODUCTS), (error, list) -> {
                if (closed || current != generation.get()) return;
                catalog.clear();
                if (error != null && error.getErrorCode() == IapHelper.IAP_ERROR_NONE && list != null)
                    for (ProductVo product : list) if (SamsungReceiptPolicy.PRODUCTS.contains(product.getItemId())
                            && HelperDefine.PRODUCT_TYPE_ITEM.equals(product.getType())) catalog.put(product.getItemId(), product);
                notifyWeb("");
            });
            boolean requested = iap.getOwnedList(HelperDefine.PRODUCT_TYPE_ITEM, (error, list) -> {
                if (closed || current != generation.get()) return;
                if (error == null || error.getErrorCode() != IapHelper.IAP_ERROR_NONE || list == null) {
                    notifyWeb("Could not restore Samsung purchases. Connect and try Restore purchases."); return;
                }
                submit(() -> {
                    Set<String> verified = new HashSet<>();
                    List<OwnedProductVo> acknowledge = new ArrayList<>();
                    boolean healthy = true;
                    for (OwnedProductVo item : list) {
                        if (!SamsungReceiptPolicy.PRODUCTS.contains(item.getItemId())) continue;
                        try {
                            if (verify(item)) {
                                verified.add(item.getItemId());
                                if (item.getAcknowledgedStatus() == HelperDefine.AcknowledgedStatus.NOT_ACKNOWLEDGED)
                                    acknowledge.add(item);
                            }
                        } catch (Exception failure) { healthy = false; }
                    }
                    if (closed || current != generation.get()) return;
                    owned = Collections.unmodifiableSet(verified); verificationHealthy = healthy; ownershipReady = true;
                    notifyWeb(healthy ? "" : "A purchase could not be verified. Connect and use Restore purchases; do not buy again.");
                    // Permanent expansions are acknowledged, never consumed. SDK preserves them for restore.
                    activity.runOnUiThread(() -> {
                        if (closed || current != generation.get()) return;
                        for (OwnedProductVo item : acknowledge) {
                            boolean sent = iap.acknowledgePurchases(item.getPurchaseId(), (errorAck, results) -> {
                                if (closed || current != generation.get()) return;
                                boolean success = errorAck != null && errorAck.getErrorCode() == IapHelper.IAP_ERROR_NONE
                                    && results != null && results.stream().anyMatch(v -> item.getPurchaseId().equals(v.getPurchaseId()) && v.getStatusCode() == 0);
                                if (!success) notifyWeb("Purchase delivery confirmation needs retry. Use Restore purchases.");
                            });
                            if (!sent) notifyWeb("Purchase delivery confirmation needs retry. Use Restore purchases.");
                        }
                    });
                });
            });
            if (!requested) notifyWeb("Samsung account or store unavailable. Please try Restore purchases.");
        } catch (RuntimeException failure) { catalog.clear(); notifyWeb("Samsung store unavailable. Please try again."); }
    }
    private boolean verify(OwnedProductVo item) throws Exception {
        String purchaseId = item.getPurchaseId();
        if (purchaseId == null || purchaseId.length() < 10 || purchaseId.length() > 4096) return false;
        HttpsURLConnection connection = (HttpsURLConnection) new URL(
            "https://iap.samsungapps.com/iap/v6/receipt?purchaseID=" + URLEncoder.encode(purchaseId, "UTF-8")).openConnection();
        try {
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(15000); connection.setReadTimeout(15000);
            if (connection.getResponseCode() != 200) throw new IllegalStateException("Receipt rejected");
            java.io.ByteArrayOutputStream bytes = new java.io.ByteArrayOutputStream();
            try (java.io.InputStream input = connection.getInputStream()) {
                byte[] buffer = new byte[1024]; int count;
                while ((count = input.read(buffer)) != -1) {
                    bytes.write(buffer, 0, count);
                    if (bytes.size() > 32768) throw new IllegalStateException("Receipt too large");
                }
            }
            JSONObject receipt = new JSONObject(new String(bytes.toByteArray(), StandardCharsets.UTF_8));
            return SamsungReceiptPolicy.accepts(BuildConfig.APPLICATION_ID, item.getItemId(), item.getPaymentId(),
                receipt.optString("status"), receipt.optString("packageName"), receipt.optString("itemId"),
                receipt.optString("paymentId"), receipt.optString("mode"), receipt.optString("consumeYN"), BuildConfig.GALAXY_TEST);
        } finally { connection.disconnect(); }
    }
    private void submit(Runnable task) {
        if (closed) return;
        try { worker.execute(() -> { if (!closed) task.run(); }); }
        catch (RejectedExecutionException ignored) { /* Activity closed. */ }
    }
    private void notifyWeb(String message) {
        activity.runOnUiThread(() -> {
            if (!closed) web.evaluateJavascript("window.lilopiaStoreChanged && window.lilopiaStoreChanged(" + JSONObject.quote(message) + ")", null);
        });
    }
    public void close() { closed = true; generation.incrementAndGet(); owned = Collections.emptySet(); catalog.clear(); worker.shutdownNow(); }
}
