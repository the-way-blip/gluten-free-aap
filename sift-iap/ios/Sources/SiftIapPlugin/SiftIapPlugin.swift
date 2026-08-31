import Foundation
import Capacitor
import StoreKit
import FBSDKCoreKit

/**
 * SiftIap — a small StoreKit 2 bridge for Sift's auto-renewable subscriptions.
 *
 * No third-party service: entitlements are verified on-device with StoreKit 2's
 * signed `Transaction` results. The web layer (lib/iap.ts) calls these methods
 * and listens for the `entitlementChanged` event.
 *
 * Products (created in App Store Connect):
 *   - sift_premium_monthly  ($4.99/mo, 7-day free trial)
 *   - sift_premium_yearly   ($39/yr,  7-day free trial)
 */
@objc(SiftIapPlugin)
public class SiftIapPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SiftIapPlugin"
    public let jsName = "SiftIap"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getEntitlement", returnType: CAPPluginReturnPromise)
    ]

    private let productIds: Set<String> = ["sift_premium_monthly", "sift_premium_yearly"]
    private var updatesTask: Task<Void, Never>?

    public override func load() {
        // Listen for transactions that arrive outside a direct purchase call:
        // renewals, Ask-to-Buy approvals, purchases restored on another device.
        updatesTask = Task.detached { [weak self] in
            guard let self = self else { return }
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await transaction.finish()
                    await self.notifyEntitlement()
                }
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": true])
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: productIds)
                let items: [[String: Any]] = products.map { product in
                    var period = ""
                    var hasTrial = false
                    if let sub = product.subscription {
                        period = self.periodString(sub.subscriptionPeriod)
                        if let intro = sub.introductoryOffer, intro.paymentMode == .freeTrial {
                            hasTrial = true
                        }
                    }
                    return [
                        "id": product.id,
                        "displayName": product.displayName,
                        "description": product.description,
                        "displayPrice": product.displayPrice,
                        "price": (product.price as NSDecimalNumber).doubleValue,
                        "period": period,
                        "hasFreeTrial": hasTrial
                    ]
                }
                call.resolve(["products": items])
            } catch {
                call.reject("Failed to load products: \(error.localizedDescription)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        await self.notifyEntitlement()
                        // Report to Meta so App Promotion campaigns can optimize
                        // toward subscribers. New subs start a 7-day trial → StartTrial;
                        // Subscribe carries the value for ROAS reporting.
                        let price = (product.price as NSDecimalNumber).doubleValue
                        AppEvents.shared.logEvent(.startTrial, valueToSum: price,
                            parameters: [.currency: "USD", .contentID: productId])
                        AppEvents.shared.logEvent(.subscribe, valueToSum: price,
                            parameters: [.currency: "USD", .contentID: productId])
                        call.resolve(["status": "purchased", "premium": true, "productId": productId])
                    case .unverified:
                        call.reject("Purchase could not be verified")
                    }
                case .userCancelled:
                    let premium = await self.hasPremium()
                    call.resolve(["status": "cancelled", "premium": premium])
                case .pending:
                    let premium = await self.hasPremium()
                    call.resolve(["status": "pending", "premium": premium])
                @unknown default:
                    let premium = await self.hasPremium()
                    call.resolve(["status": "unknown", "premium": premium])
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
            } catch {
                // AppStore.sync() can throw if the user cancels the auth sheet;
                // fall through and report whatever entitlement we can see.
            }
            var payload = await self.entitlementInfo()
            payload["premium"] = payload["premium"] ?? false
            call.resolve(payload)
        }
    }

    @objc func getEntitlement(_ call: CAPPluginCall) {
        Task {
            let payload = await self.entitlementInfo()
            call.resolve(payload)
        }
    }

    // MARK: - Helpers

    private func hasPremium() async -> Bool {
        let info = await entitlementInfo()
        return (info["premium"] as? Bool) ?? false
    }

    /// Walks the current, cryptographically-verified entitlements and reports
    /// whether either Sift product is active (and not revoked).
    private func entitlementInfo() async -> [String: Any] {
        var premium = false
        var productId: String?
        var expiration: String?
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            guard productIds.contains(transaction.productID) else { continue }
            guard transaction.revocationDate == nil else { continue }
            premium = true
            productId = transaction.productID
            if let exp = transaction.expirationDate {
                expiration = ISO8601DateFormatter().string(from: exp)
            }
        }
        var out: [String: Any] = ["premium": premium]
        if let productId = productId { out["productId"] = productId }
        if let expiration = expiration { out["expirationDate"] = expiration }
        return out
    }

    private func notifyEntitlement() async {
        let payload = await entitlementInfo()
        DispatchQueue.main.async {
            self.notifyListeners("entitlementChanged", data: payload)
        }
    }

    private func periodString(_ period: Product.SubscriptionPeriod) -> String {
        let unit: String
        switch period.unit {
        case .day: unit = "day"
        case .week: unit = "week"
        case .month: unit = "month"
        case .year: unit = "year"
        @unknown default: unit = ""
        }
        return "\(period.value) \(unit)"
    }
}
