package com.lilopia.game;

import android.app.Activity;
import android.util.Log;
import com.android.billingclient.api.*;
import java.util.List;

/** Read-only Google Play Billing connection. Checkout is not enabled. */
final class PlayBillingManager implements PurchasesUpdatedListener {
    private final BillingClient client;
    private boolean connected;

    PlayBillingManager(Activity activity) {
        client = BillingClient.newBuilder(activity)
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
        client.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult result) {
                connected = result.getResponseCode() == BillingClient.BillingResponseCode.OK;
                if (connected) refreshPurchases();
            }
            @Override public void onBillingServiceDisconnected() { connected = false; }
        });
    }

    void refreshPurchases() {
        if (!connected) return;
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK)
                    inspectPurchases(purchases);
            });
    }

    @Override public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null)
            inspectPurchases(purchases);
    }

    private void inspectPurchases(List<Purchase> purchases) {
        for (Purchase purchase : purchases) {
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING)
                Log.i("LilopiaBilling", "Payment pending");
            else if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED)
                Log.i("LilopiaBilling", "Verification required before fulfillment");
        }
    }

    void close() { connected = false; client.endConnection(); }
}
