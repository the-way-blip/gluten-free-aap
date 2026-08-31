import UIKit
import UniformTypeIdentifiers

/// "Share to Sift" — grabs the URL (or text) being shared from Instagram,
/// TikTok, Safari, Notes, etc., then hands it to the main app via the
/// `sift://import` URL scheme. The app's DeepLinks component routes it to the
/// Recipes page, which runs the gluten-free import automatically.
///
/// Kept deliberately UI-less: the extension shows a brief spinner, opens Sift,
/// and dismisses itself.
class ShareViewController: UIViewController {

    private let spinner = UIActivityIndicatorView(style: .large)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.98, green: 0.97, blue: 0.94, alpha: 1)
        spinner.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(spinner)
        NSLayoutConstraint.activate([
            spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])
        spinner.startAnimating()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        extractShared { [weak self] payload in
            guard let self else { return }
            var comps = URLComponents()
            comps.scheme = "sift"
            comps.host = "import"
            if let url = payload.url {
                comps.queryItems = [URLQueryItem(name: "url", value: url.absoluteString)]
            } else if let text = payload.text, !text.isEmpty {
                comps.queryItems = [URLQueryItem(name: "text", value: String(text.prefix(4000)))]
            }
            if let deepLink = comps.url {
                self.openMainApp(deepLink)
            }
            // Give the URL open a beat before we close.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
                self?.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
            }
        }
    }

    // MARK: - Reading the shared item

    private struct Payload { var url: URL?; var text: String? }

    private func extractShared(_ done: @escaping (Payload) -> Void) {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem] else { return done(Payload()) }
        let providers = items.flatMap { $0.attachments ?? [] }
        var payload = Payload()
        let group = DispatchGroup()

        for p in providers {
            if p.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                group.enter()
                p.loadItem(forTypeIdentifier: UTType.url.identifier) { item, _ in
                    if let u = item as? URL { payload.url = u }
                    else if let d = item as? Data, let s = String(data: d, encoding: .utf8), let u = URL(string: s) { payload.url = u }
                    group.leave()
                }
            } else if p.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                group.enter()
                p.loadItem(forTypeIdentifier: UTType.plainText.identifier) { item, _ in
                    if let s = item as? String {
                        // Captions often contain the post link; prefer that.
                        if let range = s.range(of: #"https?://\S+"#, options: .regularExpression),
                           let u = URL(string: String(s[range])) {
                            payload.url = payload.url ?? u
                        }
                        payload.text = s
                    }
                    group.leave()
                }
            }
        }
        // Fallback: some apps only put the link in the item's attributed text.
        if providers.isEmpty, let s = items.first?.attributedContentText?.string {
            payload.text = s
        }
        group.notify(queue: .main) { done(payload) }
    }

    // MARK: - Opening the containing app

    /// Extensions can't call UIApplication.shared directly; walk the responder
    /// chain to find it (a long-standing, App Review–safe pattern).
    private func openMainApp(_ url: URL) {
        var responder: UIResponder? = self
        let selector = sel_registerName("openURL:")
        while let r = responder {
            if r.responds(to: selector) && !(r is UIViewController) {
                r.perform(selector, with: url)
                return
            }
            responder = r.next
        }
    }
}
