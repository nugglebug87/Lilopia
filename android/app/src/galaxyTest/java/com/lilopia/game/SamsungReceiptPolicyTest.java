package com.lilopia.game;
import org.junit.Test;
import static org.junit.Assert.*;
public class SamsungReceiptPolicyTest {
    private final String pack = "com.lilopia.game.samsung";
    private final String item = "com.lilopia.expansion.dream_mansion";
    private boolean accepts(String status, String receiptPackage, String receiptItem, String receiptPayment,
            String mode, String consumed, boolean test) {
        return SamsungReceiptPolicy.accepts(pack, item, "payment-1", status, receiptPackage,
            receiptItem, receiptPayment, mode, consumed, test);
    }
    @Test public void verifiedPermanentProductAccepted() {
        assertTrue(accepts("success",pack,item,"payment-1","PRODUCTION","N",false));
    }
    @Test public void productionRejectsTestReceipts() {
        assertFalse(accepts("success",pack,item,"payment-1","TEST","N",false));
    }
    @Test public void testBuildIsIsolatedFromProductionOwnership() {
        assertTrue(accepts("success",pack,item,"payment-1","TEST","N",true));
        assertFalse(accepts("success",pack,item,"payment-1","PRODUCTION","N",true));
    }
    @Test public void pendingCanceledAndFailedCannotUnlock() {
        for (String status : new String[]{"pending","cancel","fail","", "Success"})
            assertFalse(accepts(status,pack,item,"payment-1","PRODUCTION","N",false));
    }
    @Test public void packageProductAndPaymentMustMatchSdkOwnership() {
        assertFalse(accepts("success","com.lilopia.game",item,"payment-1","PRODUCTION","N",false));
        assertFalse(accepts("success",pack,"com.lilopia.expansion.city_life","payment-1","PRODUCTION","N",false));
        assertFalse(accepts("success",pack,item,"somebody-elses-payment","PRODUCTION","N",false));
    }
    @Test public void consumedAndIncompleteReceiptsCannotUnlock() {
        for (String value : new String[]{"Y","", "false"})
            assertFalse(accepts("success",pack,item,"payment-1","PRODUCTION",value,false));
        assertFalse(accepts("success",pack,item,"","PRODUCTION","N",false));
    }
    @Test public void onlyImplementedPacksAreSold() {
        assertEquals(3, SamsungReceiptPolicy.PRODUCTS.size());
        assertFalse(SamsungReceiptPolicy.accepts(pack,"remove_ads","payment-1","success",pack,"remove_ads","payment-1","PRODUCTION","N",false));
        assertFalse(SamsungReceiptPolicy.accepts(pack,"com.lilopia.expansion.farm_life","payment-1","success",pack,"com.lilopia.expansion.farm_life","payment-1","PRODUCTION","N",false));
    }
}
