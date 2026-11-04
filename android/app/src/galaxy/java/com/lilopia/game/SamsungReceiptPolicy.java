package com.lilopia.game;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
/** Strict receipt binding; identifiers originate only in the Samsung SDK owned list. */
final class SamsungReceiptPolicy {
    static final Set<String> PRODUCTS = new HashSet<>(Arrays.asList(
        "com.lilopia.expansion.dream_mansion", "com.lilopia.expansion.beach_vacation", "com.lilopia.expansion.city_life"));
    static boolean accepts(String expectedPackage, String expectedItem, String expectedPayment,
            String status, String packageName, String itemId, String paymentId, String mode,
            String consumed, boolean testBuild) {
        return PRODUCTS.contains(expectedItem) && expectedPayment != null && !expectedPayment.isEmpty()
            && "success".equals(status) && expectedPackage.equals(packageName)
            && expectedItem.equals(itemId) && expectedPayment.equals(paymentId)
            && (testBuild ? "TEST".equals(mode) : "PRODUCTION".equals(mode))
            && "N".equals(consumed);
    }
}
