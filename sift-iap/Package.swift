// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SiftIap",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "SiftIap",
            targets: ["SiftIapPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/facebook/facebook-ios-sdk.git", from: "17.0.0")
    ],
    targets: [
        .target(
            name: "SiftIapPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "FacebookCore", package: "facebook-ios-sdk")
            ],
            path: "ios/Sources/SiftIapPlugin")
    ]
)
